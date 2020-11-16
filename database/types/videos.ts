import { Document } from 'mongoose';
import { PlatformId } from './members';
import type { VideoId } from '../../src/server/apis/youtube/types';

export type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing'|'new';

export interface VideoObject {
  _id: VideoId;
  platform_id: PlatformId;
  channel_id: string;
  organization?: string;
  title: string;
  time?: {
    published?: Date;
    scheduled?: Date;
    start?: Date;
    end?: Date;
    duration?: number;
  };
  status?: VideoStatus;
  viewers?: number;
  updated_at?: Date;
}

export interface VideoProps extends Document, VideoObject {
  _id: VideoId;
}
