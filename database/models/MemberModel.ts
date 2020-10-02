import { connection, Model } from 'mongoose';
import { MemberSchema } from '../schemas/MemberSchema';

export const YoutubeMembers: Model<MemberProps> = connection
  .useDb('channels')
  .model('YoutubeMembers', MemberSchema, 'youtube');
