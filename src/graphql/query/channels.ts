import { ApolloError, UserInputError } from 'apollo-server';
import { PlatformId } from '../../../database/types/members';
import { Channels, memcache } from '../../modules';
import { ChannelId } from '../../modules/types/youtube';
import { cutChannelIds, cutGroupString, firstField, getCacheKey, parseOrganization, Sort } from './consts';

type Sort = 'asc'|'desc';

interface OrderBy {
  _id?: Sort;
  published_at?: Sort;
  subscribers?: Sort;
  videos?: Sort;
}

interface ChannelsQuery {
  _id: number[];
  name: string;
  organizations: string[];
  platforms: PlatformId[];
  channel_id: ChannelId[];
  order_by: OrderBy;
  limit: number;
}

export async function channels(_, query: ChannelsQuery) {
  try {
    const { _id = [], name = '', organizations = [], channel_id = [], platforms = [], limit } = query;

    if (limit < 0 || limit > 50) return new UserInputError('limit must be between 0-50 inclusive.');

    const [ORDER_BY, ORDER_BY_KEY] = firstField(query.order_by);
    const ORGANIZATIONS = parseOrganization(organizations);
    const CACHE_KEY = getCacheKey(`CHNLS:${_id}${name}${cutGroupString(ORGANIZATIONS)}${cutChannelIds(channel_id)}${platforms}${ORDER_BY_KEY}`);

    const cached = await memcache.get(CACHE_KEY);
    if (cached) return cached;

    const uncachedChannels = await Channels.find({
      _id: { [_id[0] ? '$in' : '$nin']: _id },
      ...name && { $or: getNameQueries(name) },
      ...ORGANIZATIONS[0] && { organization: { $in: ORGANIZATIONS } },
      ...channel_id[0] && { channel_id: { $in: channel_id } },
      ...platforms[0] && { platform_id: { $in: platforms } }
    }).sort(ORDER_BY)
      .limit(limit)
      .lean();

    memcache.set(CACHE_KEY, uncachedChannels);
    return uncachedChannels;
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
