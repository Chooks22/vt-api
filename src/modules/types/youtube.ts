export type VideoId = string;
export type DateString = string;
export type ChannelId = string;
export type UnsignedLong = string;
export type UnsignedInteger = string;

interface DefaultParams {
  /**
   * Available parts:
   * - contentDetails
   * - fileDetails
   * - id
   * - liveStreamingDetails
   * - localizations
   * - player
   * - processingDetails
   * - recordingDetails
   * - snippet
   * - statistics
   * - status
   * - suggestions
   * - topicDetails
   */
  part: string;
  fields?: string;
}

export interface SearchParams extends DefaultParams {
  id: string;
  hl?: string;
}

export interface PlaylistParams extends DefaultParams {
  playlistId: string;
  pageToken?: string;
  maxResults?: number;
}

export interface YoutubeDefaultResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: any[];
}

export interface YoutubeVideoResponse extends YoutubeDefaultResponse {
  kind: 'youtube#videoListResponse';
  items: VideoResource[];
}

export interface LiveStreamingDetails {
  actualStartTime: DateString;
  actualEndTime: DateString;
  scheduledStartTime: DateString;
  scheduledEndTime: DateString;
  concurrentViewers: UnsignedLong;
  activeLiveChatId: string;
}

export interface VideoResource {
  kind: 'youtube#video';
  etag: string;
  id: VideoId;
  snippet: {
    publishedAt: DateString;
    channelId: ChannelId;
    title: string;
    description: string;
    thumbnails: VideoThumbnail;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage: string;
  };
  contentDetails: Record<string, any>;
  statistics: {
    viewCount: UnsignedLong;
    likeCount: UnsignedLong;
    dislikeCount: UnsignedLong;
    favoriteCount: UnsignedLong;
    commentCount: UnsignedLong;
  };
  player: Record<string, any>;
  topicDetails: Record<string, any>;
  recordingDetails: {
    recordingDate: DateString;
  };
  fileDetails: Record<string, any>;
  processingDetails: Record<string, any>;
  suggestions: Record<string, any>;
  liveStreamingDetails: LiveStreamingDetails;
  localizations: {
    [key: string]: {
      title: string;
      description: string;
    };
  };
}

export interface YoutubeChannelResponse extends YoutubeDefaultResponse {
  kind: 'youtube#channelListResponse';
  items: ChannelResource[];
}

export interface ChannelResource {
  kind: 'youtube#channel';
  etag: string;
  id: ChannelId;
  snippet: {
    title: string;
    description: string;
    customUrl: string;
    publishedAt: DateString;
    thumbnails: ChannelThumbnail;
    defaultLanguage: string;
    localized: {
      title: string;
      description: string;
    };
    country: string;
  };
  contentDetails: {
    relatedPlaylists: {
      likes: string;
      favorites: string;
      uploads: string;
    };
  };
  statistics: {
    viewCount: UnsignedLong;
    subscriberCount: UnsignedLong;
    hiddenSubscriberCount: boolean;
    videoCount: UnsignedLong;
  };
  topicDetails: Record<string, any>;
  status: {
    privacyStatus: string;
    isLinked: boolean;
    longUploadsStatus: string;
    madeForKids: boolean;
    selfDeclaredMadeForKids: boolean;
  };
  brandingSettings: Record<string, any>;
  auditDetails: Record<string, any>;
  contentOwnerDetails: Record<string, any>;
  localizations: {
    [key: string]: {
      title: string;
      description: string;
    };
  };
}

export interface YoutubePlaylistItemsResponse extends YoutubeDefaultResponse {
  kind: 'youtube#playlistItemListResponse';
  items: PlaylistItemsResource[];
}

export interface PlaylistItemsResource {
  kind: 'youtube#playlistItem';
  etag: string;
  id: string;
  snippet: {
    publishedAt: DateString;
    channelId: ChannelId;
    title: string;
    description: string;
    thumbnails: VideoThumbnail;
    channelTitle: string;
    playlistId: string;
    position: UnsignedInteger;
    resourceId: {
      kind: string;
      videoId: VideoId;
    };
  };
  contentDetails: {
    videoId: VideoId;
    startAt: string;
    endAt: string;
    note: string;
    videoPublishedAt: DateString;
  };
  status: {
    privacyStatus: string;
  };
}

interface ThumbnailData {
  url: string;
  width: UnsignedInteger;
  height: UnsignedInteger;
}

type ThumbnailResolution = 'default'|'medium'|'high';
type VideoThumbnail = { [key in ThumbnailResolution|'standard'|'maxres']: ThumbnailData; }
type ChannelThumbnail = { [key in ThumbnailResolution]: ThumbnailData; }
