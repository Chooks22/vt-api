const { api_data, youtube, logger, TEMPLATE } = require('./consts');

logger.api.videoInfo('started');

module.exports = main;

async function main() {
  logger.api.videoInfo('fetching new video data...');
  logger.db.api_data('fetching blank videos...');
  const blankVideos = await api_data.videos
    .findAsCursor({ 'status': null, 'published_at': null })
    .limit(50)
    .toArray();

  logger.db.api_data('fetched %d videos', blankVideos.length);
  if (!blankVideos.length) {
    return logger.db.api_data('found no new videos');
  }

  // extract video ids and run through youtube
  const videoIDs = blankVideos.map(video => video._id);
  const newVideoData = await fetchVideoData(videoIDs);
  logger.api.videoInfo('fetched %d new video data', newVideoData.length);

  // initialize bulk operator
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  // assign a write op for each video
  videoIDs.map(_id => {
    const newVideo = newVideoData.find(data => data._id === _id);
    bulk.find({ _id }).updateOne({ $set: newVideo || {
      TEMPLATE,
      'status': 'missing',
      'updated_at': Date.now()
    } });
  });

  // write to db and log results
  const result = await bulk.execute();
  logger.api.videoInfo('updated %d new videos', result.nUpserted);
}

function fetchVideoData(videos) {
  logger.api.helpers.videoInfo('fetching %d ids...', videos.length);
  return youtube.videos
    .list({
      part: 'snippet',
      fields: 'items(id,snippet(publishedAt,thumbnails/high/url))',
      id: videos.join(','),
      hl: 'ja',
    })
    .then(({ data }) => data.items.map(parseVideoData))
    .catch(({ message: error }) => {
      logger.api.helpers.videoInfo('!!! encountered an error: %s', error);
      return [];
    });
}

function parseVideoData({ id, snippet }) {
  const { publishedAt, thumbnails } = snippet;
  return {
    '_id': id,
    TEMPLATE,
    'thumbnail': thumbnails.high.url,
    'published_at': +new Date(publishedAt),
    'updated_at': Date.now()
  };
}
