import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

VideoSchema.pre<VideoProps>('save', function() {
  this.updated_at = Date.now();
});
