import { MemberSchema } from '../schemas/MemberSchema';
import { Counter } from '../models/CounterModel';

async function incrementId() {
  return Counter.findByIdAndUpdate('member_id',
    { $inc: { index: 1 } }
  ).then(counter => counter.index);
}

MemberSchema.pre<MemberProps>('save', async function() {
  if (this.isNew) this._id = await incrementId();
});
