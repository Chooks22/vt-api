import Memcached from 'memcached-promise';
const re = /(?<=_).*/;

const memcached = new Memcached(
  (process.env.MEMCACHED_HOST ?? 'localhost') + ':11211', {
    timeout: 1000,
    retries: 1
  }
);

export function get(key) {
  return memcached.get(key);
}
export function save(key, data, ttl = 0) {
  memcached.set(key, data, ttl);
}
export async function getMultiVideos(keys) {
  const multiCache = await memcached.getMulti(keys);
  return Object.assign({}, ...Object
    .entries(multiCache)
    .map(removeGroup));
}

function removeGroup([key, value]) {
  return { [`${key.match(re)}`]: value };
}
