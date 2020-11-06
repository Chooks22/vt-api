export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development'|'production';
      GOOGLE_API_KEY: string;
      PORT: string;
      LOG_LEVEL: string;
      MONGO_HOST: string;
      MONGO_PORT: string;
      MEMCACHED_HOST: string;
      MEMCACHED_PORT: string;
      TTL_SHORT: string;
      TTL_LONG: string;
      TIMINGS_YOUTUBE_CHANNEL_UPDATER: string;
      TIMINGS_YOUTUBE_VIDEO_UPDATER: string;
      TIMINGS_YOUTUBE_XML_CRAWLER: string;
      GQL_CACHE_INVALIDATE: string;
      CACHE_MINUTE: string;
    }
  }
}
