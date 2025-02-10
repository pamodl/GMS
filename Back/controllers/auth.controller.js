import User from "../models/user.model.js";
import Equipment from "../models/equipment.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  const { username, email, password, regNumber, role } = req.body;
  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      regNumber,
      role,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = newUser._doc;
    res
      .cookie("token", token, { httpOnly: true })
      .status(201)
      .json({ token, user: rest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const validuser = await User.findOne({ email });
    if (!validuser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const passwordMatch = bcryptjs.compareSync(password, validuser.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign({ id: validuser._id, role: validuser.role }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validuser._doc;
    res
      .cookie("token", token, { httpOnly: true })
      .status(200)
      .json({ token, user: rest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBorrowedItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const borrowedItems = await Equipment.find({ 'borrowedBy.userId': userId })
      .select('name category borrowedBy')
      .lean();

    // Filter the borrowedBy array to only include entries for the specified user
    const filteredItems = borrowedItems.map(item => ({
      ...item,
      borrowedBy: item.borrowedBy.filter(borrow => borrow.userId.toString() === userId)
    }));

    res.status(200).json(filteredItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

