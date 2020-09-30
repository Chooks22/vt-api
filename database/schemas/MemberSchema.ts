import { Schema } from 'mongoose';
import { NameSchema } from './subschemas/NameSubschema';

export const MemberSchema = new Schema({
  '_id': Number,
  'name': NameSchema,
  'platform_id': {
    type: String,
    enum: ['yt', 'bb', 'tt']
  },
  'channel_id': {
    type: String,
    required: true,
    unique: true
  },
  'details': Schema.Types.Mixed,
  'crawled_at': Date,
  'updated_at': Date
});
