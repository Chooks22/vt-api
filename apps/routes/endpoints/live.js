const { Router, logger } = require('../consts');
const { getLiveVideos } = require('../helpers/live');

const router = Router();

module.exports = router.get('/', async (req, res) => {
  logger.routes.live('query: %O', req.query);
  const videos = await getLiveVideos(req.query);

  return res.json(videos);
});
