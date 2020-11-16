import { VideoSchema } from '../schemas/VideoSchema';
import { VideoProps } from '../types/videos';

VideoSchema.pre<VideoProps>('updateOne', function() {
  this.set({ updated_at: new Date() });
});

VideoSchema.pre<VideoProps>('save', async function() {
  if (this.isNew) this.updated_at = new Date();
});
