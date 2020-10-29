import { Document } from 'mongoose';
import { BilibiliChannelId, MemberNames, PlatformId, TwitterHandle, YoutubeChannelId } from './members';

export interface ChannelObject {
  _id?: number;
  name: MemberNames;
  organization: string;
  platform_id: PlatformId;
  channel_name: string;
  channel_id: YoutubeChannelId|BilibiliChannelId;
  details?: {
    twitter?: TwitterHandle;
    [key: string]: unknown;
  };
  channel_stats?: {
    published_at?: number;
    views?: number;
    subscribers?: number;
    videos?: number;
  };
  description?: string;
  thumbnail?: string;
  updated_at?: number;
}

export interface ChannelProps extends ChannelObject, Document {
  _id: number;
}
