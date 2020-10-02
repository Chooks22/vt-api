type Document = import('mongoose').Document;

type PlatformId = 'yt'|'bb'|'tt';
interface MemberNames {
  en: string;
  jp?: string;
  kr?: string;
  id?: string;
}

type YoutubeChannelId = string;
type BilibiliChannelId = string;
type TwitterHandle = string;

interface MemberObject {
  name: MemberNames;
  platform_id: PlatformId;
  channel_id: YoutubeChannelId;
  details?: {
    twitter?: TwitterHandle;
    [key: string]: unknown;
  };
}

interface MemberProps extends Document, MemberObject {
  _id: number;
  crawled_at: Date;
  updated_at: Date;
}
