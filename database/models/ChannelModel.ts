import { model, Model } from 'mongoose';
import { ChannelSchema } from '../schemas/ChannelSchema';

export const Channels: Model<ChannelProps> = model('Channels', ChannelSchema);
