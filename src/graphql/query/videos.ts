import { ApolloError, UserInputError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { memcache, Videos } from '../../modules';
import { ChannelId } from '../../modules/types/youtube';
import { VideoStatus } from '../../server/apis/youtube/types';
import { firstField, getCacheKey, parseOrganization, Sort } from './consts';

interface SortBy {
  published?: Sort;
  scheduled?: Sort;
  start?: Sort;
}

interface VideoQuery {
  channel_id: ChannelId[];
  status: VideoStatus[];
  organizations: string[];
  platforms: PlatformId[];
  max_upcoming_mins: number;
  order_by: SortBy;
  limit: number;
}

export async function videos(_, query: VideoQuery) {
  try {
    const { channel_id = [], status = [], organizations = [], platforms = [], max_upcoming_mins, limit } = query;

    if (limit <= 1 || limit > 50) {
      return new UserInputError('limit must be between 1-100 inclusive.');
    }
    if (max_upcoming_mins < 0 || max_upcoming_mins > 480) {
      return new UserInputError('max_upcoming_mins must be between 0-480 inclusive.');
    }
    const ORGANIZATIONS = parseOrganization(organizations);
    const [ORDER_BY, ORDER_BY_KEY] = firstField(query.order_by);
    const CACHE_KEY = getCacheKey(`VIDS:${channel_id}${status}${organizations}${platforms}${max_upcoming_mins}${ORDER_BY_KEY}${limit}`);

    const cached = await memcache.get(CACHE_KEY);
    if (cached) return cached;

    const [ORDER_KEY, ORDER_VALUE] = Object.entries(ORDER_BY);
    const uncachedVideos = await Videos.find({
      status: status[0] ? { $in: status } : { $ne: 'missing' },
      ...channel_id[0] && { channel_id: { $in: channel_id } },
      ...ORGANIZATIONS[0] && { organization: { $in: ORGANIZATIONS } },
      ...platforms[0] && { platform_id: { $in: platforms } },
      ...max_upcoming_mins && { 'time.scheduled': { $lte: Date.now() + max_upcoming_mins } }
    }).sort({ [`time.${ORDER_KEY}`]: ORDER_VALUE })
      .limit(limit);

    memcache.set(CACHE_KEY, uncachedVideos, 60);
    return uncachedVideos;
  } catch(err) {
    throw new ApolloError(err);
  }
}
