import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
    domain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domain',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    findings: [{
        severity: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low', 'info'],
        },
        title: String,
        description: String,
        remediation: String,
    }],
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
    rawResult: mongoose.Schema.Types.Mixed,
});

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;
