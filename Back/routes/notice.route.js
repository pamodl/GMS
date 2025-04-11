import express from 'express';
import { createNotice, getNotices,getUserNotices } from '../controllers/notice.controller.js';

const router = express.Router();

router.post('/create', createNotice);
router.get('/', getNotices);
router.get('/:userId', getUserNotices);

export default router;