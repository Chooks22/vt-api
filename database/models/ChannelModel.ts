import { model, Model } from 'mongoose';
import { ChannelSchema } from '../schemas/ChannelSchema';
import { ChannelProps } from '../types/channels';

export const Channels: Model<ChannelProps> = model('Channels', ChannelSchema);
