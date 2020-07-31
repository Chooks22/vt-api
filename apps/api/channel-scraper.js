const { channels, api_data, logger, youtube } = require('./consts');
const schedule = require('node-schedule');

let timesRan = 0;
let retries = 0;

module.exports = init;

async function init() {
  logger.api.channelScraper('running...');

  // get group list
  const channelGroups = await channels.listCollections();
  const groups = channelGroups.map(group => group.name);
  let index = 1;

  // loop through groups
  while (groups.length && retries < 4) {
    index = --index || groups.length;
    const result = await main(groups[index - 1]);
    groups.splice(index - 1, result);
  }

  // retry again at midnight PST after youtube quota resets.
  // another possibilty of failure is getting disconnected from the internet,
  // in that case just manually restart.
  if (retries > 4) {
    logger.api.channelScraper('max retries reached! retrying again after quota resets.');
    return retry('reschedule channel-scraper');
  }

  logger.api.channelScraper('done! youtube:playlistItems ran %d times', timesRan);
}

async function main(group) {
  logger.db.channels('looking for unscraped channels in %s...', group);
  const uncrawledChannel = await channels[group].findOne({
    'youtube': { $exists: 1 },
    'crawled_at': { $exists: 0 }
  });

  if (!uncrawledChannel) {
    logger.api.channelScraper('no channels from %s to be scraped', group);
    return true; // this will delete the group from the list
  }
  logger.api.channelScraper('scraping channel: %s', uncrawledChannel.youtube);

  // convert channel ID to playlist ID and run through youtube api
  const uploadsId = 'UU' + uncrawledChannel.youtube.slice(2);
  const channelVideos = await crawlChannelVideos(uploadsId);

  // throw results if null
  if (!channelVideos) {
    retries++;
    return logger.api.channelScraper('youtube api threw an error! stopping for now.');
  }

  // initialize some bulk operators
  const parsedVideos = channelVideos.map(video => parseData(video, group));
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  // assign a write op for each video
  parsedVideos.map(video =>
    bulk.find({ '_id': video._id }).upsert().updateOne(video)
  );

  // write to db
  const result = await bulk.execute();
  logger.api.channelScraper(`crawled ${result.nUpserted} new videos`);

  // mark channel as crawled
  channels[group].update(uncrawledChannel,
    { $set: { 'crawled_at': Date.now() } }
  );

  // log results
  logger.db.channels('updated %s from %s at %s', uncrawledChannel.youtube, group, new Date);
  logger.api.channelScraper('ran youtube:playlistItems %d times', timesRan);
}

function videoFetcher(playlistId, pageToken) {
  logger.api.helpers.channelScraper('fetching playlist %s with token %s', playlistId, pageToken);
  timesRan++;
  return youtube.playlistItems
    .list({
      part: 'id,snippet',
      fields: 'nextPageToken,items(snippet(channelId,title,resourceId/videoId))',
      playlistId,
      maxResults: 50,
      pageToken,
      hl: 'ja',
    })
    .then(({ data }) => [data.items, data.nextPageToken, 'ok'])
    .catch(({ message }) => {
      logger.api.helpers.channelScraper('threw an error: %s', message);
      return [[]];
    });
}

async function crawlChannelVideos(uploadsId) {
  const results = [];
  const search = token => videoFetcher(uploadsId, token);
  const countVideos = () => logger.api.helpers.channelScraper('video count: %d', results.length);

  let [items, pageToken, status] = await search();
  results.push(...items);
  countVideos();

  while (pageToken && status === 'ok') {
    [items, pageToken, status] = await search(pageToken);
    results.push(...items);
    countVideos();
  }

  if (status !== 'ok') return;

  logger.api.helpers.channelScraper('done! found %s videos', results.length);
  return results;
}

function parseData({ snippet }, group) {
  const { resourceId: { videoId: _id },
    channelId: channel, title } = snippet;

  return { _id, title, channel, group };
}

function retry(description) {
  // this is tied to the timezone!
  // if you changed timezones make sure to set it so it runs at midnight PST
  schedule.scheduleJob(description, '0 16 * * *', init);
}
