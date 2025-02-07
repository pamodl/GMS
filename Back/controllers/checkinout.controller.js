import CheckIn from '../models/checkinout.model.js';

// Check-in controller
export const checkIn = async (req, res) => {
  const { userId } = req.body;
  try {
    const existingCheckIn = await CheckIn.findOne({ userId, checkOutTime: { $exists: false } });
    if (existingCheckIn) {
      return res.status(400).json({ message: 'User is already checked in' });
    }
    const newCheckIn = new CheckIn({ userId, checkInTime: new Date() });
    await newCheckIn.save();
    res.status(201).json({ success: true, timestamp: newCheckIn.checkInTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check-out controller
export const checkOut = async (req, res) => {
  const { userId } = req.body;
  try {
    const existingCheckIn = await CheckIn.findOne({ userId, checkOutTime: { $exists: false } });
    if (!existingCheckIn) {
      return res.status(400).json({ message: 'User is not checked in' });
    }
    existingCheckIn.checkOutTime = new Date();
    await existingCheckIn.save();
    res.status(200).json({ success: true, timestamp: existingCheckIn.checkOutTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCheckInStatus = async (req, res) => {
    const { userId } = req.params;
    try {
      const checkInRecord = await CheckIn.findOne({ userId, checkOutTime: { $exists: false } });
      if (checkInRecord) {
        res.json({ isCheckedIn: true, lastCheckIn: checkInRecord.checkInTime });
      } else {
        res.json({ isCheckedIn: false });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Get active users count
export const getActiveUsersCount = async (req, res) => {
  try {
    const activeUsersCount = await CheckIn.countDocuments({ checkOutTime: { $exists: false } });
    res.json({ count: activeUsersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLastSevenDaysCheckInData = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const checkInData = await CheckIn.aggregate([
      {
        $match: {
          checkInTime: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%m-%d", date: "$checkInTime" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(checkInData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};