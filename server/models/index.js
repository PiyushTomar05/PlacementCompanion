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
  userId: { type: String, index: true },
  wordId: String,
  word: String,
  userSentence: String,
  evaluation: Object,
  date: { type: Date, default: Date.now }
});

const CompletedTopicSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  topicId: String,
  topicName: String,
  subject: String,
  completedAt: { type: Date, default: Date.now }
});

const UserNoteSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  topicId: String,
  noteText: String,
  updatedAt: { type: Date, default: Date.now }
});

const BookmarkSchema = new mongoose.Schema({
  userId: { type: String, index: true },
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
  async getDailyLessonBundle(userId = null) {
    const today = getTodayDateStr();

    if (isMongoConnected) {
      let lesson = await MongoModels.DailyLesson.findOne({ date: today }).lean();
      if (lesson && lesson.englishWords?.length >= 10 && lesson.csTopics?.length >= 10) {
        if (userId) {
          const userCompleted = await MongoModels.CompletedTopic.find({ userId }).lean();
          const completedIds = new Set(userCompleted.map(c => c.topicId));
          lesson.csTopics = lesson.csTopics.map(t => ({
            ...t,
            completed: completedIds.has(t.id)
          }));
        }
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

      const result = await pendingBundlePromise;
      if (userId && result && result.csTopics) {
        const userCompleted = await MongoModels.CompletedTopic.find({ userId }).lean();
        const completedIds = new Set(userCompleted.map(c => c.topicId));
        result.csTopics = result.csTopics.map(t => ({
          ...t,
          completed: completedIds.has(t.id)
        }));
      }
      return result;
    }

    // Local DB JSON mode
    const db = readLocalDb();
    db.daily_lessons = db.daily_lessons || {};

    if (db.daily_lessons[today] && db.daily_lessons[today].englishWords?.length >= 10 && db.daily_lessons[today].csTopics?.length >= 10) {
      const lesson = JSON.parse(JSON.stringify(db.daily_lessons[today]));
      if (userId) {
        const userCompleted = (db.completed_topics || []).filter(c => c.userId === userId || (!c.userId && userId === 'default'));
        const completedIds = new Set(userCompleted.map(c => c.topicId));
        lesson.csTopics = lesson.csTopics.map(t => ({
          ...t,
          completed: completedIds.has(t.id)
        }));
      }
      return lesson;
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

    const result = await pendingBundlePromise;
    if (userId && result && result.csTopics) {
      const userCompleted = (db.completed_topics || []).filter(c => c.userId === userId);
      const completedIds = new Set(userCompleted.map(c => c.topicId));
      result.csTopics = result.csTopics.map(t => ({
        ...t,
        completed: completedIds.has(t.id)
      }));
    }
    return result;
  },

  // 1. English Words - Pulls from Daily Bundle
  async getEnglishWords(userId = null) {
    const bundle = await this.getDailyLessonBundle(userId);
    return bundle.englishWords || [];
  },

  // 2. Core CS Topics - Pulls from Daily Bundle
  async getCsTopics(userId = null) {
    const bundle = await this.getDailyLessonBundle(userId);
    return bundle.csTopics || [];
  },

  // 3. Spaced Repetition Revision Data - Pulls from Daily Bundle + History
  async getRevisionData(userId = null) {
    const bundle = await this.getDailyLessonBundle(userId);
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
  async addSubmission(submission, userId = 'default') {
    if (isMongoConnected) {
      const doc = new MongoModels.EnglishSubmission({ ...submission, userId });
      return await doc.save();
    }
    const db = readLocalDb();
    db.english_submissions = db.english_submissions || [];
    db.english_submissions.push({ id: Date.now().toString(), userId, ...submission, date: new Date().toISOString() });
    
    db.progress = db.progress || {};
    db.progress.sentencesWritten = (db.progress.sentencesWritten || 0) + 1;
    writeLocalDb(db);
    return submission;
  },

  // 5. Toggle CS Topic completion & update history
  async toggleCsTopicComplete(topicId, userId = 'default') {
    const today = getTodayDateStr();

    if (isMongoConnected) {
      const lesson = await MongoModels.DailyLesson.findOne({ date: today });
      if (lesson && lesson.csTopics) {
        const topic = lesson.csTopics.find(t => t.id === topicId);
        if (topic) {
          const existingCompleted = await MongoModels.CompletedTopic.findOne({ topicId: topic.id, userId });
          const isNowCompleted = !existingCompleted;

          if (isNowCompleted) {
            await MongoModels.CompletedTopic.create({
              userId,
              topicId: topic.id,
              topicName: topic.topicName,
              subject: topic.subject
            });
          } else {
            await MongoModels.CompletedTopic.deleteOne({ topicId: topic.id, userId });
          }
          return { ...topic, completed: isNowCompleted };
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
        const index = db.completed_topics.findIndex(c => c.topicId === topic.id && (c.userId === userId || (!c.userId && userId === 'default')));
        let isNowCompleted = false;
        if (index > -1) {
          db.completed_topics.splice(index, 1);
          isNowCompleted = false;
        } else {
          db.completed_topics.push({ userId, topicId: topic.id, topicName: topic.topicName, subject: topic.subject, date: new Date().toISOString() });
          isNowCompleted = true;
        }

        const userCompletedCount = db.completed_topics.filter(c => c.userId === userId || (!c.userId && userId === 'default')).length;
        db.progress = db.progress || {};
        db.progress.conceptsCompleted = userCompletedCount;
        db.progress.conceptCompletionPercentage = Math.min(100, Math.round((userCompletedCount / 300) * 100));

        writeLocalDb(db);
        return { ...topic, completed: isNowCompleted };
      }
    }
    return null;
  },

  async getDailyTasks(userId = 'default') {
    const db = readLocalDb();
    const tasks = db.daily_tasks || [];
    return tasks.map(t => ({
      ...t,
      completed: !!(db.user_completed_tasks && db.user_completed_tasks[userId] && db.user_completed_tasks[userId][t.id])
    }));
  },

  async toggleTask(taskId, userId = 'default') {
    const db = readLocalDb();
    db.user_completed_tasks = db.user_completed_tasks || {};
    db.user_completed_tasks[userId] = db.user_completed_tasks[userId] || {};
    db.user_completed_tasks[userId][taskId] = !db.user_completed_tasks[userId][taskId];
    writeLocalDb(db);
    return { taskId, completed: db.user_completed_tasks[userId][taskId] };
  },

  async getProgress(userId = 'default') {
    if (isMongoConnected) {
      const completedDocs = await MongoModels.CompletedTopic.find({ userId }).lean();
      const sentences = await MongoModels.EnglishSubmission.find({ userId }).lean();
      const totalCompleted = completedDocs.length;
      return {
        streakDays: 1,
        totalStudyHours: Math.round(totalCompleted * 0.5),
        conceptsCompleted: totalCompleted,
        conceptCompletionPercentage: Math.min(100, Math.round((totalCompleted / 300) * 100)),
        sentencesWritten: sentences.length,
        vocabMasteryPercentage: Math.min(100, sentences.length * 5)
      };
    }
    const db = readLocalDb();
    const userCompleted = (db.completed_topics || []).filter(c => c.userId === userId || (!c.userId && userId === 'default'));
    const userSentences = (db.english_submissions || []).filter(s => s.userId === userId || (!s.userId && userId === 'default'));
    const totalCompleted = userCompleted.length;
    return {
      streakDays: 1,
      totalStudyHours: Math.round(totalCompleted * 0.5),
      conceptsCompleted: totalCompleted,
      conceptCompletionPercentage: Math.min(100, Math.round((totalCompleted / 300) * 100)),
      sentencesWritten: userSentences.length,
      vocabMasteryPercentage: Math.min(100, userSentences.length * 5)
    };
  },

  async getInterviewQuestions(userId = null) {
    const bundle = await this.getDailyLessonBundle(userId);
    return bundle.interviewQuestions || [];
  },

  async getUserNotes(userId = 'default') {
    if (isMongoConnected) {
      return await MongoModels.UserNote.find({ userId }).lean();
    }
    const db = readLocalDb();
    return (db.user_notes || []).filter(n => n.userId === userId || (!n.userId && userId === 'default'));
  },

  async saveNote(topicId, noteText, userId = 'default') {
    if (isMongoConnected) {
      const doc = await MongoModels.UserNote.findOneAndUpdate(
        { topicId, userId },
        { noteText, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return doc;
    }
    const db = readLocalDb();
    db.user_notes = db.user_notes || [];
    const existing = db.user_notes.find(n => n.topicId === topicId && (n.userId === userId || (!n.userId && userId === 'default')));
    if (existing) {
      existing.noteText = noteText;
      existing.updatedAt = new Date().toISOString();
    } else {
      db.user_notes.push({ userId, topicId, noteText, updatedAt: new Date().toISOString() });
    }
    writeLocalDb(db);
    return { topicId, noteText };
  },

  async getBookmarks(userId = 'default') {
    if (isMongoConnected) {
      return await MongoModels.Bookmark.find({ userId }).lean();
    }
    const db = readLocalDb();
    return (db.bookmarks || []).filter(b => b.userId === userId || (!b.userId && userId === 'default'));
  },

  async toggleBookmark(type, itemId, title, userId = 'default') {
    if (isMongoConnected) {
      const existing = await MongoModels.Bookmark.findOne({ itemId, userId });
      if (existing) {
        await MongoModels.Bookmark.deleteOne({ itemId, userId });
      } else {
        await MongoModels.Bookmark.create({ userId, type, itemId, title });
      }
      return await MongoModels.Bookmark.find({ userId }).lean();
    }
    const db = readLocalDb();
    db.bookmarks = db.bookmarks || [];
    const index = db.bookmarks.findIndex(b => b.itemId === itemId && (b.userId === userId || (!b.userId && userId === 'default')));
    if (index > -1) {
      db.bookmarks.splice(index, 1);
    } else {
      db.bookmarks.push({ userId, type, itemId, title, date: new Date().toISOString() });
    }
    writeLocalDb(db);
    return db.bookmarks.filter(b => b.userId === userId || (!b.userId && userId === 'default'));
  }
};

