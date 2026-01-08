import express from 'express';
import { getDomains, addDomain, verifyDomain, deleteDomain } from '../controllers/domainController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getDomains);
router.post('/', protect, addDomain);
router.post('/:id/verify', protect, verifyDomain);
router.delete('/:id', protect, deleteDomain);

export default router;
