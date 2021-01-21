import { ApolloError, UserInputError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { memcache, Videos } from '../../modules';
import { ChannelId } from '../../modules/types/youtube';
import { VideoStatus } from '../../server/apis/youtube/types';
import { cutGroupString, escapeRegex, firstField, getCacheKey, getNextToken, parseOrganization, parseToken, Sort } from './consts';

interface SortBy {
  published?: Sort;
  scheduled?: Sort;
  start?: Sort;
}

interface VideoQuery {
  channel_id: ChannelId[];
  status: VideoStatus[];
  title: string;
  organizations: string[];
  exclude_organizations: string[];
  platforms: PlatformId[];
  max_upcoming_mins: number;
  order_by: SortBy;
  page_token: string;
  limit: number;
}

export async function videos(_, query: VideoQuery) {
  try {
    const {
      channel_id = [],
      status = [],
      title,
      organizations = [],
      exclude_organizations = [],
      platforms = [],
      max_upcoming_mins,
      page_token = '',
      limit
    } = query;

    if (limit < 1 || limit > 50) {
      return new UserInputError('limit must be between 1-50 inclusive.');
    }
    if (max_upcoming_mins < 0 || max_upcoming_mins > 2880) {
      return new UserInputError('max_upcoming_mins must be between 0-2880 inclusive.');
    }
    if (organizations.length && exclude_organizations.length) {
      return new UserInputError('Setting both organizations and exclude_organizations is redundant. Only choose one.');
    }
    const EXCLUDE_ORG = !organizations.length;
    const MAX_UPCOMING = max_upcoming_mins * 6e4;
    const TITLE = title && escapeRegex(title);
    const ORGANIZATIONS = parseOrganization(EXCLUDE_ORG ? exclude_organizations : organizations);
    const [ORDER_BY, ORDER_BY_KEY] = firstField(query.order_by);
    const [ORDER_KEY, ORDER_VALUE] = Object.entries(ORDER_BY)[0];
    const orderBy = { [`time.${ORDER_KEY}`]: ORDER_VALUE };
    const CACHE_KEY = getCacheKey(`VIDS:${+EXCLUDE_ORG}${cutGroupString(ORGANIZATIONS)}${channel_id}${status}${TITLE}${platforms}${max_upcoming_mins}${ORDER_BY_KEY}${limit}${page_token}`);

    const cached = await memcache.get(CACHE_KEY);
    if (cached) return cached;

    const QUERY: any = { // any because typescript gets mad for some reason.
      status: status[0] ? { $in: status } : { $ne: 'missing' },
      ...channel_id[0] && { channel_id: { $in: channel_id } },
      ...TITLE && { title: { $regex: TITLE, $options: 'i' } },
      ...ORGANIZATIONS[0] && { organization: {
        ...EXCLUDE_ORG
          ? { $not: { $regex: ORGANIZATIONS, $options: 'i' } }
          : { $regex: ORGANIZATIONS, $options: 'i' }
      } },
      ...platforms[0] && { platform_id: { $in: platforms } },
      ...max_upcoming_mins && { 'time.scheduled': { $lte: Date.now() + MAX_UPCOMING } }
    };

    const getVideoCount = Videos.countDocuments(QUERY);
    const getUncachedVideos = Videos
      .find({
        ...QUERY,
        ...page_token && { [Object.keys(orderBy)[0]]: { [ORDER_VALUE === 'asc' ? '$gte' : '$lte']: parseToken(page_token) } },
      })
      .sort(orderBy)
      .limit(limit + 1)
      .lean()
      .exec();

    const [videoCount, uncachedVideos] = await Promise.all([getVideoCount, getUncachedVideos]);
    const results = {
      items: uncachedVideos,
      next_page_token: null,
      page_info: {
        total_results: videoCount,
        results_per_page: limit
      }
    };

    const hasNextPage = uncachedVideos.length > limit && results.items.pop();
    if (hasNextPage) {
      const token = hasNextPage.time[ORDER_KEY];
      results.next_page_token = getNextToken(token);
    }

    memcache.set(CACHE_KEY, results, 60);
    return results;
  } catch(err) {
    throw new ApolloError(err);
  }
}
