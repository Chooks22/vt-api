import { Document } from 'mongoose';
import { PlatformId } from './members';

export type VideoId = string;
export type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing';

export interface VideoObject {
  _id: VideoId;
  platform: PlatformId;
  channel: string;
  group: string;
  title: string;
  time?: {
    published?: Date;
    scheduled?: Date;
    start?: Date;
    end?: Date;
    duration?: number;
  };
  status: VideoStatus;
  viewers?: number;
  updated_at: Date;
}

export interface VideoProps extends Document, VideoObject {
  _id: VideoId;
}
