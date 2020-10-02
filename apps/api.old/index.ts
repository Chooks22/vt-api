import { config } from 'dotenv';
config({ path: '../../.env' });

import schedule from 'node-schedule';
import channelInfo from './channel-info';
import video_live from './video-data-live';
import * as video_info from './video-data-info';
import * as xmlCrawler from './xml-crawler';

module.exports = { init, main };

async function init() {
  const { logger, youtube } = await require('./consts');

  // check if youtube api key is valid
  if (!await youtube.validateKey()) {
    return logger.app('Stopping!!! Invalid Youtube API key. Please configure your .env file first.');
  }

  // drop collection if collection exists
  // logger.db.api_data(await api_data.channels.drop()
  //   .then(() => 'dropped channels collection.')
  //   .catch(() => 'channels collection not dropped. doesn\'t exists.')
  // );

  /**
   * channel-feed-scraper
   *  executes:     on init
   *  runs:         one-time run for every channel
   *  function:     gets and saves channel's entire video list
   *  youtube?      yes
   *  quota:        per run: 1 quota
   *  additional:   runs varies per channel
   */// get all videos from every channel
  const channelScraper = await require('./channel-scraper');
  const [channelsUpdated = 0, channelCount = 0] = await channelScraper();

  // update channels list for the first time
  const channelInfos = await channelInfo();

  /**
   * video-data-info.init
   *  executes:    on init
   *  runs:        once for every 50 blank videos
   *  function:    gets video info of every blank video
   *  youtube?     yes
   *  quota:       per run: 1 quota
   *  additional:  1 run for every 50 blank videos
   */// update all blank videos
  const [videosUpdated = 0, missingVideos = 0] = await video_info.init();

  console.log();
  logger.api.channelScraper('updated %d out of %d channels', channelsUpdated, channelCount);
  logger.api.channelInfo('got info for %d channels', channelInfos);
  logger.api.videoInit('updated %d videos, missed %d', videosUpdated, missingVideos);
  logger.app('done! you can now start the api with \'npm start\'.');

  process.exit();
}

// If you want to adjust the timings, check the node-schedule format at https://www.npmjs.com/package/node-schedule
function main() {
  /**
   * channel-info
   *  executes:     once every midnight
   *  runs:         once for all channels
   *  function:     updates channel's stats
   *  youtube?      yes
   *  quota:        per run: 1 quota
   *                daily:   6 quota for 256 channels
   *  additional:   1 run for every 50 channels
   */
  schedule.scheduleJob('channel-info', '0 0 * * *', channelInfo);

  /**
   * video-info-live
   *  executes:     once every minute at 6-second mark
   *  runs:         once and gets 50 videos
   *  function:     updates video data
   *  youtube?      yes
   *  quota:        per run: 1 quota
   *                daily:   1440 quota
   */
  schedule.scheduleJob('video-data-live', '6 * * * * *', video_live);

  /**
   * video-info-data.main
   * executes:      once every minute at 4-second mark
   * runs:          once if new videos exist
   * function:      grab video stats
   * youtube?       yes
   * quota:         per run: 1 quota
   *                daily:   upto 1440 quota
   */
  schedule.scheduleJob('video-data-info', '4 * * * * *', video_info.main);

  /**
   * xml-crawler
   *  executes:     once every minute at 1-second mark
   *  runs:         once and crawls every channels
   *  function:     fetches latest videos
   *  youtube?      no
   */
  xmlCrawler.init();

}

/**
 * QUOTA COST/DAY
 *  channel-scraper       - n/a
 *  channel-info          - 5
 *  video-data-live       - 1440
 *  video-data-info       - 1440
 *  xml-crawler           - N/A
 *  TOTAL ----------------- 2885
 */
