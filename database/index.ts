import { connect, connection } from 'mongoose';
import { db } from '../modules/loggers';

const URI = `mongodb://${process.env.MONGO_HOST ?? 'localhost'}:${process.env.MONGO_PORT ?? '27017'}/vt-api`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

// establish connection and log on status change
connect(URI, options);
connection.on('connected', () => db('Established connection to MongoDB.'));
connection.on('disconnected', () => db('Lost connection to MongoDB.'));

// load middlewares
import './middlewares/MemberMiddleware';
import './middlewares/VideoMiddleware';

// re-export models
export * from './models/ChannelModel';
export * from './models/CounterModel';
export * from './models/MemberModel';
export * from './models/VideoModel';
