import express from 'express';
import {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  returnEquipment,
  getPendingReturns,
  getAllEquipmentWithBorrowedInfo,
  approveReturn, // Import the approveReturn function
} from '../controllers/equipment.controller.js';

const router = express.Router();

// Define routes explicitly
router.get('/all', getAllEquipment); // Fetch all equipment
router.post('/create', createEquipment); // Create new equipment
router.put('/update/:id', updateEquipment); // Update existing equipment
router.delete('/delete/:id', deleteEquipment); // Delete equipment
router.post('/borrow', borrowEquipment); // Borrow equipment
router.get('/all-with-borrowed-info', getAllEquipmentWithBorrowedInfo); // Fetch all equipment with borrowed info
router.post('/return', returnEquipment); // Return borrowed equipment
router.get('/pending-returns', getPendingReturns); // Route to fetch pending returns
router.post('/approve-return', approveReturn); // Route to approve returns

export default router;