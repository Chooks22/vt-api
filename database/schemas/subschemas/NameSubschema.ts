import { Schema } from 'mongoose';

export const NameSchema = new Schema({
  'en': {
    type: String,
    required: true
  },
  'jp': String,
  'kr': String,
  'cn': String
}, { _id: false });
