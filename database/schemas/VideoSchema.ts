import { Schema } from 'mongoose';

export const VideoSchema = new Schema({
  '_id': String,
  'platform': {
    type: String,
    enum: ['yt', 'bb', 'tt'],
    required: true
  },
  'channel': {
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
      default: function() {
        if (this.start && this.end) {
          return this.end - this.start;
        }
      }
    }
  }, { _id: false }),
  'status': {
    type: String,
    enum: ['live', 'upcoming', 'ended', 'uploaded', 'missing']
  },
  'viewers': Number,
  'updated_at': Number
});
