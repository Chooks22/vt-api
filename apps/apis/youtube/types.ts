import { MemberNames, TwitterHandle, YoutubeChannelId } from '../../../database/types/members';
import { VideoObject } from '../../../database/types/videos';

export { ChannelProps } from '../../../database/types/channels';
export { YoutubeChannelId } from '../../../database/types/members';
export {
  ChannelResource,
  PlaylistItemsResource,
  VideoResource,
  YoutubeChannelResponse,
  YoutubePlaylistItemsResponse,
  YoutubeVideoResponse
} from '../../../modules/types/youtube';

export type VideoId = string;
export type ChannelId = string;
export type DateString = string;

export type VideoStatus = 'live'|'upcoming'|'ended'|'uploaded'|'missing'|'new';
export interface YoutubeVideoObject extends VideoObject {
  _id: VideoId;
  platform_id: 'yt';
  channel_id: ChannelId;
  organization: string;
}

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
    'yt:channelId': ChannelId;
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
  'yt:channelId': ChannelId;
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
