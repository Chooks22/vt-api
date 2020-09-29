import mongoist from 'mongoist';
import { db } from './loggers';

const baseURL = 'mongodb://' + (process.env.MONGO_HOST ?? 'localhost') + ':27017/';
const urlChannels = baseURL + 'channels';
const urlData = baseURL + 'data';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

export const channels = mongoist(urlChannels, options);
channels.on('connect', () => db.channels('connected'));

export const api_data = mongoist(urlData, options);
api_data.on('connect', () => db.api_data('connected'));
