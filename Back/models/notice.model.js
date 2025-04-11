import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for public notices
  },
  public: {
    type: Boolean,
    default: false, // Default to false (not public)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;