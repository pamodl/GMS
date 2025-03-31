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

export const returnEquipment = async (req, res) => {
  const { itemId, borrowId, userId } = req.body;

  try {
    const equipment = await Equipment.findById(itemId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const borrowRecord = equipment.borrowedBy.find(
      (borrow) => borrow._id.toString() === borrowId && borrow.userId.toString() === userId
    );

    if (!borrowRecord) {
      return res.status(400).json({ message: 'No borrow record found for this user' });
    }

    // Mark the borrow record as pending approval
    borrowRecord.returnedAt = new Date();
    borrowRecord.isApproved = false;

    await equipment.save();

    res.status(200).json({ message: 'Return request submitted and pending admin approval', equipment });
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

export const approveReturn = async (req, res) => {
  const { itemId, borrowId } = req.body;

  console.log('Approve request received:', { itemId, borrowId }); // Debugging log

  try {
    const equipment = await Equipment.findById(itemId);
    if (!equipment) {
      console.log('Equipment not found'); // Debugging log
      return res.status(404).json({ message: 'Equipment not found' });
    }

    console.log('Equipment found:', equipment); // Debugging log

    const borrowRecord = equipment.borrowedBy.find(
      (borrow) => borrow._id.toString() === borrowId
    );

    if (!borrowRecord) {
      console.log('Borrow record not found'); // Debugging log
      return res.status(400).json({ message: 'No borrow record found' });
    }

    if (!borrowRecord.returnedAt) {
      console.log('Return not initiated by user'); // Debugging log
      return res.status(400).json({ message: 'Return not initiated by user' });
    }

    if (borrowRecord.isApproved) {
      console.log('Borrow record already approved'); // Debugging log
      return res.status(400).json({ message: 'This return has already been approved' });
    }

    // Approve the return
    borrowRecord.isApproved = true;
    equipment.available += borrowRecord.quantity;

    await equipment.save();

    console.log('Return approved successfully:', equipment); // Debugging log
    res.status(200).json({ message: 'Return approved successfully', equipment });
  } catch (error) {
    console.error('Error in approveReturn:', error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

export const getPendingReturns = async (req, res) => {
  try {
    // Find all equipment where there are pending returns
    const equipment = await Equipment.find({
      'borrowedBy.returnedAt': { $ne: null }, // Only include records where returnedAt is not null
      'borrowedBy.isApproved': false, // Only include records where isApproved is false
    });

    // Map the equipment to include only the relevant borrow records
    const pendingReturns = equipment.map((item) => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      borrowedBy: item.borrowedBy.filter(
        (borrow) => borrow.returnedAt !== null && borrow.isApproved === false
      ),
    }));

    res.status(200).json(pendingReturns);
  } catch (error) {
    console.error('Error in getPendingReturns:', error.message); // Debugging log
    res.status(500).json({ message: error.message });
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