import { config } from 'dotenv';
config();

import { youtube } from '../../../modules';
const channel = 'UCXTpFs_3PqI41qX2d9tL2Rw';
const search = (playlistId: string, pageToken = '') => youtube.playlistItems({
  part: 'snippet',
  fields: 'nextPageToken,items(snippet(channelId,title,resourceId/videoId))',
  playlistId,
  pageToken,
  maxResults: 50,
  hl: 'ja'
}).then(data => [
  data.items.map(parseVideos),
  data.nextPageToken,
  'OK'
]).catch(error => {
  console.error(error);
  return [];
});

const parseVideos = ({ snippet: { channelId, title, resourceId } }) => ({
  _id: resourceId.videoId,
  title,
  channel: channelId
});

async function scrape(channelId: string) {
  const videoList = [];
  const playlistId = 'UU' + channelId.slice(2);

  let [videos = [], pageToken, status] = await search(playlistId);
  videoList.push(...videos);
  console.log(videoList.length);

  while (pageToken) {
    [videos = [], pageToken, status] = await search(playlistId, pageToken);
    videoList.push(...videos);
    console.log(videoList.length);
  }

  if (status !== 'OK') {
    console.error('youtube threw an error. skipping.');
    return;
  }

  return videoList;
}

scrape(channel).then(data => console.log(data, data.length));
