import Equipment from '../models/equipment.model.js';
import User from '../models/user.model.js';

export const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEquipment = async (req, res) => {
  const { name, quantity, available, category } = req.body;
  const newEquipment = new Equipment({ name, quantity, available, category });

  try {
    const savedEquipment = await newEquipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, available, category } = req.body;

  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      { name, quantity, available, category },
      { new: true }
    );
    res.json(updatedEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    await Equipment.findByIdAndDelete(id);
    res.json({ message: 'Equipment deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const borrowEquipment = async (req, res) => {
  const { itemId, userId } = req.body;

  try {
    const equipment = await Equipment.findById(itemId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.available <= 0) {
      return res.status(400).json({ message: 'No available items to borrow' });
    }

    equipment.available -= 1;
    equipment.borrowedBy.push({ userId, borrowedAt: new Date() });
    await equipment.save();

    res.status(200).json({ message: 'Equipment borrowed successfully', equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEquipmentWithBorrowedInfo = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate('borrowedBy.userId', 'username email');
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};