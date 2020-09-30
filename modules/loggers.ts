import debug from 'debug';

export const app = debug('app');

export const db = debug('db:mongo');

export const routes = {
  channels: debug('routes:channels/'),
  videos: debug('routes:videos/'),
  live: debug('routes:live/'),
  helpers: {
    live: debug('helper:live/')
  }
};

export const api = {
  xmlCrawler: debug('api:xmlCrawler()'),
  channelInfo: debug('api:channelInfo()'),
  channelScraper: debug('api:channelScraper()'),
  videoInfo: debug('api:videoInfo()'),
  videoLive: debug('api:videoLive()'),
  videoInit: debug('api:videoInit()'),
  helpers: {
    xmlCrawler: debug('helper:xmlCrawler()'),
    channelInfo: debug('helper:channelInfo()'),
    channelScraper: debug('helper:channelScraper()'),
    videoInfo: debug('helper:videoInfo()'),
    videoLive: debug('helper:videoLive()')
  }
};
