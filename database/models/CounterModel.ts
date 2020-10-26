import { model, Model } from 'mongoose';
import { CounterSchema } from '../schemas/CounterSchema';
import { CounterProps } from '../types/counters';

export const Counter: Model<CounterProps> = model('Counter', CounterSchema);
