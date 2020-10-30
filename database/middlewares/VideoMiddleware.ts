import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

VideoSchema.pre<VideoProps>('updateOne', function() {
  this.set({ updated_at: Date.now() });
});
