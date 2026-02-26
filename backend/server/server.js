import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';

// Routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import resultRoutes from './routes/results.js';
import activateRoute from './routes/activate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (non-blocking)
connectDB();

// Global API rate limiter to reduce abusive traffic
const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000), // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX || 150), // 150 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again after some time.'
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
// Endpoint to trigger Atlas resume (safe-guarded by env vars)
app.use('/api/activate-db', activateRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose && mongoose.connection && mongoose.connection.readyState === 1;
  res.json({ 
    status: 'OK', 
    message: 'QuizMaster API is running',
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
