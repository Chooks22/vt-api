const mongoist = require('mongoist');
const { db } = require('./loggers');

const baseURL = 'mongodb://localhost:27017/';
const urlChannels = baseURL + 'channels';
const urlData = baseURL + 'data';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const channels = mongoist(urlChannels, options);
channels.on('connect', () => db.channels('connected'));

const api_data = mongoist(urlData, options);
api_data.on('connect', () => db.api_data('connected'));

module.exports = {
  channels,
  api_data
};
