import node_fetch from 'node-fetch';
import { SearchParams, YoutubeResponse } from './types/youtube';

const URL = 'https://www.googleapis.com/youtube/v3/';
const SETTINGS = `key=${process.env.GOOGLE_API_KEY}&accept=application/json&`;

async function fetch(type: string, params: SearchParams): Promise<YoutubeResponse> {
  return node_fetch(`${URL}${type}?${parseParams(params)}`)
    .then(res => {
      if (res.ok) return res.json();
      throw new Error(`${res.statusText}, status code: ${res.status}`);
    });
}

export function videos(params: SearchParams) {
  return fetch('videos', params);
}
export function channels(params: SearchParams) {
  return fetch('channels', params);
}
export function playlistItems(params: SearchParams) {
  return fetch('playlistItems', params);
}

function parseParams(params: SearchParams = <SearchParams>{}) {
  return SETTINGS + Object.entries(params)
    .map(([k, v]) => k + '=' + v)
    .join('&');
}
