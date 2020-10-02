type Document = import('mongoose').Document;

interface ChannelObject {
  _id: number;
  name: MemberNames;
  group: string;
  platform_id: PlatformId;
  channel_id: YoutubeChannelId|BilibiliChannelId;
  details?: {
    twitter?: TwitterHandle;
    [key: string]: unknown;
  };
  channel_stats?: {
    published_at?: Date;
    views?: number;
    subscribers?: number;
    videos?: number;
  };
  description?: string;
  thumbnail?: string;
}

interface ChannelProps extends ChannelObject, Document {
  _id: number;
  id: number;
  updated_at: Date;
}
