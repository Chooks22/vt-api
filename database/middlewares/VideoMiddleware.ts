import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

VideoSchema.pre<VideoProps>('save', function() {
  if (this.isModified()) this.updated_at = Date.now();
});
