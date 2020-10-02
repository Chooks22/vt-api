import { connection, Model } from 'mongoose';
import { ChannelSchema } from '../schemas/ChannelSchema';

export const Channels: Model<ChannelProps> = connection
  .useDb('data')
  .model('Channels', ChannelSchema);
