import express from 'express';
import { registerUser, loginUser, acceptTerms } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/accept-terms', protect, acceptTerms);

export default router;
