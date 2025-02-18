import Notice from '../models/notice.model.js';

export const createNotice = async (req, res) => {
  const { title, message } = req.body;

  try {
    const newNotice = new Notice({
      title,
      message,
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