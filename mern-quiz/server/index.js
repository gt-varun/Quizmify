import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import questionRoutes from './routes/questions.js';
import participantRoutes from './routes/participants.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();

// Trust proxy (required for Render/reverse proxy + rate limiting)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true, // allows any localhost port during development
  credentials: true,
}));

app.use(express.json());

// Rate limiting — only protect auth and AI endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'AI generation limit reached, please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes — apply auth limiter only to login/register, not /me
app.post('/api/auth/login', authLimiter);
app.post('/api/auth/register', authLimiter);
app.post('/api/auth/forgot-password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
const PORT = process.env.PORT || 5005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmify';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

