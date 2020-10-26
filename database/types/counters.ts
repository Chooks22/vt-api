import { Document } from 'mongoose';

export interface CounterProps extends Document {
  _id: string;
  index: number;
}
