type Document = import('mongoose').Document;

type VideoId = string;
type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing';

interface VideoObject {
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

interface VideoProps extends Document, VideoObject {
  _id: VideoId;
}
