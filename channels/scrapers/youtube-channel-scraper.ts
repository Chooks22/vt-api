import database from '../../apps/apis/youtube/database-manager';
import { YoutubeVideoObject } from '../../apps/apis/youtube/types';
import { youtube } from '../../modules';
import { ChannelId, PlaylistItemsResource } from '../../modules/types/youtube';

export default async (channelId: ChannelId, organization: string): Promise<['FAIL'|'OK', number]> => {
  const channelVideoList = await scrapeChannel(channelId, organization);
  console.log(`Scraping youtube channel ${channelId}...`);
  if (!channelVideoList) {
    console.log(`Scraping failed for channel ${channelId}. Skipping...`);
    return ['FAIL', 0];
  }
  console.log(`Got ${channelVideoList.length} videos from ${channelId}.`);
  database.emit('save-videos', channelVideoList);
  database.emit('update-channel');
  return ['OK', channelVideoList.length];
};

async function listPlaylistItems(
  playlistId: string, organization: string, pageToken = ''
): Promise<any[]|[YoutubeVideoObject[], string, 'OK']> {
  console.log('Fetching playlist items from youtube...');
  const response = await youtube.playlistItems({
    part: 'snippet',
    fields: 'nextPageToken,items(snippet(channelId,title,resourceId/videoId))',
    playlistId,
    pageToken,
    maxResults: 50
  }).then(data => [
    data.items.map(item => parseVideos(item, organization)),
    data.nextPageToken,
    'OK'
  ]).catch(error => {
    console.error(error);
    return [];
  });
  console.log(`Fetched ${response.length} videos from playlist id: ${playlistId}.`);
  return response;
}

const parseVideos = (
  { snippet: { channelId, title, resourceId } }: PlaylistItemsResource,
  organization: string
): YoutubeVideoObject => ({
  _id: resourceId.videoId,
  platform: 'yt',
  channel: channelId,
  organization,
  title,
  updated_at: Date.now()
});

async function scrapeChannel(
  channelId: string, organization: string
): Promise<YoutubeVideoObject[]> {
  const videoList: YoutubeVideoObject[] = [];
  const playlistId = 'UU' + channelId.slice(2);
  const requestVideos = listPlaylistItems.bind(null, playlistId, organization);
  let videos = [], pageToken: string, status: 'OK';

  do {
    [videos = [], pageToken, status] = await requestVideos(pageToken);
    videoList.push(...videos);
    console.log(videoList.length);
  } while (pageToken && status === 'OK');

  if (status !== 'OK') {
    console.error('youtube threw an error. skipping.');
    return;
  } else { return videoList; }
}
