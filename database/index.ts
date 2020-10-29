import { connect, connection } from 'mongoose';
import debug from '../modules/logger';
const logger = debug('db:mongo');

const URI = `mongodb://${process.env.MONGO_HOST ?? 'localhost'}:${process.env.MONGO_PORT ?? '27017'}/vt-api`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

// establish connection and log on status change
connect(URI, options);
connection.on('connected', () => logger.info('Established connection to MongoDB.'));
connection.on('disconnected', () => logger.info('Lost connection to MongoDB.'));

// load middlewares
import './middlewares/ChannelMiddleware';
import './middlewares/MemberMiddleware';
import './middlewares/VideoMiddleware';

// re-export models
export * from './models/ChannelModel';
export * from './models/CounterModel';
export * from './models/MemberModel';
export * from './models/VideoModel';
