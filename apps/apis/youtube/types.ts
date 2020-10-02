export type VideoId = string;
export type ChannelId = string;
export type DateString = string;

export interface VideoObject {
  videoId: VideoId;
  channel: ChannelId;
  title: string;
  timestamp: number;
}

export interface VideoXMLEntry {
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
    entry: VideoEntry[];
  };
}

export interface VideoEntry {
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