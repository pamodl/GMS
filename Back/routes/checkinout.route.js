import express from 'express';
import { checkIn, checkOut, getActiveUsersCount, getCheckInStatus, getLastSevenDaysCheckInData } from '../controllers/checkinout.controller.js';

const router = express.Router();

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/active-users-count', getActiveUsersCount);
router.get('/status/:userId', getCheckInStatus);
router.get('/last-seven-days', getLastSevenDaysCheckInData);


export default router;