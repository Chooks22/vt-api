import { EventEmitter } from 'events';
import * as db from '../../database';
import { ChannelObject } from '../../database/types/channels';
import { MemberObject } from '../../database/types/members';
import { VideoObject } from '../../database/types/videos';
import debug from '../../modules/logger';

const logger = debug('channels:database-manager');

interface DatabaseEvents {
  'save-videos': (newVideos: VideoObject[]) => void;
  'update-channels': (
    channels: ChannelObject[],
    res: (value: unknown) => any,
    rej: (reason?: any) => any
  ) => void;
  'update-member': (channels: MemberObject) => void;
}

declare interface DatabaseManager {
  on<U extends keyof DatabaseEvents>(
    event: U, listener: DatabaseEvents[U]
  ): this;
  emit<U extends keyof DatabaseEvents>(
    event: U, ...args: Parameters<DatabaseEvents[U]>
  ): boolean;
}

class DatabaseManager extends EventEmitter { constructor() { super(); } }
const database = new DatabaseManager();
export default database;

database.on('save-videos', async newVideos => {
  logger.info(`Saving ${newVideos.length} videos...`);
  const result = await db.Videos.create(newVideos)
    .catch(err => logger.error(err));
  if (!result) return;
  logger.info(`Finished saving ${result.length} videos.`);
});

database.on('update-channels', async (channelData, res, rej) => {
  logger.info(`Updating ${channelData.length} channels...`);
  const results = await Promise.all(channelData
    .map(channel => db.Channels.updateOne(
      { _id: channel._id },
      { $set: channel },
      { upsert: true }
    ))).then(writeResults => writeResults.reduce(
    (total, result) => total + result.nModified, 0)
  ).catch(err => logger.error(err));
  if (isNaN(results)) return rej();
  logger.info(`Updated ${results} channels.`);
  res(results);
});

database.on('update-member', channelData => {
  const { channel_id } = channelData;
  logger.info(`Updating member data for ${channel_id}...`);
  db.Members.updateOne(
    { channel_id },
    { $set: channelData }
  ).then(result => logger.info(result.nModified
    ? `Updated member: ${channel_id}.`
    : `No new data for ${channel_id}.`
  )).catch(err => logger.error(err, `channel_id: ${channel_id}`));
});
