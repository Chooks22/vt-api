import fetch from 'node-fetch';

const URL = 'https://www.googleapis.com/youtube/v3/';
const SETTINGS = `key=${process.env.GOOGLE_API_KEY}&accept=application/json&`;

async function api(type: string, params: SearchParams): Promise<YoutubeResponse> {
  return fetch(`${URL}${type}?${parseParams(params)}`)
    .then(res => res.json())
    .then(res => {
      if (res.error) throw res.error;
      return res;
    });
}

export function videos(params: SearchParams) {
  return api('videos', params);
}
export function channels(params: SearchParams) {
  return api('channels', params);
}
export function playlistItems(params: PlaylistParams) {
  return api('playlistItems', params);
}

function parseParams(params: SearchParams = <SearchParams>{}) {
  return SETTINGS + Object.entries(params)
    .map(([k, v]) => k + '=' + v)
    .join('&');
}
