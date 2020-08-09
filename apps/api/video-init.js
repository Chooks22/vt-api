const { api_data, youtube, logger } = require('./consts');

let videosToUpdate;
let videoCount = 0;

module.exports = main;

async function main() {
  const videos = await api_data.videos
    .findAsCursor(
      { 'status': { $exists: 0 } },
      { '_id': 1 }
    )
    .map(video => video._id);

  videosToUpdate = videos.length;

  if (!videosToUpdate) {
    logger.api.videoInit('no videos to update!');
    return [];
  }

  logger.api.videoInit('found %d videos to update.', videosToUpdate);
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  while (videos.length) {
    const videoList = await fetchVideoData(videos.splice(0, 50));
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

function fetchVideoData(ids) {
  logger.api.videoInit('fetching %d videos of %d...', videoCount += ids.length, videosToUpdate);
  return youtube.videos
    .list({
      part: 'snippet,liveStreamingDetails',
      id: ids.join(','),
      fields: 'items(id,snippet(publishedAt,thumbnails/high/url),liveStreamingDetails(actualStartTime,actualEndTime,scheduledStartTime,concurrentViewers))',
      hl: 'ja'
    })
    .then(({ data }) => data.items.map(parseVideoData))
    .catch(({ message }) => {
      logger.api.videoInit('!!! threw an error: ', message);
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
