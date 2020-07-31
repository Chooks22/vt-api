const schedule = require('node-schedule');
const channelScraper = require('./channel-scraper');
const channelInfo = require('./channel-info');
const video = {
  live: require('./video-data-live'),
  info: require('./video-data-info')
};

init();

// If you want to adjust the timings, check the node-schedule format at https://www.npmjs.com/package/node-schedule
async function init() {
  /**
  * channel-feed-scraper
  *  executes:     on startup
  *  runs:         one-time run for every channel
  *  function:     gets and saves channel's entire video list
  *  youtube?      yes
  *  quota:        per run: 1 quota
  *  additional:   runs varies per channel
  *                important: wait for this to finish before running scrapers
  *                           to avoid conflict.
  */
  await channelScraper();

  /**
  * channel-info
  *  executes:     once every midnight
  *  runs:         once for all channels
  *  function:     updates channel's stats
  *  youtube?      yes
  *  quota:        per run: 1 quota
  *                daily:   6 quota for 268 channels
  *  additional:   1 run for every 50 channels
  */
  schedule.scheduleJob('channel-info', '0 0 * * *', channelInfo);

  /**
  * video-info-live
  *  executes:     once every minute at 7-second mark
  *  runs:         once and gets 50 videos
  *  function:     updates video data
  *  youtube?      yes
  *  quota:        per run: 1 quota
  *                daily:   1440 quota
  */
  schedule.scheduleJob('video-data-live', '7 * * * * *', video.live);

  /**
  * video-info-stats
  * executes:      once every minute at 3-second mark
  * runs:          once if new videos exist
  * function:      grab video stats
  * youtube?       yes
  * quota:         per run: 1 quota
  *                daily:   upto 1440 quota
  */
  schedule.scheduleJob('video-data-info', '3 * * * * *', video.info);

  /**
  * xml-crawler
  *  executes:     once every minute at 55-second mark
  *  runs:         once and cycles through each group
  *  function:     fetches latest videos
  *  youtube?      no
  *  additional:   please add google pubsub
  */
  require('./xml-crawler');

}

/**
 * QUOTA COST/DAY
 *  channel-scraper       - n/a
 *  channel-info          - 6
 *  video-data-live       - 1440
 *  video-info            - 1440
 *  xml-crawler           - N/A
 *  TOTAL ----------------- 2886
 */
