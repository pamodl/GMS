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
            date: { $dateToString: { format: "%m-%d", date: "$checkInTime" } },
            hour: { $hour: "$checkInTime" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1, "_id.hour": 1 }
      }
    ]);

    // Generate a complete list of date-hour combinations for the last seven days
    const completeData = [];
    for (let d = new Date(sevenDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      for (let h = 0; h < 24; h++) {
        const monthDay = d.toISOString().split('T')[0].slice(5); // Extract MM-DD
        completeData.push({
          dateHour: `${monthDay} ${h}:00`,
          count: 0
        });
      }
    }

    // Merge the aggregated data with the complete list
    const mergedData = completeData.map(item => {
      const found = checkInData.find(data => `${data._id.date} ${data._id.hour}:00` === item.dateHour);
      return found ? { ...item, count: found.count } : item;
    });

    res.json(mergedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};