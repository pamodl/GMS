import express from 'express';
import { createNotice, getNotices } from '../controllers/notice.controller.js';

const router = express.Router();

router.post('/create', createNotice);
router.get('/', getNotices);

export default router;