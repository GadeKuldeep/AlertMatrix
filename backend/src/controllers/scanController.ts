import { Request, Response } from 'express';
import axios from 'axios';
import Scan from '../models/Scan';
import Domain from '../models/Domain';

const SCANNER_URL = 'http://localhost:8000';

// @desc    Trigger a manual scan
// @route   POST /api/scans
// @access  Private
export const triggerScan = async (req: Request, res: Response) => {
    try {
        const { domainId } = req.body;
        const userId = (req as any).user._id;

        const domainDoc = await Domain.findOne({ _id: domainId, user: userId });
        if (!domainDoc) {
            res.status(404).json({ message: 'Domain not found' });
            return;
        }

        if (!domainDoc.isVerified) {
            res.status(400).json({ message: 'Cannot scan unverified domain' });
            return;
        }

        // Create a scan record
        const scan = await Scan.create({
            domain: domainId,
            user: userId,
            status: 'processing',
        });

        // Call Python Service
        // We don't await this if we want it background, but here we might want to wait for ack
        // However, the prompt implies "Node <-> Python communication via REST API".
        // We will call the python service.

        try {
            const response = await axios.post(`${SCANNER_URL}/scan`, {
                domain: domainDoc.domain,
                scan_id: scan._id.toString(),
            }, { timeout: 60000 });

            const result = response.data;

            // Update scan record with result
            scan.status = 'completed';
            scan.riskScore = result.risk_score;
            scan.findings = result.findings;
            scan.rawResult = result.details;
            scan.completedAt = new Date();
            await scan.save();

            // Update domain last scanned
            domainDoc.lastScannedAt = new Date();
            await domainDoc.save();

            res.json(scan);

        } catch (scannerError: any) {
            console.error('Scanner Service Error:', scannerError.message);
            scan.status = 'failed';
            await scan.save();
            res.status(503).json({ message: 'Scanner service failed', error: scannerError.message });
        }

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get scans for a domain
// @route   GET /api/scans/:domainId
// @access  Private
export const getScans = async (req: Request, res: Response) => {
    try {
        const { domainId } = req.params;

        // Verify ownership
        const domain = await Domain.findOne({ _id: domainId, user: (req as any).user._id });
        if (!domain) {
            res.status(404).json({ message: 'Domain not found' });
            return;
        }

        const scans = await Scan.find({ domain: domainId }).sort({ startedAt: -1 });
        res.json(scans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single scan detail
// @route   GET /api/scans/detail/:id
// @access  Private
export const getScanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Check ownership via domain lookup or just user match on scan if I added user field to scan (I did)
        const scan = await Scan.findOne({ _id: id, user: (req as any).user._id }).populate('domain');

        if (!scan) {
            res.status(404).json({ message: 'Scan not found' });
            return;
        }
        res.json(scan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
