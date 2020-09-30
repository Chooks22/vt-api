import { connection, Model } from 'mongoose';
import { MemberSchema } from '../schemas/MemberSchema';
import { MemberProps } from '../types/members';

export const YoutubeMembers: Model<MemberProps> = connection
  .useDb('channels')
  .model('YoutubeMembers', MemberSchema, 'youtube');
