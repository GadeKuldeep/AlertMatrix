import axios from 'axios';
import Scan from '../models/Scan.js';
import Domain from '../models/Domain.js';

const SCANNER_URL = process.env.SCANNER_URL || 'https://alertmatrix-2.onrender.com';




export const triggerScan = async (req, res) => {
    try {
        const { domainId } = req.body;
        const userId = req.user._id;

        const domainDoc = await Domain.findOne({ _id: domainId, user: userId });
        if (!domainDoc) {
            res.status(404).json({ message: 'Domain not found' });
            return;
        }

        if (!domainDoc.isVerified) {
            res.status(400).json({ message: 'Cannot scan unverified domain' });
            return;
        }

        const scan = await Scan.create({
            domain: domainId,
            user: userId,
            status: 'processing',
        });


        try {
            const response = await axios.post(`${SCANNER_URL}/scan`, {
                domain: domainDoc.domain,
                scan_id: scan._id.toString(),
            }, { timeout: 60000 });

            const result = response.data;

            scan.status = 'completed';
            scan.riskScore = result.risk_score;
            scan.findings = result.findings;
            scan.rawResult = result.details;
            scan.completedAt = new Date();
            await scan.save();

            domainDoc.lastScannedAt = new Date();
            await domainDoc.save();

            res.json(scan);

        } catch (scannerError) {
            console.error('Scanner Service Error:', scannerError.message);
            scan.status = 'failed';
            await scan.save();
            res.status(503).json({ message: 'Scanner service failed', error: scannerError.message });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




export const getScans = async (req, res) => {
    try {
        const { domainId } = req.params;

        const domain = await Domain.findOne({ _id: domainId, user: req.user._id });
        if (!domain) {
            res.status(404).json({ message: 'Domain not found' });
            return;
        }

        const scans = await Scan.find({ domain: domainId }).sort({ startedAt: -1 });
        res.json(scans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




export const getScanById = async (req, res) => {
    try {
        const { id } = req.params;
        const scan = await Scan.findOne({ _id: id, user: req.user._id }).populate('domain');

        if (!scan) {
            res.status(404).json({ message: 'Scan not found' });
            return;
        }
        res.json(scan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
