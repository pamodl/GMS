import User from "../models/user.model.js";
import Trainer from '../models/trainer.model.js';
import Equipment from "../models/equipment.model.js";
import bcryptjs from "bcryptjs";
import Session from '../models/session.model.js';
import CheckIn from '../models/checkinout.model.js';

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
    console.error('Error fetching borrowed items:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUsersNotTrainers = async (req, res) => {
  try {
    console.log('Fetching users who are not trainers...');
    
    // Get all trainers
    const trainers = await Trainer.find().select('userId');
    console.log(`Found ${trainers.length} existing trainers`);
    
    const trainerUserIds = trainers.map(trainer => 
      trainer.userId ? trainer.userId.toString() : null
    ).filter(Boolean);
    
    // Then find all users who aren't in that list
    // UPDATED: Include all your actual user roles (student, academic, non-academic)
    const users = await User.find({ 
      _id: { $nin: trainerUserIds },
      // Include all roles except admin (if you want to restrict admin from being trainers)
      // Or include all roles if you want admins to be trainers too
      role: { $in: ['student', 'academic', 'non-academic'] }
    }).select('username email regNumber role');
    
    console.log(`Found ${users.length} eligible users`);
    
    res.status(200).json(users);
    
  } catch (error) {
    console.error('Error in getUsersNotTrainers:', error);
    res.status(500).json({ message: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users and exclude password field
    const users = await User.find().select('-password');
    
    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, regNumber, role, password } = req.body;

  try {
    // Check if username is already taken by another user
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Check if email is already taken by another user
    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail._id.toString() !== id) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // If the last admin is being changed, ensure there's at least one admin left
    if (role !== 'admin') {
      const currentUser = await User.findById(id);
      if (currentUser.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot change role of the last administrator' });
        }
      }
    }

    // Prepare update object
    const updateData = {
      username,
      email,
      regNumber,
      role
    };

    // If password is provided, hash it
    if (password) {
      updateData.password = bcryptjs.hashSync(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if this is the last admin
    const userToDelete = await User.findById(id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last administrator' });
      }
    }

    // Handle dependencies:
    // 1. Get all equipment with items borrowed by this user
    const equipmentWithBorrows = await Equipment.find({
      "borrowedBy.userId": id  // No need to convert to ObjectId, MongoDB does this automatically
    });

    // 2. Update each equipment to remove this user's borrows
    for (const equipment of equipmentWithBorrows) {
      // Filter out the user's borrow records
      const userBorrows = equipment.borrowedBy.filter(
        borrow => borrow.userId.toString() === id
      );
      
      // Add back quantities to available
      for (const borrow of userBorrows) {
        if (!borrow.returnedAt) {
          equipment.available += borrow.quantity;
        }
      }
      
      // Remove user's borrows from the equipment
      equipment.borrowedBy = equipment.borrowedBy.filter(
        borrow => borrow.userId.toString() !== id
      );
      
      await equipment.save();
    }
    
    // 3. Delete any trainer profile if user was a trainer
    try {
      await Trainer.findOneAndDelete({ userId: id });
    } catch (err) {
      console.error("No trainer profile found for this user:", err);
      // Continue deletion even if no trainer found
    }
    
    // Finally, delete the user
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};
