import { connection, Model } from 'mongoose';
import { ChannelSchema } from '../schemas/ChannelSchema';
import { ChannelProps } from '../types/channels';

export const Channels: Model<ChannelProps> = connection
  .useDb('data')
  .model('Channels', ChannelSchema);
