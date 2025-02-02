import express from 'express';
import { checkIn, checkOut, getActiveUsersCount, getCheckInStatus } from '../controllers/checkinout.controller.js';

const router = express.Router();

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/active-users-count', getActiveUsersCount);
router.get('/status/:userId', getCheckInStatus);


export default router;