import { Schema } from 'mongoose';
import { NameSchema } from './subschemas/NameSubschema';

export const ChannelSchema = new Schema({
  '_id': Number,
  'name': NameSchema,
  'organization': {
    type: String,
    required: true
  },
  'platform_id': {
    type: String,
    enum: ['yt', 'bb', 'tt'],
    required: true
  },
  'channel_name': String,
  'channel_id': {
    type: String,
    required: true,
    unique: true
  },
  'details': Schema.Types.Mixed,
  'channel_stats': new Schema({
    'published_at': Date,
    'views': Number,
    'subscribers': Number,
    'videos': Number
  }, { _id: false }),
  'description': String,
  'thumbnail': String,
  'updated_at': Date
});
