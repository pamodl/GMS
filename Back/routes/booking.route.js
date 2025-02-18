import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/create', createBooking);
router.get('/', getBookings);
router.put('/update-status', updateBookingStatus);

export default router;