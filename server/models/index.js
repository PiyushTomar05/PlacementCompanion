import mongoose from 'mongoose';
import { isMongoConnected, readLocalDb, writeLocalDb } from '../config/db.js';
import { generateUnifiedDailyLesson, evaluateSentence } from '../services/aiService.js';
import { MASTER_ROADMAP } from '../data/masterRoadmap.js';

// Mongoose Schemas for MongoDB mode
const DailyLessonSchema = new mongoose.Schema({
  date: { type: String, unique: true }, // Format: YYYY-MM-DD
  englishWords: [Object],
  csTopics: [Object],
  interviewQuestions: [Object],
  createdAt: { type: Date, default: Date.now }
});

const EnglishSubmissionSchema = new mongoose.Schema({
  wordId: String,
  word: String,
  userSentence: String,
  evaluation: Object,
  date: { type: Date, default: Date.now }
});

const CompletedTopicSchema = new mongoose.Schema({
  topicId: String,
  topicName: String,
  subject: String,
  completedAt: { type: Date, default: Date.now }
});

const UserNoteSchema = new mongoose.Schema({
  topicId: String,
  noteText: String,
  updatedAt: { type: Date, default: Date.now }
});

const BookmarkSchema = new mongoose.Schema({
  type: String, // 'CS', 'English', 'Interview'
  itemId: String,
  title: String,
  date: { type: Date, default: Date.now }
});

export const MongoModels = {
  DailyLesson: mongoose.models.DailyLesson || mongoose.model('DailyLesson', DailyLessonSchema),
  EnglishSubmission: mongoose.models.EnglishSubmission || mongoose.model('EnglishSubmission', EnglishSubmissionSchema),
  CompletedTopic: mongoose.models.CompletedTopic || mongoose.model('CompletedTopic', CompletedTopicSchema),
  UserNote: mongoose.models.UserNote || mongoose.model('UserNote', UserNoteSchema),
  Bookmark: mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema)
};

// Date helper YYYY-MM-DD
function getTodayDateStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// In-memory Promise Lock to prevent duplicate concurrent LLM requests on the same day
let pendingBundlePromise = null;

// Data Store Abstraction
export const DataStore = {

  // Single Unified Daily Lesson Bundle Fetcher (Consolidates ALL module generation into 1 LLM request per day)
  async getDailyLessonBundle() {
    const today = getTodayDateStr();

    if (isMongoConnected) {
      let lesson = await MongoModels.DailyLesson.findOne({ date: today }).lean();
      if (lesson && lesson.englishWords?.length >= 10 && lesson.csTopics?.length >= 10) {
        return lesson;
      }

      if (pendingBundlePromise) {
        return await pendingBundlePromise;
      }

      pendingBundlePromise = (async () => {
        try {
          const pastLessons = await MongoModels.DailyLesson.find().lean();
          const historyWords = pastLessons.flatMap(l => (l.englishWords || []).map(w => w.word));
          const completedDocs = await MongoModels.CompletedTopic.find().lean();
          const completedMap = {};
          completedDocs.forEach(doc => {
            completedMap[doc.subject] = completedMap[doc.subject] || [];
            completedMap[doc.subject].push(doc.topicName);
          });

          const bundle = await generateUnifiedDailyLesson(completedMap, historyWords);

          const savedDoc = await MongoModels.DailyLesson.findOneAndUpdate(
            { date: today },
            { 
              $set: { 
                englishWords: bundle.englishWords || [],
                csTopics: bundle.csTopics || [],
                interviewQuestions: bundle.interviewQuestions || []
              } 
            },
            { upsert: true, new: true }
          ).lean();
          return savedDoc;
        } finally {
          pendingBundlePromise = null;
        }
      })();

      return await pendingBundlePromise;
    }

    // Local DB JSON mode
    const db = readLocalDb();
    db.daily_lessons = db.daily_lessons || {};

    if (db.daily_lessons[today] && db.daily_lessons[today].englishWords?.length >= 10 && db.daily_lessons[today].csTopics?.length >= 10) {
      return db.daily_lessons[today];
    }

    if (pendingBundlePromise) {
      return await pendingBundlePromise;
    }

    pendingBundlePromise = (async () => {
      try {
        const historyWords = Object.values(db.daily_lessons).flatMap(l => (l.englishWords || []).map(w => w.word));
        const completedMap = {};
        (db.completed_topics || []).forEach(doc => {
          completedMap[doc.subject] = completedMap[doc.subject] || [];
          completedMap[doc.subject].push(doc.topicName);
        });

        const bundle = await generateUnifiedDailyLesson(completedMap, historyWords);

        db.daily_lessons[today] = {
          date: today,
          englishWords: bundle.englishWords || [],
          csTopics: bundle.csTopics || [],
          interviewQuestions: bundle.interviewQuestions || []
        };
        writeLocalDb(db);
        return db.daily_lessons[today];
      } finally {
        pendingBundlePromise = null;
      }
    })();

    return await pendingBundlePromise;
  },

  // 1. English Words - Pulls from Daily Bundle
  async getEnglishWords() {
    const bundle = await this.getDailyLessonBundle();
    return bundle.englishWords || [];
  },

  // 2. Core CS Topics - Pulls from Daily Bundle
  async getCsTopics() {
    const bundle = await this.getDailyLessonBundle();
    return bundle.csTopics || [];
  },

  // 3. Spaced Repetition Revision Data - Pulls from Daily Bundle + History
  async getRevisionData() {
    const bundle = await this.getDailyLessonBundle();
    const words = bundle.englishWords || [];
    const csTopics = bundle.csTopics || [];
    const interviewQuestions = bundle.interviewQuestions || [];

    const dailyWords = words.length >= 5 ? words.slice(-5) : words;

    const subjects = Object.keys(MASTER_ROADMAP);
    const dailyCsTopics = [];
    for (const sub of subjects) {
      const found = csTopics.find(t => t.subject === sub);
      if (found) dailyCsTopics.push(found);
    }

    return {
      dailyWords,
      dailyCsTopics,
      interviewQuestions,
      spacedIntervals: ["1 Day", "3 Days", "7 Days", "15 Days", "30 Days"]
    };
  },

  // 4. Add AI English Submission
  async addSubmission(submission) {
    if (isMongoConnected) {
      const doc = new MongoModels.EnglishSubmission(submission);
      return await doc.save();
    }
    const db = readLocalDb();
    db.english_submissions = db.english_submissions || [];
    db.english_submissions.push({ id: Date.now().toString(), ...submission, date: new Date().toISOString() });
    
    db.progress = db.progress || {};
    db.progress.sentencesWritten = (db.progress.sentencesWritten || 0) + 1;
    writeLocalDb(db);
    return submission;
  },

  // 5. Toggle CS Topic completion & update history
  async toggleCsTopicComplete(topicId) {
    const today = getTodayDateStr();

    if (isMongoConnected) {
      const lesson = await MongoModels.DailyLesson.findOne({ date: today });
      if (lesson && lesson.csTopics) {
        const topic = lesson.csTopics.find(t => t.id === topicId);
        if (topic) {
          topic.completed = !topic.completed;
          lesson.markModified('csTopics');
          await lesson.save();

          if (topic.completed) {
            await MongoModels.CompletedTopic.create({
              topicId: topic.id,
              topicName: topic.topicName,
              subject: topic.subject
            });
          } else {
            await MongoModels.CompletedTopic.deleteOne({ topicId: topic.id });
          }
          return topic;
        }
      }
    }

    const db = readLocalDb();
    db.daily_lessons = db.daily_lessons || {};
    db.completed_topics = db.completed_topics || [];

    const lesson = db.daily_lessons[today];
    if (lesson && lesson.csTopics) {
      const topic = lesson.csTopics.find(t => t.id === topicId);
      if (topic) {
        topic.completed = !topic.completed;
        if (topic.completed) {
          db.completed_topics.push({ topicId: topic.id, topicName: topic.topicName, subject: topic.subject, date: new Date().toISOString() });
        } else {
          db.completed_topics = db.completed_topics.filter(c => c.topicId !== topic.id);
        }

        const totalCompleted = db.completed_topics.length;
        db.progress = db.progress || {};
        db.progress.conceptsCompleted = totalCompleted;
        db.progress.conceptCompletionPercentage = Math.min(100, Math.round((totalCompleted / 300) * 100));

        writeLocalDb(db);
        return topic;
      }
    }
    return null;
  },

  async getDailyTasks() {
    const db = readLocalDb();
    return db.daily_tasks || [];
  },

  async toggleTask(taskId) {
    const db = readLocalDb();
    const tasks = db.daily_tasks || [];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      writeLocalDb(db);
    }
    return task;
  },

  async getProgress() {
    const db = readLocalDb();
    return db.progress || {
      streakDays: 1,
      totalStudyHours: 0,
      conceptsCompleted: 0,
      conceptCompletionPercentage: 0,
      sentencesWritten: 0,
      vocabMasteryPercentage: 0
    };
  },

  async getInterviewQuestions() {
    const bundle = await this.getDailyLessonBundle();
    return bundle.interviewQuestions || [];
  },

  async getUserNotes() {
    const db = readLocalDb();
    return db.user_notes || [];
  },

  async saveNote(topicId, noteText) {
    const db = readLocalDb();
    db.user_notes = db.user_notes || [];
    const existing = db.user_notes.find(n => n.topicId === topicId);
    if (existing) {
      existing.noteText = noteText;
      existing.updatedAt = new Date().toISOString();
    } else {
      db.user_notes.push({ topicId, noteText, updatedAt: new Date().toISOString() });
    }
    writeLocalDb(db);
    return { topicId, noteText };
  },

  async getBookmarks() {
    const db = readLocalDb();
    return db.bookmarks || [];
  },

  async toggleBookmark(type, itemId, title) {
    const db = readLocalDb();
    db.bookmarks = db.bookmarks || [];
    const index = db.bookmarks.findIndex(b => b.itemId === itemId);
    if (index > -1) {
      db.bookmarks.splice(index, 1);
    } else {
      db.bookmarks.push({ type, itemId, title, date: new Date().toISOString() });
    }
    writeLocalDb(db);
    return db.bookmarks;
  }
};
