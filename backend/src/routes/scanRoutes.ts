import express from 'express';
import { triggerScan, getScans, getScanById } from '../controllers/scanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, triggerScan);
router.get('/:domainId', protect, getScans);
router.get('/detail/:id', protect, getScanById);

export default router;
