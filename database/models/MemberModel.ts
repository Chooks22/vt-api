import { model, Model } from 'mongoose';
import { MemberSchema } from '../schemas/MemberSchema';
import { MemberProps } from '../types/members';

export const Members: Model<MemberProps> = model('Members', MemberSchema);
