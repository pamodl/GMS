import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  }
}, { timestamps: true });

const CheckIn = mongoose.model('CheckIn', checkInSchema);

export default CheckIn;