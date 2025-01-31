import Equipment from '../models/equipment.model.js';

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