import { Document } from 'mongoose';

export type PlatformId = 'yt'|'bb'|'tt';
export interface MemberNames {
  en: string;
  jp?: string;
  kr?: string;
  id?: string;
}

export type YoutubeChannelId = string;
export type BilibiliChannelId = string;
export type TwitterHandle = string;

export interface MemberObject {
  name?: MemberNames;
  organization?: string;
  platform_id?: PlatformId;
  channel_id?: YoutubeChannelId;
  details?: {
    twitter?: TwitterHandle;
    [key: string]: unknown;
  };
  crawled_at?: Date;
  updated_at?: Date;
}

export interface MemberProps extends Document, MemberObject {
  _id: number;
}
