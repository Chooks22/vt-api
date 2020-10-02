export interface SearchParams {
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
  id?: string;
  hl?: string;
}

export interface PlaylistParams extends SearchParams {
  playlistId: string;
  pageToken?: string;
  maxResults?: number;
}

type DateString = string;
type ChannelId = string;

export interface Snippet {
  publishedAt?: DateString;
  channelId?: ChannelId;
  title?: string;
  description?: string;
  thumbnails?: {
    [key: string]: {
      url?: string;
      width?: number;
      height?: number;
    };
  };
  channelTitle?: string;
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string;
  defaultLanguage?: string;
  localized?: {
    title?: string;
    description?: string;
  };
  defaultAudioLanguage?: string;
}

export interface Statistics {
  viewCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  commentcount?: number;
}

export interface LiveStreamingDetails {
  actualStartTime?: DateString;
  actualEndTime?: DateString;
  scheduledStartTime?: DateString;
  scheduledEndTime?: DateString;
  concurrentViewers?: number;
  activeLiveChatId?: number;
}

export interface YoutubeVideoObject {
  snippet?: Snippet;
  contentDetails?: Record<string, unknown>;
  status?: Record<string, unknown>;
  statistics?: Statistics;
  player?: Record<string, unknown>;
  topicDetails?: Record<string, unknown>;
  recordingDetails?: Record<string, unknown>;
  fileDetails?: Record<string, unknown>;
  suggestions?: Record<string, unknown>;
  liveStreamingDetails?: LiveStreamingDetails;
  localizations?: Record<string, unknown>;
}

export interface YoutubeResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo?: {
    totalResults?: number;
    resultsPerPage?: number;
  };
  items: YoutubeVideoObject[];
}
