import { MemberSchema } from '../schemas/MemberSchema';
import { Counter } from '../models/CounterModel';
import { MemberProps } from '../types/members';

async function getId(increment = true) {
  return Counter.findByIdAndUpdate('member_id',
    { $inc: { index: increment ? 1 : -1 } },
    { upsert: true }
  ).then(counter => counter?.index ?? 0);
}

MemberSchema.pre<MemberProps>('save', async function() {
  this.updated_at = new Date();
  if (this.isNew) this._id = await getId();
});

// On duplicate error, decrement id to prevent id jumping.
MemberSchema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) {
    return getId(false);
  } else { return next(); }
});
