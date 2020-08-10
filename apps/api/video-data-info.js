const { api_data, youtube, logger, TEMPLATE } = require('./consts');

logger.app('started video-data-info');

module.exports = { main, init };

async function main() {
  logger.api.videoInfo('fetching new video data...');
  logger.db.api_data('fetching blank videos...');
  const blankVideos = await api_data.videos
    .findAsCursor({ 'status': null, 'published_at': null })
    .limit(50)
    .map(video => video._id);

  if (!blankVideos.length) {
    logger.db.api_data('found no new videos.');
    logger.api.videoInfo('no new videos to update. skipping for now...');
    return;
  } else {
    logger.db.api_data('fetched %d videos.', blankVideos.length);
    logger.api.videoInfo('found %d videos to update.', blankVideos.length);
  }

  // fetch data from youtube api
  logger.api.videoInfo('updating %d videos...', blankVideos.length);
  const newVideoData = await fetchVideoData(blankVideos);
  logger.api.helpers.videoInfo('fetched %d new video data', newVideoData.length);

  // initialize bulk operator
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  // assign a write op for each video
  blankVideos.forEach(_id => {
    const newVideo = newVideoData.find(data => data._id === _id);
    bulk.find({ _id }).updateOne({ $set: newVideo || {
      ...TEMPLATE,
      'status': 'missing',
      'updated_at': Date.now()
    } });
  });

  // write to db and log results
  const result = await bulk.execute();
  logger.api.videoInfo('updated %d new videos', result.nUpserted);
}

async function init() {
  let videoCount = 0;
  const videos = await api_data.videos
    .findAsCursor(
      { 'status': { $exists: 0 } },
      { '_id': 1 }
    )
    .map(video => video._id);

  const videosToUpdate = videos.length;

  if (!videosToUpdate) {
    logger.api.videoInit('no videos to update!');
    return [];
  }

  logger.api.videoInit('found %d videos to update.', videosToUpdate);
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  while (videos.length) {
    const videoBatch = videos.splice(0, 50);
    logger.api.videoInit(
      'fetching %d videos of %d...',
      videoCount += videoBatch.length,
      videosToUpdate
    );

    const videoList = await fetchVideoData(videoBatch);
    logger.api.videoInit('fetched %d videos.', videoList.length);
    videoList.forEach(video => bulk
      .find({ '_id': video._id })
      .updateOne({ $set: video })
    );
  }

  const results = await bulk.execute();
  logger.db.api_data('updated %d of %d videos.', results.nUpserted, videosToUpdate);

  const missingVideos = videosToUpdate - results.nUpserted;
  if (missingVideos) {
    logger.api.videoInit('couldn\'t update %d missing videos.', missingVideos);
  }

  return [results.nUpserted, missingVideos];
}

function fetchVideoData(videos) {
  logger.api.helpers.videoInfo('fetching %d ids...', videos.length);
  return youtube
    .videos({
      part: 'snippet,liveStreamingDetails',
      fields: 'items(id,snippet(publishedAt,thumbnails/high/url),liveStreamingDetails(actualStartTime,actualEndTime,scheduledStartTime,concurrentViewers))',
      id: videos.join(','),
      hl: 'ja'
    })
    .then(data => data.items.map(parseVideoData))
    .catch(({ message: error }) => {
      logger.api.helpers.videoInfo('!!! encountered an error: %s', error);
      return [];
    });
}

function parseVideoData({ id, snippet, liveStreamingDetails: stream = {} }) {
  const { publishedAt, thumbnails } = snippet;
  const { actualStartTime, actualEndTime, scheduledStartTime, concurrentViewers: viewers } = stream;
  return {
    '_id': id,
    'thumbnail': thumbnails.high.url,
    'published_at': +new Date(publishedAt),
    'scheduled_time': +new Date(scheduledStartTime) || null,
    'start_time': +new Date(actualStartTime) || null,
    'end_time': +new Date(actualEndTime) || null,
    'length': +new Date(actualEndTime) - +new Date(actualStartTime) || null,
    'viewers': viewers && +(+viewers).toPrecision(viewers.length > 3 ? 3 : 2),
    'status': getVideoStatus(stream),
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
