const debug = require('debug');

module.exports = {
  app: debug('app'),
  db: {
    channels: debug('db:channels'),
    api_data: debug('db:api_data'),
  },
  routes: {
    channels: debug('routes:channels/'),
    videos: debug('routes:videos/'),
    live: debug('routes:live/'),
    helpers: {
      live: debug('helper:live/')
    }
  },
  api: {
    xmlCrawler: debug('api:xmlCrawler()'),
    channelInfo: debug('api:channelInfo()'),
    channelScraper: debug('api:channelScraper()'),
    videoInfo: debug('api:videoInfo()'),
    videoLive: debug('api:videoLive()'),
    helpers: {
      xmlCrawler: debug('helper:xmlCrawler()'),
      channelInfo: debug('helper:channelInfo()'),
      channelScraper: debug('helper:channelScraper()'),
      videoInfo: debug('helper:videoInfo()'),
      videoLive: debug('helper:videoLive()')
    }
  }
};
