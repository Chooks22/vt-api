require('dotenv').config({ path: '../../.env' });
const { channels, api_data, logger, TEMPLATE } = require('./consts');
const schedule = require('node-schedule');
const axios = require('axios');

const baseURL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
const re = /<yt:videoId>(.*?)<\/yt:videoId>\s+\S+\s+<title>(.*?)<\/title>/gi;

const CHANNEL_LIMIT = +process.env.CRAWL_LIMIT || 10;

let index = 1, groups;

init();
async function init() {
  logger.api.xmlCrawler('started');
  const channelGroups = await channels.listCollections();
  groups = channelGroups.map(group => group.name);

  schedule.scheduleJob('55 * * * * *', findGroup);
}

function findGroup() {
  logger.api.xmlCrawler('finding group');
  index = --index || groups.length;
  main(groups[index - 1]);
}

async function main(group) {
  logger.db.channels('fetching %d channels from %s to be crawled', CHANNEL_LIMIT, group);
  const channelList = await channels[group]
    .findAsCursor({ 'crawled_at': { $exists: 1 } })
    .sort({ 'crawled_at': 1 })
    .limit(CHANNEL_LIMIT)
    .toArray();

  logger.db.channels('found %d channels', channelList.length);
  logger.api.xmlCrawler('crawling %d %s channels', channelList.length, group);

  const bulkChannels = channels[group].initializeUnorderedBulkOp();
  const bulkApiData = api_data.videos.initializeOrderedBulkOp();

  const newVideoData = await Promise.all(channelList.map(fetchXML));
  const newVideos = newVideoData.reduce(updateChannel, 0);

  function updateChannel(videoCount, [youtube, videos]) {
    const newData = { $set: { 'crawled_at': Date.now() } };
    bulkChannels.find({ youtube })
      .updateOne(newData);

    videos.map(video => bulkApiData
      .find({ '_id': video._id })
      .upsert()
      .updateOne({
        $set: { ...video, group },
        $setOnInsert: TEMPLATE
      })
    );

    return videoCount += videos.length;
  }

  logger.db.api_data('updating %d videos...', newVideos);
  const result = await bulkChannels.execute();
  const savedVideos = await bulkApiData.execute();
  logger.db.api_data('updated %d videos', savedVideos.nUpserted);
  logger.api.xmlCrawler('updated %d channels with %d videos', result.nUpserted, newVideos);
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
