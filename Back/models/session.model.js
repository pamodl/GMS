import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending' 
  },
  sessionType: {
    type: String,
    enum: ['fitness', 'weight training', 'yoga', 'consultation', 'group class'],
    default: 'fitness'
  },
  notes: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    submittedAt: {
      type: Date
    }
  }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);