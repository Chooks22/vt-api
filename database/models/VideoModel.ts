import { model, Model } from 'mongoose';
import { VideoSchema } from '../schemas/VideoSchema';

export const Videos: Model<VideoProps> = model('Videos', VideoSchema);
