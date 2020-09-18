const Memcached = require('memcached-promise');
const re = /(?<=_).*/;

const memcached = new Memcached(
  (process.env.MEMCACHED_HOST ?? 'localhost') + ':11211', {
    timeout: 1000,
    retries: 1
  }
);

module.exports = {
  get(key) {
    return memcached.get(key);
  },
  save(key, data, ttl = 0) {
    memcached.set(key, data, ttl);
  },
  async getMultiVideos(keys) {
    const multiCache = await memcached.getMulti(keys);
    return Object.assign({}, ...Object
      .entries(multiCache)
      .map(removeGroup));
  }
};

function removeGroup([key, value]) {
  return { [`${key.match(re)}`]: value };
}
