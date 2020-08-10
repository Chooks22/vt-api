const { channels, api_data, logger, youtube } = require('./consts');

logger.app('started channel-info');

module.exports = main;

async function main() {
  const groupCollections = await channels.listCollections();
  const groups = groupCollections.map(group => group.name);

  const channelsToUpdate = (await Promise.all(groups.map(group => channels[group]
    .findAsCursor({ 'youtube': { $exists: 1 } }, { 'crawled_at': 0 })
    .map(data => ({ ...data, 'from': group })))
  )).flat();

  // extract ids and split into batches
  const channelIDs = channelsToUpdate.map(item => item.youtube);

  const batches = [];
  while (channelIDs.length) {
    batches.push(channelIDs.splice(0, 50));
  }

  const channelData = await Promise.all(batches.map(fetchChannelData));

  // initialize bulk operators
  const bulk = api_data.channels.initializeUnorderedBulkOp();
  const bulkChannels = Object.assign({}, ...groups.map(group =>
    ({ [group]: channels[group].initializeUnorderedBulkOp() })
  ));

  // assign write ops
  channelData.flat().forEach((item, _id) => {
    const initData = channelsToUpdate.find(channel => channel.youtube === item.id);
    const id = initData._id;

    initData._id = _id + 1;
    delete item.id;

    // update channel info for api
    bulk.find({ 'youtube': initData.youtube })
      .upsert()
      .replaceOne({ id, ...initData, ...item, updated_at: Date.now() });

    // update channel data in db
    bulkChannels[initData.from]
      .find({ 'youtube': initData.youtube })
      .updateOne({ $set: { updated_at: Date.now() } });
  });

  // write to db and log results
  const result = await bulk.execute();
  await Promise.all(groups.map(group => bulkChannels[group].execute()));
  logger.api.channelInfo('updated %d channels', result.nUpserted);
  return result.nUpserted;
}

async function fetchChannelData(ids) {
  logger.api.helpers.channelInfo('requesting %d ids from youtube', ids.length);
  return youtube
    .channels({
      part: 'snippet,statistics',
      fields: 'items(id,snippet(title,description,thumbnails/high/url,publishedAt),statistics(viewCount,subscriberCount,videoCount))',
      id: ids.join(','),
      maxResults: 50
    })
    .then(data => data.items.map(parseYoutubeData))
    .catch(({ message }) => {
      logger.api.helpers.channelInfo('threw an error: %s', message);
      return [];
    });
}

function parseYoutubeData({ id, snippet, statistics }) {
  const { title, description, thumbnails, publishedAt } = snippet;
  const { viewCount, subscriberCount, videoCount } = statistics;
  return {
    id,
    'channel': title,
    'channel_stats': {
      'published_at': +new Date(publishedAt),
      'views': +viewCount,
      'subscribers': +subscriberCount,
      'videos': +videoCount
    },
    description,
    'thumbnail': thumbnails.high.url
  };
}
