import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  category: { type: String, required: true },
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;