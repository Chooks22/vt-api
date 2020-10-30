import { debug, Members, youtube } from '../../../modules';
import database from '../../database-managers/youtube';
import { ChannelResource, YoutubeChannelData, YoutubeChannelId } from './types';

const logger = debug('api:youtube:channel-updater');

export default async function() {
  const memberList = await Members
    .find({ platform_id: 'yt' })
    .then(channelList => channelList.map(channel => channel.channel_id));
  const youtubeRequests: Promise<YoutubeChannelData[]>[] = [];
  while (memberList.length) youtubeRequests.push(fetchYoutubeChannel(memberList.splice(0, 50)));
  const updatedChannelData = await Promise.all(youtubeRequests);
  database.emit('update-channels', updatedChannelData.flat());
}

async function fetchYoutubeChannel(channelIds: YoutubeChannelId[]): Promise<YoutubeChannelData[]> {
  logger.info(`Requesting channel data from ${channelIds.length} channels from youtube...`);
  const results = await youtube.channels({
    part: 'snippet,statistics',
    fields: 'items(id,snippet(title,description,thumbnails/high/url,publishedAt),statistics(subscriberCount,videoCount,viewCount))',
    id: channelIds.join(',')
  }).then(data => data.items.map(parseYoutubeChannelData))
    .catch(err => {
      logger.error(err);
      return [];
    });
  logger.info(`Got ${results.length} channels back from youtube.`);
  return results;
}

const parseYoutubeChannelData = (
  { id, snippet, statistics }: ChannelResource
): YoutubeChannelData => {
  const { title, publishedAt, description, thumbnails } = snippet ?? {};
  const { subscriberCount, videoCount, viewCount } = statistics ?? {};
  return {
    channel_id: id,
    channel_name: title,
    channel_stats: {
      published_at: +new Date(publishedAt),
      subscribers: +subscriberCount || 0,
      videos: +videoCount,
      views: +viewCount
    },
    description,
    thumbnail: thumbnails.high.url
  };
};
