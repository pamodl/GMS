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
});

const equipmentSchema = new mongoose.Schema({
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
  },
  available: {
    type: Number,
    required: true,
  },
  borrowedBy: [borrowedSchema],
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;