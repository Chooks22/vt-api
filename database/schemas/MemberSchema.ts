import { Schema } from 'mongoose';
import { NameSchema } from './subschemas/NameSubschema';

export const MemberSchema = new Schema({
  '_id': Number,
  'name': {
    type: NameSchema,
    required: true
  },
  'organization': String,
  'platform_id': {
    type: String,
    enum: ['yt', 'bb', 'tt'],
    required: true
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
