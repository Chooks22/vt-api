const node_fetch = require('node-fetch');
const fetch = url => node_fetch(url)
  .then(res => {
    if (!res.ok) throw new Error(`${res.statusText}, status code: ${res.status}`);
    return res.json();
  });

const baseURL = 'https://www.googleapis.com/youtube/v3/';
const settings = {
  'key': process.env.GOOGLE_API_KEY,
  'accept': 'application/json'
};

module.exports = {
  videos(params) {
    return fetch(baseURL + 'videos?' + getParams(params));
  },
  channels(params) {
    return fetch(baseURL + 'channels?' + getParams(params));
  },
  playlistItems(params) {
    return fetch(baseURL + 'playlistItems?' + getParams(params));
  }
};

function getParams(params = {}) {
  return new URLSearchParams({ ...params, ...settings });
}
