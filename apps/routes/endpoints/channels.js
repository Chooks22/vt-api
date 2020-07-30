const { api_data, logger, Router, send404, templates } = require('../consts');
const { getQueries } = require('../helpers/channels');

const router = Router();

module.exports = router.get('/', async (req, res) => {
  logger.routes.channels('query: %O', req.query);
  const { query, projection, limit } = getQueries(req.query);

  logger.db.api_data('fetching %d channels with %O', limit, query);
  const channels = await api_data.channels
    .findAsCursor(query, projection)
    .sort({ 'id': 1 })
    .limit(limit)
    .map(templates.channelFields);

  logger.db.api_data('found %d channels', channels.length);
  return channels.length
    ? res.json(channels)
    : send404(res);
});
