import { ChannelSchema } from '../schemas/ChannelSchema';
import { ChannelProps } from '../types/channels';

ChannelSchema.pre<ChannelProps>('updateOne', function() {
  this.set({ updated_at: Date.now() });
});
