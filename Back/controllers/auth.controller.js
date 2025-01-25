import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  const { username, email, password, studentRegNumber } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, studentRegNumber });

  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "User already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
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
    const token = jwt.sign({ id: validuser._id }, process.env.JWT_SECRET)
    const {password:pass, ...rest} = validuser._doc;
    res
    .cookie("token", token, { httpOnly: true})
    .status(200)
    .json(rest);
    
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}
