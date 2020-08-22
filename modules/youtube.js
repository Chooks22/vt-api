const fs = require('fs');
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
  async validateKey() {
    const keys = getKeys('../.keys.json');
    const key = `${settings.key.slice(0, 10)}...${settings.key.slice(-10)}`;
    if (keys.includes(key)) {
      return 1;
    }

    const res = await node_fetch(baseURL + 'videos?' + getParams({ 'id': 'dQw4w9WgXcQ' }));
    return res.ok
      ? fs.writeFileSync('.keys.json', JSON.stringify([...keys, key])) || 1
      : 0;
  },
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

function getKeys(path) {
  try {
    return require(path);
  } catch {
    return [];
  }
}
