import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/config/db.js';

import dashboardRoutes from '../server/routes/dashboard.js';
import englishRoutes from '../server/routes/english.js';
import csRoutes from '../server/routes/cs.js';
import revisionRoutes from '../server/routes/revision.js';
import interviewRoutes from '../server/routes/interview.js';
import searchRoutes from '../server/routes/search.js';
import authRoutes from '../server/routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect notice:', e.message);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/english', englishRoutes);
app.use('/english', englishRoutes);

app.use('/api/cs', csRoutes);
app.use('/cs', csRoutes);

app.use('/api/revision', revisionRoutes);
app.use('/revision', revisionRoutes);

app.use('/api/interview', interviewRoutes);
app.use('/interview', interviewRoutes);

app.use('/api/search', searchRoutes);
app.use('/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', name: 'Placement Companion API', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'online', name: 'Placement Companion API', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('API Serverless Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

export default app;
