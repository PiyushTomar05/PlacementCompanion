import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import dashboardRoutes from './routes/dashboard.js';
import englishRoutes from './routes/english.js';
import csRoutes from './routes/cs.js';
import revisionRoutes from './routes/revision.js';
import interviewRoutes from './routes/interview.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect notice:', e.message);
  }
  next();
});

// Mount API Routes on both /api/ and direct paths for Vercel serverless compatibility
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', name: 'Placement Companion API', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'online', name: 'Placement Companion API', timestamp: new Date().toISOString() });
});

// Serve static frontend in production if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler caught:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Listen if started directly via node server/server.js
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Placement Companion Backend running on http://localhost:${PORT}`);
  });
}

export default app;
