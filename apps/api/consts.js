const { logger, youtube, mongo, memcache } = require('../../modules');

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
  memcache,
  TEMPLATE,
  ONE_HOUR
};
