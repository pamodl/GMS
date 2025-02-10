import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import { login } from '../controllers/auth.controller.js';
import { getBorrowedItems } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login' , login);
router.get('/:userId/borrowed-items', getBorrowedItems);
export default router;