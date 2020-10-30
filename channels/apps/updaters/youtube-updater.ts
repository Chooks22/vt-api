import { ChannelObject } from '../../../database/types/channels';
import { MemberProps } from '../../../database/types/members';
import { youtube } from '../../../modules';
import debug from '../../../modules/logger';
import { ChannelResource } from '../../../modules/types/youtube';
import database from '../database-manager';

const logger = debug('api:youtube');

export default async function(channelData: MemberProps[]) {
  const youtubeRequests: Promise<ChannelObject[]>[] = [];
  while (channelData.length) {
    youtubeRequests.push(fetchChannelData(channelData.splice(0, 50)));
  }
  const newVideos = (await Promise.all(youtubeRequests)).flat();
  database.emit('update-channels', newVideos);
}

async function fetchChannelData(channels: MemberProps[]) {
  logger.info(`Requesting ${channels.length} youtube channel data from youtube...`);
  const results = await youtube.channels({
    part: 'snippet,statistics',
    fields: 'items(id,snippet(title,publishedAt,description,thumbnails/high/url),statistics(subscriberCount,videoCount,viewCount))',
    id: channels.map(channel => channel.channel_id).join(','),
    hl: 'ja'
  }).then(data => data.items.map(item => {
    const memberData = channels.find(channel => channel.channel_id === item.id);
    return parseAndMergeChannelData(item, memberData);
  })).catch(err => {
    logger.error(err);
    return [] as ChannelObject[];
  });
  logger.info(`Got ${results.length} results.`);
  return results;
}

const parseAndMergeChannelData = (
  { snippet, statistics }: ChannelResource,
  memberData: MemberProps
): ChannelObject => ({
  _id: memberData._id,
  name: memberData.name,
  organization: memberData.organization,
  platform_id: 'yt',
  channel_name: snippet.title,
  channel_id: memberData.channel_id,
  channel_stats: {
    published_at: +new Date(snippet.publishedAt),
    subscribers: +statistics.subscriberCount || 0,
    videos: +statistics.videoCount,
    views: +statistics.viewCount
  },
  description: snippet.description,
  thumbnail: snippet.thumbnails.high.url
});
