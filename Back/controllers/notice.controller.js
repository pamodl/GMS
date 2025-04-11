import Notice from '../models/notice.model.js';
import User from '../models/user.model.js';
import Equipment from '../models/equipment.model.js';

export const createNotice = async (req, res) => {
  const { title, message, public: isPublic } = req.body; // Destructure the "public" field

  try {
    const newNotice = new Notice({
      title,
      message,
      public: isPublic, // Set the "public" field explicitly
    });

    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendReturnNotice = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    console.log('Request received:', { userId, itemId }); // Debugging log

    // Fetch the user and item details
    const user = await User.findById(userId);
    const equipment = await Equipment.findById(itemId);

    if (!user) {
      console.log('User not found'); // Debugging log
      return res.status(404).json({ message: 'User not found' });
    }

    if (!equipment) {
      console.log('Equipment not found'); // Debugging log
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Create a new notice
    const newNotice = new Notice({
      title: `Return Reminder for ${equipment.name}`,
      message: `Please return the borrowed item "${equipment.name}".`,
      userId: user._id, // Associate the notice with the user
      public: false, // Mark the notice as private
    });

    console.log('Saving notice:', newNotice); // Debugging log
    await newNotice.save();

    console.log('Notice saved successfully'); // Debugging log
    res.status(200).json({ message: `Notice sent to ${user.email} to return "${equipment.name}".` });
  } catch (error) {
    console.error('Error in sendReturnNotice:', error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

export const getUserNotices = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user-specific notices and public notices
    const notices = await Notice.find({
      $or: [{ userId }, { public: true }],
    }).sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    console.error('Error in getUserNotices:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const handleSendNotice = async (userId, itemId) => {
  try {
    console.log('Sending notice:', { userId, itemId }); // Debugging log
    const response = await axios.post('/Back/equipment/send-return-notice', { userId, itemId });
    console.log('Notice sent successfully:', response.data); // Debugging log
    setSuccess(response.data.message);
  } catch (err) {
    console.error('Error sending notice:', err.response?.data?.message || err.message); // Debugging log
    setError(err.response?.data?.message || 'Failed to send notice');
  }
};