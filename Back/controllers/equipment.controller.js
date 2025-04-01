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
  const { itemId, userId } = req.body;

  console.log('Approve request received:', { itemId, userId }); // Debugging log

  try {
    const equipment = await Equipment.findById(itemId);
    if (!equipment) {
      console.log('Equipment not found'); // Debugging log
      return res.status(404).json({ message: 'Equipment not found' });
    }

    console.log('Equipment found:', equipment); // Debugging log

    const borrowRecords = equipment.borrowedBy.filter(
      (borrow) => borrow.userId.toString() === userId && borrow.returnedAt !== null && !borrow.isApproved
    );

    if (borrowRecords.length === 0) {
      console.log('No pending returns found for this user'); // Debugging log
      return res.status(400).json({ message: 'No pending returns found for this user' });
    }

    // Approve all pending returns for this user
    borrowRecords.forEach((borrow) => {
      borrow.isApproved = true;
      equipment.available += borrow.quantity;
    });

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

    // Group borrow records by userId and itemId
    const pendingReturns = equipment.map((item) => {
      const groupedBorrowedBy = item.borrowedBy.reduce((acc, borrow) => {
        if (borrow.returnedAt !== null && !borrow.isApproved) {
          const key = `${borrow.userId}-${item._id}`;
          if (!acc[key]) {
            acc[key] = {
              userId: borrow.userId,
              itemId: item._id,
              itemName: item.name,
              category: item.category,
              totalQuantity: 0,
              borrowedRecords: [],
            };
          }
          acc[key].totalQuantity += borrow.quantity;
          acc[key].borrowedRecords.push(borrow);
        }
        return acc;
      }, {});

      return Object.values(groupedBorrowedBy);
    });

    // Flatten the grouped results
    res.status(200).json(pendingReturns.flat());
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