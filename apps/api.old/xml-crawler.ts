import { api_data, logger, memcache, TEMPLATE } from './consts';
import schedule from 'node-schedule';
import node_fetch from 'node-fetch';

const fetch = url => node_fetch(url).then(res => res.text());
const re = /<yt:videoId>(.*)<.*\n.*<yt:channelId>(.*)<.*\n.*<title>(.*)<\/title>(?:\n.*){0,10}<published>(.*)</g;

export function init() {
  api_data.channels
    .findAsCursor(
      { 'youtube': { $exists: 1 } },
      { 'youtube': 1, 'from': 1 }
    )
    .forEach(createJob);
}

/**
 * Fetches XML feed from youtube and checks for new videos.
 *
 * @param {{youtube: String, from: String}} data    - channel data
 */
async function crawl({ youtube, from }) {
  const xmlFeeds = await fetch(getXMLLink(youtube));
  const videoFeeds = parseXML(xmlFeeds);

  const latestTimestamp = await memcache.get(youtube) || 0;
  const newEntries = videoFeeds.filter(feed =>
    feed.timestamp > latestTimestamp
  );

  if (!newEntries.length) return;

  logger.api.xmlCrawler('found %d new videos from %s', newEntries.length, youtube);
  memcache.save(youtube, newEntries[0].timestamp, process.env.TTL_LONG ?? 900);
  saveVideos(youtube, from, newEntries);
}

/**
 * Saves videos to db and updates channel
 *
 * @param {String}    youtube
 * @param {String}    group
 * @param {{}[]}      videos
 */
function saveVideos(youtube, group, videos) {
  logger.db.api_data('updating %d videos from %s...', videos.length, youtube);
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  // assign write ops to db
  videos.forEach(video => bulk
    .find({ '_id': video._id })
    .upsert()
    .updateOne(delete video.timestamp &&
      { $setOnInsert: { ...TEMPLATE, ...video, group } }
    )
  );

  // write videos to db and log results
  bulk.execute().then(results => logger.db.api_data(
    'sucessfully added %d videos from %s at %s.',
    results.nUpserted,
    youtube,
    new Date().toLocaleString('en-GB')
  ));
}

function getXMLLink(id) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${id}&t=${Date.now()}`;
}

function createJob(data) {
  return schedule.scheduleJob('1 * * * * *', crawl.bind(null, data));
}

function parseXML(xml) {
  return [...xml.matchAll(re)].map(parseData).sort(sortByDate);
}

function parseData([, _id, channel, title, date]) {
  return { _id, title, channel, 'timestamp': +new Date(date) / 1000 };
}

function sortByDate(latest, older) {
  return older.timestamp - latest.timestamp;
}
