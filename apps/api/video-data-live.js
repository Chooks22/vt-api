const { api_data, youtube, logger, ONE_HOUR } = require('./consts');

module.exports = main;

async function main() {
  logger.db.api_data('fetching videos...');
  const videos = await api_data.videos
    .findAsCursor({
      'published_at': { $ne: null },
      $or: [
        { 'status': 'live' },
        { 'status': 'upcoming', 'scheduled_time': { $lte: Date.now() + ONE_HOUR } },
        { 'status': null }
      ] })
    .sort({ 'updated_at': 1, 'scheduled_time': -1 })
    .limit(50)
    .map(video => video._id);

  logger.db.api_data('fetched %d videos', videos.length);
  if (!videos.length) {
    return logger.db.api_data('no videos to be updated');
  }

  const videoData = await fetchVideoData(videos);

  logger.api.videoLive('fetched %d videos', videoData.length);
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  videoData.map(video =>
    bulk.find({ '_id': video._id }).updateOne({ $set: video })
  );

  const result = await bulk.execute();
  logger.api.videoLive('updated %d new videos', result.nUpserted);
}

function fetchVideoData(ids) {
  logger.api.helpers.videoLive('fetching %d ids...', ids.length);
  return youtube.videos
    .list({
      part: 'liveStreamingDetails',
      fields: 'items(id,liveStreamingDetails(actualStartTime,actualEndTime,scheduledStartTime,concurrentViewers))',
      id: ids.join(','),
      hl: 'ja',
    })
    .then(({ data }) => data.items.map(parseVideoData))
    .catch(({ message: error }) => {
      logger.api.helpers.videoLive('!!! encountered an error: %s', error);
      return [];
    });
}

function parseVideoData({ id, liveStreamingDetails: details = {} }) {
  const { actualEndTime, actualStartTime, scheduledStartTime, concurrentViewers: viewers } = details;
  return {
    '_id': id,
    'scheduled_time': +new Date(scheduledStartTime) || null,
    'start_time': +new Date(actualStartTime) || null,
    'end_time': +new Date(actualEndTime) || null,
    'length': +new Date(actualEndTime) - +new Date(actualStartTime) || null,
    'viewers': viewers && +(+viewers).toPrecision(viewers.length > 3 ? 3 : 2),
    'status': getVideoStatus(details),
    'updated_at': Date.now()
  };
}

function getVideoStatus(details) {
  const { actualEndTime, actualStartTime, scheduledStartTime } = details;
  /* eslint-disable indent,no-multi-spaces */
  return actualEndTime      ? 'ended'    :
         actualStartTime    ? 'live'     :
         scheduledStartTime ? 'upcoming' :
                              'uploaded' ;
  /* eslint-enable indent,no-multi-spaces */
}
