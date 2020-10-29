import { ChannelSchema } from '../schemas/ChannelSchema';
import { ChannelProps } from '../types/channels';

ChannelSchema.pre<ChannelProps>('validate', async function() {
  this.updated_at = Date.now();
});
