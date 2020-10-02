import { VideoSchema } from '../schemas/VideoSchema';

VideoSchema.pre<VideoProps>('save', function() {
  if (this.isModified()) this.updated_at = new Date();
});
