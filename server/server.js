import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import * as initialData from './data/initialData.js';

import dashboardRoutes from './routes/dashboard.js';
import englishRoutes from './routes/english.js';
import csRoutes from './routes/cs.js';
import revisionRoutes from './routes/revision.js';
import interviewRoutes from './routes/interview.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
await connectDB(initialData);

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/english', englishRoutes);
app.use('/api/cs', csRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/search', searchRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', name: 'Placement Companion API', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Placement Companion Backend running on http://localhost:${PORT}`);
});
