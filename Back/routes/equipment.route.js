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
  getBorrowedItems,
  getCurrentBorrowedItems,
  sendReturnNotice,
  approveReturn,
  getEquipmentAnalytics,
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
router.get('/borrowed-items', getBorrowedItems); // Route to fetch borrowed items
router.get('/current-borrowed-items', getCurrentBorrowedItems); // Route to fetch currently borrowed items
router.post('/send-return-notice', sendReturnNotice); // Route to send return notices
router.get('/analytics', getEquipmentAnalytics); // Route to fetch equipment usage analytics

export default router;