import { model, Model } from 'mongoose';
import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

export const Videos: Model<VideoProps> = model('Videos', VideoSchema);
