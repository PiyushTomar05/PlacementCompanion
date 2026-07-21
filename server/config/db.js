import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongoConnected = false;
let memoryDb = null;

function getDbFilePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'local_db.json');
  }
  return path.join(process.cwd(), 'server', 'data', 'local_db.json');
}

const getDefaultStructure = () => ({
  daily_lessons: {},
  completed_topics: [],
  english_submissions: [],
  user_notes: [],
  bookmarks: [],
  daily_tasks: [
    { id: 't1', title: "Daily 10 Placement English Words", module: 'English', completed: false },
    { id: 't2', title: "Sentence Writing & AI Review", module: 'English', completed: false },
    { id: 't3', title: "Daily 10 Core CS Master Roadmap Topics", module: 'CS', completed: false },
    { id: 't4', title: "Daily Spaced Repetition Revision", module: 'Revision', completed: false }
  ],
  progress: {
    currentStreak: 1,
    longestStreak: 1,
    wordsLearned: 0,
    sentencesWritten: 0,
    avgGrammarScore: 0,
    avgEnglishScore: 0,
    conceptsCompleted: 0,
    conceptCompletionPercentage: 0,
    interviewReadinessScore: 0,
    subjectProgress: {
      "Object-Oriented Programming": 0,
      "Database Management System": 0,
      "Operating System": 0,
      "Computer Networks": 0,
      "JavaScript": 0,
      "React": 0,
      "Node.js & Express": 0,
      "MongoDB": 0,
      "Git & GitHub": 0,
      "DSA Concepts": 0
    },
    weeklyActivity: [
      { day: 'Mon', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Tue', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Wed', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Thu', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Fri', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Sat', words: 0, cs: 0, reviewScore: 0 },
      { day: 'Sun', words: 0, cs: 0, reviewScore: 0 }
    ]
  }
});

export function ensureLocalDbExists() {
  try {
    const filePath = getDbFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      const defaultStructure = getDefaultStructure();
      fs.writeFileSync(filePath, JSON.stringify(defaultStructure, null, 2));
      memoryDb = defaultStructure;
    }
  } catch (err) {
    if (!memoryDb) memoryDb = getDefaultStructure();
  }
}

export function readLocalDb() {
  try {
    const filePath = getDbFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      memoryDb = JSON.parse(raw);
      return memoryDb;
    }
  } catch (err) {}
  if (!memoryDb) memoryDb = getDefaultStructure();
  return memoryDb;
}

export function writeLocalDb(data) {
  memoryDb = data;
  try {
    const filePath = getDbFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {}
}

export async function connectDB() {
  ensureLocalDbExists();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    isMongoConnected = false;
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas Cloud successfully!');
  } catch (err) {
    isMongoConnected = false;
    console.error('ℹ️ MongoDB Atlas Connection Error:', err.message);
  }
}

export { isMongoConnected };
