import express from 'express';
const router= express.Router();
import signupRouter from './signup.js';
import loginRouter from './login.js';
import ridesRouter from './rides.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { checkAuth } from '../controllers/auth.js';

router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/rides', ridesRouter);

// Authentication check route
router.get('/auth/check', verifyToken, checkAuth);

export default router;