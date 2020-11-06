import { MemberNames, TwitterHandle, YoutubeChannelId } from '../../../../database/types/members';
import { VideoObject } from '../../../../database/types/videos';

export { ChannelProps } from '../../../../database/types/channels';
export { YoutubeChannelId } from '../../../../database/types/members';
export {
  ChannelResource,
  PlaylistItemsResource,
  VideoResource,
  YoutubeChannelResponse,
  YoutubePlaylistItemsResponse,
  YoutubeVideoResponse
} from '../../../modules/types/youtube';

export type VideoId = string;
export type DateString = string;

// #region Youtube Video
export type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing'|'new';
export interface YoutubeVideoObject extends VideoObject {
  _id: VideoId;
  platform_id: 'yt';
  channel_id: YoutubeChannelId;
  organization?: string;
  crawled_at?: number;
}
// #endregion Youtube Video
// #region Youtube Channel
export interface YoutubeChannelData {
  channel_name: string;
  channel_id: YoutubeChannelId;
  channel_stats: {
    published_at: number;
    views: number;
    subscribers: number;
    videos: number;
  };
  description: string;
  thumbnail: string;
}
export interface BlankYoutubeChannel {
  name: MemberNames;
  organization: string;
  platform_id: 'yt';
  channel_id: YoutubeChannelId;
  details: {
    twitter: TwitterHandle;
    [key: string]: unknown;
  };
}
// #endregion Youtube Channel
// #region Youtube Xml
export interface YoutubeXmlResponse {
  feed: {
    $: {
      'xmlns:yt': string;
      'xmlns:media': string;
      'xmlns': string;
    };
    link: {
       $: {
        rel: string;
        href: string;
       };
    }[];
    id: string;
    'yt:channelId': YoutubeChannelId;
    title: string;
    author: {
      name: string;
      uri: string;
    };
    published: DateString;
    entry: VideoXmlEntry[];
  };
}

export interface VideoXmlEntry {
  id: string;
  'yt:videoId': VideoId;
  'yt:channelId': YoutubeChannelId;
  title: string;
  link: { $: Record<string, unknown>; };
  author: {
    name: string;
    uri: string;
  };
  published: DateString;
  updated: DateString;
  'media:group': {
    'media:title': string;
    'media:content': Record<string, unknown>;
    'media:thumbnail': Record<string, unknown>;
    'media:description': string;
    'media:community': Record<string, unknown>;
  };
}
// #endregion Youtube Xml
