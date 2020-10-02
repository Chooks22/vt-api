import { model, Model } from 'mongoose';
import { CounterSchema } from '../schemas/CounterSchema';

export const Counter: Model<CounterProps> = model('Counter', CounterSchema);
