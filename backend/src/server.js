import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/alertmatrix';


app.use(express.json());
app.use(cors({
    origin: ['https://alertmatrix.netlify.app', 'http://localhost:5173'],
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import scanRoutes from './routes/scanRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/scans', scanRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'AlertMatrix Backend' });
});


mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('⚠️ Make sure your MONGO_URI is correctly set in your environment variables.');
        // Don't exit immediately in some cases, but for this app the DB is critical
        process.exit(1);
    }
};

connectDB();
