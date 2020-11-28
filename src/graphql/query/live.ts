import { ApolloError, UserInputError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { memcache, Videos } from '../../modules';
import { cutGroupString, getCacheKey, parseOrganization } from './consts';

interface LiveQuery {
  organizations: string[];
  platforms: PlatformId[];
  exclude_organizations: string[];
}

export async function live(_, query: LiveQuery) {
  try {
    const { organizations = [], platforms = [], exclude_organizations = [] } = query;
    if (organizations.length && exclude_organizations.length) {
      return new UserInputError('Setting both organizations and exclude_organizations is redundant. Only choose one.');
    }
    const EXCLUDE_ORG = !organizations.length;
    const ORGANIZATIONS = parseOrganization(EXCLUDE_ORG ? exclude_organizations : organizations);
    const CACHE_KEY = getCacheKey(`LIVE:${+EXCLUDE_ORG}${cutGroupString(ORGANIZATIONS)}${platforms}`);

    const cachedVideos = await memcache.get(CACHE_KEY);
    if (cachedVideos) return cachedVideos;

    const uncachedVideos = await Videos.find({
      status: 'live',
      ...platforms[0] && { platform_id: { $in: platforms } },
      ...ORGANIZATIONS[0] && { organization: {
        ...EXCLUDE_ORG
          ? { $not: { $regex: ORGANIZATIONS, $options: 'i' } }
          : { $regex: ORGANIZATIONS, $options: 'i' }
      } }
    }).sort({ 'time.start': 1 })
      .lean()
      .exec();

    memcache.set(CACHE_KEY, uncachedVideos, 60);
    return uncachedVideos;
  } catch (error) {
    throw new ApolloError(error);
  }
}
