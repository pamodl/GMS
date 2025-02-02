import express from 'express';
import { checkIn, checkOut, getActiveUsersCount } from '../controllers/checkinout.controller.js';

const router = express.Router();

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/active-users-count', getActiveUsersCount);

export default router;