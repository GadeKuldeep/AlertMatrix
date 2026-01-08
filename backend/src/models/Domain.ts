import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    domain: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: true,
    },
    isChangeable: {
        type: Boolean,
        default: false,
        description: "For Luxury plan: indicates if this is the 1 changeable domain"
    },
    lastScannedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to ensure unique domains per user
domainSchema.index({ user: 1, domain: 1 }, { unique: true });

const Domain = mongoose.model('Domain', domainSchema);
export default Domain;
