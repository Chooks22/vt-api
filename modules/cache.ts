import memcached from 'memcached';

const { MEMCACHED_HOST, MEMCACHED_PORT } = process.env;
const URI = `${MEMCACHED_HOST}:${MEMCACHED_PORT}`;
const OPTIONS = {
  timeout: 1000,
  retries: 1,
  namespace: 'vt'
};

const cache = new memcached(URI, OPTIONS);

/**
 * Stores a new key-value pair in memory.
 * @param key Key string.
 * @param value Value to store.
 * @param ttl TTL in seconds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function set(key: string, value: any, ttl = 0) {
  return new Promise((res, rej) => {
    cache.set(key, value, ttl, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
}

/** Get Memcached's status */
export function stats() {
  return new Promise((res, rej) => {
    cache.stats((err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
}

/**
 * Retrieves one key-value pair from memory.
 * @param key Key to retrieve from memory.
 */
export function get(key: string) {
  return new Promise((res, rej) => {
    cache.get(key, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
}

/**
 * Retrieves multiple key-value pairs from memory.
 * @param keys Keys to retrieve from memory.
 */
export function gets(...keys: string[]): Promise<{[key: string]: unknown;}> {
  return new Promise((res, rej) => {
    cache.getMulti(keys.flat(), (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
}
