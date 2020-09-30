import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types';

VideoSchema.pre<VideoProps>('save', function() {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
});
