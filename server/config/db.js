import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local_db.json');

export let isMongoConnected = false;

// Initialize local DB file if not present
export function ensureLocalDbExists(initialData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const defaultStructure = {
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
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(defaultStructure, null, 2));
  }
}

export function readLocalDb() {
  try {
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db file:', err);
    return {};
  }
}

export function writeLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to local db file:', err);
  }
}

export async function connectDB(initialData) {
  ensureLocalDbExists(initialData);

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_companion';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully!');
  } catch (err) {
    isMongoConnected = false;
    console.log('ℹ️ MongoDB not available. Operating seamlessly with Local JSON DB Fallback.');
  }
}
