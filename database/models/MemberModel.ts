import { model, Model } from 'mongoose';
import { MemberSchema } from '../schemas/MemberSchema';

export const Members: Model<MemberProps> = model('Members', MemberSchema);
