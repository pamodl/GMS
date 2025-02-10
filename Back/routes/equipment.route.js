import express from 'express';
import {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  getAllEquipmentWithBorrowedInfo
} from '../controllers/equipment.controller.js';

const router = express.Router();

// Define routes explicitly
router.get('/all', getAllEquipment); // Fetch all equipment
router.post('/create', createEquipment); // Create new equipment
router.put('/update/:id', updateEquipment); // Update existing equipment
router.delete('/delete/:id', deleteEquipment); // Delete equipment
router.post('/borrow', borrowEquipment);
router.get('/all-with-borrowed-info', getAllEquipmentWithBorrowedInfo);

export default router;