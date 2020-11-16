import { Schema } from 'mongoose';

export const CounterSchema = new Schema({
  _id: String,
  index: {
    type: Number,
    default: 0
  }
});
