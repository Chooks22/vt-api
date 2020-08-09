require('dotenv').config({ path: '../../.env' });

const schedule = require('node-schedule');
const channelInfo = require('./channel-info');
const xmlCrawler = require('./xml-crawler');
const video = {
  live: require('./video-data-live'),
  info: require('./video-data-info')
};

module.exports = { init, main };

async function init() {
  const { logger } = require('./consts');
  /**
   * channel-feed-scraper
   *  executes:     on init
   *  runs:         one-time run for every channel
   *  function:     gets and saves channel's entire video list
   *  youtube?      yes
   *  quota:        per run: 1 quota
   *  additional:   runs varies per channel
   */// get all videos from every channel
  const channelScraper = require('./channel-scraper');
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
  const [videosUpdated = 0, missingVideos = 0] = await video.info.init();

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
   *                daily:   5 quota for 236 channels
   *  additional:   1 run for every 50 channels
   */
  schedule.scheduleJob('channel-info', '0 0 * * *', channelInfo);

  /**
   * video-info-live
   *  executes:     once every minute at 11-second mark
   *  runs:         once and gets 50 videos
   *  function:     updates video data
   *  youtube?      yes
   *  quota:        per run: 1 quota
   *                daily:   1440 quota
   */
  schedule.scheduleJob('video-data-live', '11 * * * * *', video.live);

  /**
   * video-info-data.main
   * executes:      once every minute at 9-second mark
   * runs:          once if new videos exist
   * function:      grab video stats
   * youtube?       yes
   * quota:         per run: 1 quota
   *                daily:   upto 1440 quota
   */
  schedule.scheduleJob('video-data-info', '9 * * * * *', video.info.main);

  /**
   * xml-crawler
   *  executes:     3 times every minute at 3, 5, and 7-second mark
   *  runs:         once and crawls 1/3 of all channels per run
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
