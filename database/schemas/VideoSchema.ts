import { Schema } from 'mongoose';

export const VideoSchema = new Schema({
  '_id': String,
  'platform_id': {
    type: String,
    enum: ['yt', 'bb', 'tt'],
    required: true
  },
  'channel_id': {
    type: String,
    required: true
  },
  'organization': {
    type: String,
    required: true
  },
  'title': {
    type: String,
    required: true
  },
  'time': new Schema({
    'published': Number,
    'scheduled': Number,
    'start': Number,
    'end': Number,
    'duration': {
      type: Number,
      default: function(this: {start: string; end: string;}) {
        if (this.start && this.end) {
          return +this.end - +this.start;
        }
      }
    }
  }, { _id: false }),
  'status': {
    type: String,
    enum: ['live', 'upcoming', 'ended', 'uploaded', 'missing', 'new'],
    required: true
  },
  'viewers': Number,
  'updated_at': Number
});
