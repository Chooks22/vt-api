import { Document } from 'mongoose';
import { MemberNames, TwitterHandle, YoutubeChannelId, BilibiliChannelId, PlatformId } from './members';

export interface ChannelObject {
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

export interface ChannelProps extends ChannelObject, Document {
  _id: number;
  id: number;
  updated_at: Date;
}