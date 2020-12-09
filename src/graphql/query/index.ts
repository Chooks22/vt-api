import schedule from 'node-schedule';

process.env.CACHE_MINUTE = `${new Date().getMinutes()}`;
const { GQL_CACHE_INVALIDATE } = process.env;
const INVALIDATE_SECOND = isNaN(+GQL_CACHE_INVALIDATE) ? '8' : GQL_CACHE_INVALIDATE;

schedule.scheduleJob(
  'invalidate-live-cache',
  `${INVALIDATE_SECOND} * * * * *`,
  () => process.env.CACHE_MINUTE = `${new Date().getMinutes()}`
);

import { channels } from './channels';
import { live } from './live';
import { videos } from './videos';
import { data } from './data';
export const Query = { channels, live, videos, data };
