import { EventEmitter } from 'events';
import { YoutubeChannelData, YoutubeVideoObject } from '../apis/youtube/types';
import { debug } from '../../modules';
import * as db from '../../database';

const logger = debug('apis:youtube:database-manager');

interface DatabaseEvents {
  'save-videos': (newVideos: YoutubeVideoObject[]) => void;
  'update-videos': (videos: YoutubeVideoObject[]) => void;
  'update-channels': (channels: YoutubeChannelData[]) => void;
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
  logger.log(`Saving ${newVideos.length} videos...`);
  const results = await Promise.all(newVideos
    .map(video => db.Videos.updateOne(
      { _id: video._id },
      { $setOnInsert: video },
      { upsert: true }
    ))
  ).then(writeResults => writeResults.reduce(
    (total, result) => total + (result.upserted?.length ?? 0), 0)
  ).catch(logger.error);
  if (!isNaN(results)) logger.log(`Finished saving ${results} videos.`);
});

database.on('update-videos', async videos => {
  logger.log(`Updating ${videos.length} videos...`);
  const results = await Promise.all(videos
    .map(video => db.Videos.updateOne(
      { _id: video._id },
      { $set: video }
    ))
  ).then(writeResults => writeResults.reduce(
    (total, result) => total + result.nModified, 0)
  ).catch(logger.error);
  if (results) logger.log(`Updated ${results} videos.`);
});

database.on('update-channels', async channels => {
  logger.log(`Updating ${channels.length} youtube channels...`);
  const results = await Promise.all(channels
    .map(channel => db.Channels.updateOne(
      { channel_id: channel.channel_id },
      { $set: channel }
    ))
  ).then(writeResults => writeResults.reduce(
    (total, result) => total + result.nModified, 0)
  ).catch(logger.error);
  if (!isNaN(results)) logger.log(`Updated ${results} channels.`);
});
