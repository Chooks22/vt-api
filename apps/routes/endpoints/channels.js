const { api_data, logger, Router, send404, templates, asyncWrapper } = require('../consts');
const { getQueries } = require('../helpers/channels');

const router = Router();

module.exports = router.get('/', asyncWrapper(async (req, res) => {
  logger.routes.channels('query: %O', req.query);
  const { query, projection, limit } = getQueries(req.query);

  logger.db.api_data('fetching %d channels with %O', limit, query);
  const channels = await api_data.channels
    .findAsCursor(query, projection)
    .sort({ 'id': 1 })
    .limit(limit)
    .map(templates.channelFields);

  const filteredChannels = channels.filter(filterValidChannels);

  logger.db.api_data('found %d valid channels', filteredChannels.length);
  return filteredChannels.length
    ? res.json(filteredChannels)
    : send404(res);
}));

function filterValidChannels(channel) {
  return Object.values(channel).filter(val => val).length;
}
