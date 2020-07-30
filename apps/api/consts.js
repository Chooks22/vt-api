const { logger, youtube, mongo } = require('../../modules');

const TEMPLATE = {
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
  TEMPLATE
};
