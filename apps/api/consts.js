const { logger, youtube, mongo } = require('../../modules');

const CHANNEL_LIMIT = +process.env.CRAWL_LIMIT || 10;

const ONE_HOUR = 36e5;

const TEMPLATE = {
  'thumbnail': null,
  'published_at': null,
  'scheduled_time': null,
  'start_time': null,
  'end_time': null,
  'length': null,
  'viewers': null,
  'status': null,
  'updated_at': null
};

module.exports = {
  ...mongo,
  logger,
  youtube,
  TEMPLATE,
  ONE_HOUR,
  CHANNEL_LIMIT
};
