export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_API_KEY: string;
      PORT: string;
      MONGO_HOST: string;
      MONGO_PORT: string;
      MEMCACHED_HOST: string;
      MEMCACHED_PORT: string;
      TTL_SHORT: string;
      TTL_LONG: string;
    }
  }
}
