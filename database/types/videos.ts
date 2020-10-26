import { Document } from 'mongoose';
import { PlatformId } from './members';
import type { VideoId } from '../../apps/apis/youtube/types';

export type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing'|'new';

export interface VideoObject {
  _id: VideoId;
  platform?: PlatformId;
  channel?: string;
  organization?: string;
  title?: string;
  time?: {
    published?: number;
    scheduled?: number;
    start?: number;
    end?: number;
    duration?: number;
  };
  status?: VideoStatus;
  viewers?: number;
  updated_at: number;
}

export interface VideoProps extends Document, VideoObject {
  _id: VideoId;
}
