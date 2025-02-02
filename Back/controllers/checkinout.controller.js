import CheckIn from "../models/checkinout.model.js";

export const checkIn = async (req, res) => {
  const { userId } = req.body;
  try {
    const checkInRecord = new CheckIn({ userId, checkInTime: new Date() });
    await checkInRecord.save();
    res.status(201).json({ message: "Check-in successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  const { userId } = req.body;
  try {
    const checkInRecord = await CheckIn.findOne({ userId, checkOutTime: null });
    if (!checkInRecord) {
      return res.status(404).json({ message: "No active check-in found" });
    }
    checkInRecord.checkOutTime = new Date();
    await checkInRecord.save();
    res.status(200).json({ message: "Check-out successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveUsersCount = async (req, res) => {
  try {
    const activeUsersCount = await CheckIn.countDocuments({ checkOutTime: { $exists: false } });
    res.json({ count: activeUsersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};