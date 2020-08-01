const { api_data, logger, Router, templates, asyncWrapper } = require('../consts');
const { getQueries } = require('../helpers/videos');

const router = Router();

module.exports = router.get('/', asyncWrapper(async (req, res) => {
  logger.routes.videos('query: %O', req.query);
  const { query, projection, limit = 50 } = getQueries(req.query);

  logger.db.api_data('finding %d videos%s tagged as %O...', Math.min(limit, 100), query);
  const videos = await api_data.videos
    .findAsCursor({ ...query }, projection)
    .sort({ 'scheduledTime': -1 })
    .limit(Math.min(limit, 100))
    .map(templates.videoFields);

  logger.db.api_data('found %d videos', videos.length);
  return res.json(videos);
}));
