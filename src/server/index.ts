import { config } from 'dotenv';
config();

import { scheduleJob } from 'node-schedule';

export async function youtube() {
  const TIMINGS = {
    CHANNEL_UPDATER: process.env.TIMINGS_YOUTUBE_CHANNEL_UPDATER ?? '*/15 * * * *',
    VIDEO_UPDATER: process.env.TIMINGS_YOUTUBE_VIDEO_UPDATER ?? '5 * * * * *',
    XML_CRAWLER: process.env.TIMINGS_YOUTUBE_XML_CRAWLER ?? '1 * * * * *'
  };
  const [channel_updater, video_updater] = await Promise.all([
    import('./apis/youtube/channel-updater').then(api => api.default),
    import('./apis/youtube/video-updater').then(api => api.default),
    import('./apis/youtube/xml-crawler').then(api => api.init(TIMINGS.XML_CRAWLER)),
  ]);
  scheduleJob('api-youtube-channel-updater', TIMINGS.CHANNEL_UPDATER, channel_updater);
  scheduleJob('api-youtube-video_updater', TIMINGS.VIDEO_UPDATER, video_updater);
}

youtube();
