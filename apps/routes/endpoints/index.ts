const { Router } = require('../consts');
const router = Router();

module.exports = router;

/**
 * /live      - Displays live, upcoming, and ended videos.
 *  accepts:  - status=string[]
 *            - title=string
 *            - group=string
 *
 *  returns:  {
 *              "live": array
 *              "upcoming": array
 *              "ended": array
 *            }
 */
router.use('/live', require('./live'));

/**
 * /channels  - Shows a list of all channels.
 *  accepts:  - id=number
 *            - youtube=string
 *            - name=string
 *            - channel=string
 *            - fields=string[]
 *            - limit=number
 *
 *  returns:  [
 *              {
 *                "id": number,
 *                "name_jp": string,
 *                "name_en": string,
 *                "youtube": string,
 *                "twitter": string,
 *                "updated_at": number,
 *                "channel": string,
 *                "channel_stats": {
 *                  "published_at": number,
 *                  "views": number,
 *                  "subscribers": number,
 *                  "videos": number,
 *                },
 *                "description": string,
 *                "thumbnail": string
 *              }
 *            ]
 */
router.use('/channels', require('./channels'));

/**
 * /videos    - Shows a list of all videos.
 *  accepts:  - status=string[]
 *            - title=string
 *            - fields=string[]
 *            - limit=number
 *
 *  returns:  [
 *              {
 *                "id": string,
 *                "title": string,
 *                "channel": string,
 *                "published_at": number,
 *                "scheduled_time": number,
 *                "start_time": number,
 *                "end_time": number,
 *                "length": number,
 *                "status": string
 *              }
 *            ]
 */
router.use('/videos', require('./videos'));
