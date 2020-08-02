const { api_data, logger, memcache, sanitizeRegex, templates, defaults } = require('../consts');
module.exports = { getLiveVideos };

/**
 * Parses queries and returns the appropriate videos.
 *
 * @param   {Object} req.query
 *
 * @returns {Object} Videos
 */
async function getLiveVideos({ status: queryStatus = '', group = '', title = '' }) {
  const statuses = queryStatus.toLowerCase().split(',').filter(isValidStatus);
  const statusQuery = statuses.length ? statuses : defaults.live.validStatus;

  logger.routes.helpers.live('finding videos%s marked as %s',
    group ? ` from ${group}` : '',
    statusQuery.join(', ')
  );

  // find key in cache
  const groupStatus = statusQuery.map(status => `${group}_${status}`);
  const videos = groupStatus.length && !title
    ? await memcache.getMultiVideos(groupStatus)
    : { };

  const cachedKeys = Object.keys(videos);
  cachedKeys.length && logger.routes.helpers.live('found %s in cache', cachedKeys.join(', '));

  // check for uncached keys and fetch data from db
  const uncached = statusQuery.filter(status => !videos[status]);
  if (uncached.length) {
    Object.assign(videos, await fetchVideosFromDb(uncached, group, title));
  }

  // save uncached data and return video list
  !title && uncached.map(key => memcache.save(`${group}_${key}`, videos[key], 20));
  logger.routes.helpers.live('found %d videos', getVideoCount(videos));
  return videos;
}

/**
 * Fetches uncached videos from database
 *
 * @param {String[]}  status
 * @param {String}    group
 * @param {String}    title
 *
 * @returns {Object}  Found videos
 */
async function fetchVideosFromDb(status, group, title) {
  logger.db.api_data('finding videos marked as %s', status.join(', '));
  const videos = mapAndMergeObject({}, status, key => ({ [key]: [] }));
  const results = await api_data.videos
    .findAsCursor(
      {
        'group': group || /.*/,
        'title': sanitizeRegex(title),
        $or: status.map(key => defaults.live.dbQueries(Date.now())[key])
      },
      { 'updated_at': 0 }
    )
    .sort({ 'scheduled_time': 1 })
    .map(video => videos[video.status].push(templates.videoFields(video)));

  logger.db.api_data('found %d videos from db', results.length);
  return videos;
}

function isValidStatus(status) {
  return defaults.live.validStatus.includes(status);
}

function getVideoCount(videos) {
  return Object.values(videos).reduce((total, { length }) => total + length, 0);
}

function mapAndMergeObject(target, source, func) {
  return Object.assign(target, ...(func ? source.map(func) : source));
}
