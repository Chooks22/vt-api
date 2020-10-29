import fetch from 'node-fetch';
import debug from './logger';
import { PlaylistParams, SearchParams, YoutubeChannelResponse, YoutubePlaylistItemsResponse, YoutubeVideoResponse } from './types/youtube';

const URL = 'https://www.googleapis.com/youtube/v3/';
const SETTINGS = `key=${process.env.GOOGLE_API_KEY}&accept=application/json&`;
const logger = debug('module:youtube');

const parseParams = (params = <PlaylistParams|SearchParams>{}) => SETTINGS + Object.entries(params).map(([k, v]) => k + '=' + v).join('&');
const youtubeFetch = async (type: string, params: any) => {
  logger.log(`Youtube ${type} Endpoint;\npart=${params.part};\nids=${(params?.id ?? params?.playlistId).split(',').length};`);
  return fetch(`${URL}${type}?${parseParams(params)}`).then(res => res.json()).then(res => { if (res.error) throw res.error; return res; });
};

export const videos = (params: SearchParams): Promise<YoutubeVideoResponse> => youtubeFetch('videos', params);
export const channels = (params: SearchParams): Promise<YoutubeChannelResponse> => youtubeFetch('channels', params);
export const playlistItems = (params: PlaylistParams): Promise<YoutubePlaylistItemsResponse> => youtubeFetch('playlistItems', params);
