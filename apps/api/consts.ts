import { mongo } from '../../modules';
export { logger, youtube, memcache } from '../../modules';

export const { api_data, channels } = mongo;

export const ONE_HOUR = 36e5;

export const TEMPLATE = {
  'thumbnail': null,
  'published_at': null,
  'scheduled_time': null,
  'start_time': null,
  'end_time': null,
  'length': null,
  'viewers': null,
  'status': null,
  'updated_at': null
};
