const { api_data, logger, TEMPLATE, CHANNEL_LIMIT } = require('./consts');
const axios = require('axios');

const baseURL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
const re = /<yt:videoId>(.*?)<\/yt:videoId>\s+\S+\s+<title>(.*?)<\/title>/gi;

module.exports = main;

async function main() {
  logger.api.xmlCrawler('fetching %d channels to crawl...', CHANNEL_LIMIT);
  logger.db.api_data('fetching %d channels...', CHANNEL_LIMIT);
  const channels = await api_data.channels
    .findAsCursor(
      { 'youtube': { $exists: 1 } },
      { 'youtube': 1, 'from': 1 })
    .sort({ 'crawled_at': 1 })
    .limit(CHANNEL_LIMIT)
    .toArray();

  logger.db.api_data('found %d channels', channels.length);
  if (!channels.length) {
    return logger.api.xmlCrawler('no channels to fetch');
  }

  // scrape channel xml feeds
  logger.api.helpers.xmlCrawler('crawling %d channels...', channels.length);
  const newData = await Promise.all(channels.map(fetchXML));

  // initialize bulk operators for channels and videos
  const bulkVideos = api_data.videos.initializeOrderedBulkOp();
  const bulkChannels = api_data.channels.initializeOrderedBulkOp();

  // update channel and add new videos to db
  const newVideos = newData.reduce((videoCount, [youtube, videos]) => {
    const initChannel = channels.find(channel => channel.youtube === youtube);
    const crawledAt = { $set: { 'crawled_at': Date.now() } };
    bulkChannels.find({ youtube }).updateOne(crawledAt);

    return videoCount += videos.map(video => bulkVideos
      .find({ '_id': video._id })
      .upsert()
      .updateOne({ $setOnInsert: {
        ...TEMPLATE,
        ...video,
        'group': initChannel.from
      } })
    ).length;
  }, 0);

  // write data to db
  await Promise.all([bulkVideos.execute(), bulkChannels.execute()]);
  logger.api.xmlCrawler('updated %d videos', newVideos);
  logger.db.api_data('updated %d videos from %d channels', newVideos, channels.length);
}

async function fetchXML({ youtube: channel }) {
  logger.api.helpers.xmlCrawler('crawling %s...', channel);

  const feed = await axios.get(baseURL + channel);
  const newVideos = [...feed.data.matchAll(re)].map(parseData);

  function parseData([, _id, title]) {
    return { _id, title, channel };
  }

  logger.api.helpers.xmlCrawler('crawled %d videos from %s', newVideos.length, channel);
  return [channel, newVideos];
}
