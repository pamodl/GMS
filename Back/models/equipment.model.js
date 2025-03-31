import mongoose from 'mongoose';

const borrowedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  borrowedAt: {
    type: Date,
    default: Date.now,
  },
  returnedAt: {
    type: Date,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false, // Default to false until approved by an admin
  },
});

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    available: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
    borrowedBy: [borrowedSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Equipment', equipmentSchema);