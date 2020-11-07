import { ApolloError, UserInputError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { Channels, memcache } from '../../modules';
import { ChannelId } from '../../modules/types/youtube';
import { cutChannelIds, cutGroupString, firstField, getCacheKey, getNextToken, parseOrganization, parseToken, Sort } from './consts';

const CACHE_TTL = +(process.env.TTL_LONG ?? 900);

interface OrderBy {
  _id?: Sort;
  published_at?: Sort;
  subscribers?: Sort;
}

interface ChannelsQuery {
  _id: number[];
  name: string;
  organizations: string[];
  platforms: PlatformId[];
  channel_id: ChannelId[];
  order_by: OrderBy;
  next_page_token: string;
  limit: number;
}

export async function channels(_, query: ChannelsQuery) {
  try {
    const {
      _id = [],
      name = '',
      organizations = [],
      channel_id = [],
      platforms = [],
      next_page_token = '',
      limit
    } = query;
    if (limit < 1 || limit > 50) {
      return new UserInputError('limit must be between 1-50 inclusive.');
    }
    const [ORDER_BY, ORDER_BY_KEY] = firstField(query.order_by);
    const [ORDER_KEY, ORDER_VALUE] = Object.entries(ORDER_BY)[0];
    const sortById = ORDER_KEY === '_id';
    const sortBy = sortById ? ORDER_BY : { [`channel_stats.${ORDER_KEY}`]: ORDER_VALUE };
    const ORGANIZATIONS = parseOrganization(organizations);
    const CACHE_KEY = getCacheKey(`CHNLS:${_id}${(name)}${cutGroupString(ORGANIZATIONS)}${cutChannelIds(channel_id)}${platforms}${limit}${ORDER_BY_KEY}${next_page_token}`, false);

    const cached = await memcache.get(CACHE_KEY);
    if (cached) return cached;

    const uncachedChannels = await Channels.find({
      _id: { [_id[0] ? '$in' : '$nin']: _id },
      ...next_page_token && { [Object.keys(sortBy)[0]]: { [ORDER_VALUE === 'asc' ? '$gte' : '$lte']: parseToken(next_page_token) } },
      ...name && { $or: getNameQueries(name) },
      ...ORGANIZATIONS[0] && { organization: { $in: ORGANIZATIONS } },
      ...channel_id[0] && { channel_id: { $in: channel_id } },
      ...platforms[0] && { platform_id: { $in: platforms } }
    }).sort(sortBy)
      .limit(limit + 1)
      .lean()
      .exec();

    const results = {
      items: uncachedChannels,
      next_page_token: null
    };

    const hasNextPage = uncachedChannels.length > limit && results.items.pop();
    if (hasNextPage) {
      const token = sortById ? hasNextPage._id : hasNextPage.channel_stats[ORDER_KEY];
      results.next_page_token = getNextToken(token);
    }

    memcache.set(CACHE_KEY, results, CACHE_TTL);
    return results;
  } catch(err) {
    throw new ApolloError(err);
  }
}

const getNameQueries = (name: string) => [
  { 'name.en': { $regex: name, $options: 'i' } },
  { 'name.jp': { $regex: name, $options: 'i' } },
  { 'name.kr': { $regex: name, $options: 'i' } },
  { 'name.cn': { $regex: name, $options: 'i' } }
];
