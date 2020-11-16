import { ApolloError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { memcache, Videos } from '../../modules';
import { cutGroupString, getCacheKey, parseOrganization } from './consts';

interface LiveQuery {
  organizations: string[];
  platforms: PlatformId[];
}

export async function live(_, query: LiveQuery) {
  try {
    const { organizations = [], platforms = [] } = query;
    const ORGANIZATIONS = parseOrganization(organizations);
    const CACHE_KEY = getCacheKey(`LIVE:${cutGroupString(ORGANIZATIONS)}${platforms}`);

    const cachedVideos = await memcache.get(CACHE_KEY);
    if (cachedVideos) return cachedVideos;

    const uncachedVideos = await Videos.find({
      status: 'live',
      ...platforms[0] && { platform_id: { $in: platforms } },
      ...ORGANIZATIONS[0] && { organization: { $in: ORGANIZATIONS } }
    }).sort({ 'time.start': 1 })
      .lean()
      .exec();

    memcache.set(CACHE_KEY, uncachedVideos, 60);
    return uncachedVideos;
  } catch (error) {
    throw new ApolloError(error);
  }
}
