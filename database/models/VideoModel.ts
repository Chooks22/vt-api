import { connection, Model } from 'mongoose';
import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

export const Videos: Model<VideoProps> = connection
  .useDb('data')
  .model('Videos', VideoSchema);
