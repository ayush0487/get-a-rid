import express from 'express';
import { checkAuth } from '../controllers/auth.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to check auth status
router.get('/verify', verifyToken, checkAuth);

export default router;
