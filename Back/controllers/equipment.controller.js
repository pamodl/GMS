import Equipment from '../models/equipment.model.js';
import User from '../models/user.model.js';
import Notice from '../models/notice.model.js';

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

export const sendReturnNotice = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    // Fetch the user and item details
    const user = await User.findById(userId);
    const equipment = await Equipment.findById(itemId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Create a new notice
    const newNotice = new Notice({
      title: `Return Reminder for ${equipment.name}`,
      message: `Please return the borrowed item "${equipment.name}".`,
      userId: user._id, // Associate the notice with the user
      public: false, // Mark the notice as private
    });

    await newNotice.save(); // Save the notice to the database

    console.log(`Notice saved for user ${user.email} regarding item: ${equipment.name}`);
    res.status(200).json({ message: `Notice sent to ${user.email} for item: ${equipment.name}` });
  } catch (error) {
    console.error('Error in sendReturnNotice:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentBorrowedItems = async (req, res) => {
  try {
    // Fetch all equipment with currently borrowed records
    const equipment = await Equipment.find({ 'borrowedBy.returnedAt': null }).populate(
      'borrowedBy.userId',
      'username email'
    );

    // Transform the data to include detailed information
    const currentBorrowedItems = equipment.map((item) => ({
      itemId: item._id,
      itemName: item.name,
      category: item.category,
      borrowedBy: item.borrowedBy
        .filter((borrow) => borrow.returnedAt === null) // Only include currently borrowed records
        .map((borrow) => ({
          userId: borrow.userId._id,
          username: borrow.userId.username,
          email: borrow.userId.email,
          borrowedAt: borrow.borrowedAt,
          quantity: borrow.quantity,
        })),
    }));

    res.status(200).json(currentBorrowedItems);
  } catch (error) {
    console.error('Error in getCurrentBorrowedItems:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getBorrowedItems = async (req, res) => {
  try {
    // Fetch all equipment with borrowed records
    const equipment = await Equipment.find({ 'borrowedBy.0': { $exists: true } }).populate('borrowedBy.userId', 'username email');

    // Transform the data to include detailed information
    const borrowedItems = equipment.map((item) => ({
      itemId: item._id,
      itemName: item.name,
      category: item.category,
      borrowedBy: item.borrowedBy.map((borrow) => ({
        userId: borrow.userId._id,
        username: borrow.userId.username,
        email: borrow.userId.email,
        registrationNumber: borrow.registrationNumber, // <-- add this line
        borrowedAt: borrow.borrowedAt,
        returnedAt: borrow.returnedAt,
        quantity: borrow.quantity,
        isApproved: borrow.isApproved,
      })),
    }));

    res.status(200).json(borrowedItems);
  } catch (error) {
    console.error('Error in getBorrowedItems:', error.message);
    res.status(500).json({ message: error.message });
  }
};
export const borrowEquipment = async (req, res) => {
  const { itemId, userId, registrationNumber } = req.body; // <-- get registrationNumber

  try {
    const equipment = await Equipment.findById(itemId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.available <= 0) {
      return res.status(400).json({ message: 'No available items to borrow' });
    }

    equipment.available -= 1;
    equipment.borrowedBy.push({
      userId,
      registrationNumber, // <-- save it here
      borrowedAt: new Date()
    });
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

export const getEquipmentAnalytics = async (req, res) => {
  const { timeframe, startDate, endDate } = req.query;
  
  try {
    let dateFilter = {};
    
    // Set date filter based on timeframe
    if (timeframe === 'custom' && startDate && endDate) {
      dateFilter = {
        borrowedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Calculate date range based on timeframe
      const today = new Date();
      let pastDate = new Date();
      
      switch (timeframe) {
        case 'week':
          pastDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          pastDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          pastDate.setMonth(today.getMonth() - 1); // Default to last month
      }
      
      dateFilter = {
        borrowedAt: {
          $gte: pastDate,
          $lte: today
        }
      };
    }

    // Get equipment with borrowed history that matches the date filter
    const equipment = await Equipment.find({ 
      'borrowedBy.borrowedAt': { 
        $gte: dateFilter.borrowedAt.$gte, 
        $lte: dateFilter.borrowedAt.$lte 
      } 
    }).populate('borrowedBy.userId', 'username email registrationNumber');

    // Prepare data for most borrowed equipment
    const equipmentUsageMap = {};
    
    // Prepare data for category usage
    const categoryUsageMap = {};
    
    // Prepare data for usage over time
    const timeframeDataMap = {};

    // Process all borrowing records
    equipment.forEach(item => {
      // Only consider borrows within the date range
      const relevantBorrows = item.borrowedBy.filter(borrow => 
        borrow.borrowedAt >= dateFilter.borrowedAt.$gte &&
        borrow.borrowedAt <= dateFilter.borrowedAt.$lte
      );

      // Process equipment usage
      if (!equipmentUsageMap[item.name]) {
        equipmentUsageMap[item.name] = {
          name: item.name,
          borrowCount: 0,
          quantityBorrowed: 0
        };
      }
      
      equipmentUsageMap[item.name].borrowCount += relevantBorrows.length;
      
      // Add up all quantities borrowed
      const totalQuantity = relevantBorrows.reduce(
        (total, borrow) => total + (borrow.quantity || 1), 0
      );
      equipmentUsageMap[item.name].quantityBorrowed += totalQuantity;

      // Process category usage - now tracking quantity
      if (!categoryUsageMap[item.category]) {
        categoryUsageMap[item.category] = {
          name: item.category,
          count: 0,
          value: 0
        };
      }
      categoryUsageMap[item.category].count += relevantBorrows.length;
      categoryUsageMap[item.category].value += totalQuantity;

      // Process usage over time - now tracking quantity
      relevantBorrows.forEach(borrow => {
        const borrowDate = borrow.borrowedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
        const borrowQuantity = borrow.quantity || 1; // Default to 1 if quantity not specified
        
        if (!timeframeDataMap[borrowDate]) {
          timeframeDataMap[borrowDate] = {
            date: borrowDate,
            borrowCount: 0,
            returnCount: 0,
            quantityBorrowed: 0,
            quantityReturned: 0
          };
        }
        
        timeframeDataMap[borrowDate].borrowCount += 1;
        timeframeDataMap[borrowDate].quantityBorrowed += borrowQuantity;
        
        // If item was returned, count it for the return date
        if (borrow.returnedAt) {
          const returnDate = borrow.returnedAt.toISOString().split('T')[0];
          
          if (!timeframeDataMap[returnDate]) {
            timeframeDataMap[returnDate] = {
              date: returnDate,
              borrowCount: 0,
              returnCount: 0,
              quantityBorrowed: 0,
              quantityReturned: 0
            };
          }
          
          timeframeDataMap[returnDate].returnCount += 1;
          timeframeDataMap[returnDate].quantityReturned += borrowQuantity;
        }
      });
    });

    // Convert map data to arrays for the frontend
    const equipmentUsage = Object.values(equipmentUsageMap)
      .sort((a, b) => b.quantityBorrowed - a.quantityBorrowed) // Sort by quantity instead of count
      .slice(0, 10); // Top 10 most borrowed by quantity
      
    // Convert category usage map to array and format for the pie chart
    const categoryUsage = Object.values(categoryUsageMap);
    
    let timeframeData = Object.values(timeframeDataMap);
    
    // Sort timeframe data chronologically
    timeframeData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      equipmentUsage,
      categoryUsage,
      timeframeData
    });
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: error.message });
  }
};