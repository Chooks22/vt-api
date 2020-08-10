const { channels, api_data, logger, youtube } = require('./consts');

let timesRan = 0;
let channelCount = 0;
let channelsUpdated = 0;

module.exports = init;

async function init() {
  logger.api.channelScraper('running...');

  // get group list
  const channelGroups = await channels.listCollections();
  const groups = channelGroups.map(group => group.name);
  let index = 1;

  // check if channels have been set up
  if (!groups.length) {
    logger.api.channelScraper('no groups found! have you made sure to set up the channels yet?');
    return [];
  }

  // loop through groups
  while (groups.length) {
    index = --index || groups.length;
    const result = await main(groups[index - 1]);
    groups.splice(index - 1, result);
  }

  logger.api.channelScraper('done! youtube:playlistItems ran %d times.', timesRan);
  logger.db.api_data('updated %d of %d channels.', channelsUpdated, channelCount);
  return [channelsUpdated, channelCount];
}

async function main(group) {
  logger.db.channels('looking for unscraped channels in %s...', group);
  const uncrawledChannel = await channels[group].findOne({
    'youtube': { $exists: 1 },
    'crawled_at': { $exists: 0 }
  });

  if (!uncrawledChannel) {
    logger.api.channelScraper('no channels from %s to be scraped.', group);
    return true; // this will delete the group from the list
  }
  logger.api.channelScraper('scraping channel: %s...', uncrawledChannel.youtube);
  channelCount++;

  // convert channel ID to playlist ID and run through youtube api
  const uploadsId = 'UU' + uncrawledChannel.youtube.slice(2);
  const channelVideos = await crawlChannelVideos(uploadsId);

  // throw results if null
  if (!channelVideos) {
    return logger.api.channelScraper(
      'youtube api threw an error! skipping channel %s...',
      uncrawledChannel.youtube
    );
  }

  // initialize some bulk operators
  const bulk = api_data.videos.initializeUnorderedBulkOp();

  // assign a write op for each video
  channelVideos.forEach(video => bulk
    .find({ '_id': video.snippet.resourceId.videoId })
    .upsert()
    .updateOne({ $setOnInsert: parseData(video, group) })
  );

  // write to db
  const result = await bulk.execute();
  logger.api.channelScraper(`crawled ${result.nUpserted} new videos.`);

  // mark channel as crawled
  channels[group].update(uncrawledChannel,
    { $set: { 'crawled_at': Date.now() } }
  );

  // log results
  channelsUpdated++;
  logger.db.channels('updated %s from %s at %s.', uncrawledChannel.youtube, group, new Date);
  logger.api.channelScraper('ran youtube:playlistItems %d times.', timesRan);
}

function videoFetcher(playlistId, pageToken) {
  logger.api.helpers.channelScraper(
    'fetching playlist %s with token %s...',
    playlistId,
    pageToken
  );

  timesRan++;
  return youtube.playlistItems
    .list({
      part: 'snippet',
      fields: 'nextPageToken,items(snippet(channelId,title,resourceId/videoId))',
      playlistId,
      maxResults: 50,
      pageToken,
      hl: 'ja'
    })
    .then(({ data }) => [data.items, data.nextPageToken, 'ok'])
    .catch(({ message }) => {
      logger.api.helpers.channelScraper('!!! threw an error: %s', message);
      return [[]];
    });
}

async function crawlChannelVideos(uploadsId) {
  const results = [];
  const search = token => videoFetcher(uploadsId, token);
  const countVideos = () => logger.api.helpers.channelScraper(
    'fetched %d videos. total video count: %d.',
    items.length,
    results.length
  );

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
