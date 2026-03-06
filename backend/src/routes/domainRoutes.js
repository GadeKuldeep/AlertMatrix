import express from 'express';
import { getDomains, addDomain, verifyDomain, deleteDomain } from '../controllers/domainController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDomains);
router.post('/', protect, addDomain);
router.post('/:id/verify', protect, verifyDomain);
router.delete('/:id', protect, deleteDomain);

export default router;
