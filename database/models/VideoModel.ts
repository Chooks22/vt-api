import { connection, Model } from 'mongoose';
import { VideoSchema } from '../schemas/VideoSchema';

export const Videos: Model<VideoProps> = connection
  .useDb('data')
  .model('Videos', VideoSchema);
