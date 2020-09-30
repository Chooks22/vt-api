import { Schema } from 'mongoose';

export const NameSchema = new Schema({
  'en': {
    type: String,
    required: true
  },
  'jp': String,
  'kr': String,
  'id': String
}, { _id: false });
