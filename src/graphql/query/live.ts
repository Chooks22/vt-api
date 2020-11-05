import { ApolloError } from 'apollo-server';
import { Query } from 'mongoose';
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
      organization: { [ORGANIZATIONS[0] ? '$in' : '$nin']: ORGANIZATIONS },
      platform_id: { [platforms[0] ? '$in' : '$nin']: platforms }
    }).sort({ 'time.start': 1 })
      .lean();

    memcache.set(CACHE_KEY, uncachedVideos, 60);
    return uncachedVideos;
  } catch (error) {
    throw new ApolloError(error);
  }
}
