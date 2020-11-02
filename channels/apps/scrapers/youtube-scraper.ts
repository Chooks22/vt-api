import { PlaylistItemsResource, VideoResource, YoutubeVideoObject } from '../../../apps/apis/youtube/types';
import { getVideoStatus } from '../../../apps/apis/youtube/video-updater';
import { MemberObject } from '../../../database/types/members';
import { debug, youtube } from '../../../modules';
import database from '../database-manager';

const logger = debug('api:youtube');
const playlistList = logger.extend('playlistList');
const videoList = logger.extend('videoList');

export default async function(channelData: MemberObject): Promise<['FAIL'|'OK', number]> {
  const { channel_id, organization } = channelData;
  logger.info(`Scraping youtube channel ${channel_id}...`);
  const channelVideoList = await scrapeChannel(channel_id, organization);
  if (!channelVideoList) {
    logger.error(`Failed to scrape youtube channel ${channel_id}. Skipping...`);
    return ['FAIL', 0];
  }
  logger.info(`Got ${channelVideoList.length} videos from ${channel_id}`);
  database.emit('save-videos', channelVideoList);
  database.emit('update-member', { channel_id, crawled_at: Date.now() });
  return ['OK', channelVideoList.length];
}

async function listPlaylistItems(
  playlistId: string, pageToken = ''
): Promise<[PlaylistItemsResource[], string, 'OK']> {
  playlistList.info('Fetching playlist items from youtube...');
  const response = await youtube.playlistItems({
    part: 'snippet',
    fields: 'nextPageToken,items(snippet(channelId,title,resourceId/videoId))',
    playlistId,
    pageToken,
    maxResults: 50
  }).then(data => [
    data.items,
    data.nextPageToken,
    'OK'
  ]).catch(error => {
    playlistList.error(error);
    return <any>[[]];
  });
  playlistList.info(`Fetched ${response[0].length} videos from playlist id: ${playlistId}.`);
  return response;
}

async function listVideos(
  items: PlaylistItemsResource[],
  organization: string
): Promise<YoutubeVideoObject[]> {
  videoList.info(`Fetching ${items.length} video data from youtube...`);
  const results = await youtube.videos({
    part: 'snippet,liveStreamingDetails',
    fields: 'items(id,snippet(channelId,title,publishedAt),liveStreamingDetails(scheduledStartTime,actualStartTime,actualEndTime,concurrentViewers))',
    id: items.map(item => item.snippet.resourceId.videoId).join(','),
    hl: 'ja'
  }).then(data => data.items.map(item => parseVideos(item, organization)))
    .catch(err => { throw err; });
  videoList.info(`Fetched ${results.length} video data.`);
  return results;
}

function parseVideos(
  { id, snippet, liveStreamingDetails }: VideoResource,
  organization: string
): YoutubeVideoObject {
  const { channelId, title, publishedAt } = snippet ?? {};
  const { scheduledStartTime, actualStartTime, actualEndTime, concurrentViewers } = liveStreamingDetails ?? {};
  return {
    _id: id,
    platform_id: 'yt',
    channel_id: channelId,
    organization,
    title,
    time: {
      published: +new Date(publishedAt),
      scheduled: +new Date(scheduledStartTime) || null,
      start: +new Date(actualStartTime) || null,
      end: +new Date(actualEndTime) || null
    },
    status: getVideoStatus(liveStreamingDetails),
    viewers: +concurrentViewers || null,
    updated_at: Date.now()
  };
}

async function scrapeChannel(channelId: string, organization: string) {
  let playlistVideoList: PlaylistItemsResource[] = [], nextPageToken: string, status: 'OK';
  const youtubeVideos: Promise<YoutubeVideoObject[]>[] = [];
  const playlistId = 'UU' + channelId.slice(2);
  const requestPlaylist: (pageToken: string) => Promise<[PlaylistItemsResource[], string, 'OK']> = listPlaylistItems.bind(null, playlistId);
  const fetchVideos = async (videos: PlaylistItemsResource[]) => youtubeVideos.push(listVideos(videos, organization));

  do {
    [playlistVideoList = [], nextPageToken, status] = await requestPlaylist(nextPageToken);
    fetchVideos(playlistVideoList);
    logger.log(`Current video count: ${youtubeVideos.length}`);
  } while (nextPageToken && status === 'OK');

  if (status !== 'OK') {
    logger.error('youtube threw an error. skipping.');
  } else { return (await Promise.all(youtubeVideos)).flat(); }
}
