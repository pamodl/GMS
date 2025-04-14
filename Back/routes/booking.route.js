import express from 'express';
import { createBooking, getBookings, updateBookingStatus, getBookingsByUser } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/create', createBooking);
router.get('/', getBookings);
router.put('/update-status', updateBookingStatus);
router.get('/user/:userId', getBookingsByUser); // Route to fetch bookings for a specific user


export default router;