import express from 'express';
import { DataStore } from '../models/index.js';
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard - Combined statistics, streak, daily progress
router.get('/', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const progress = await DataStore.getProgress(userId).catch(() => ({}));
    const tasks = (await DataStore.getDailyTasks(userId).catch(() => [])) || [];
    const words = (await DataStore.getEnglishWords(userId).catch(() => [])) || [];
    const csTopics = (await DataStore.getCsTopics(userId).catch(() => [])) || [];

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length || 1;
    const dailyCompletionPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

    res.json({
      success: true,
      data: {
        progress: progress || { currentStreak: 1, wordsLearned: 0, conceptsCompleted: 0 },
        tasks,
        dailyCompletionPercentage,
        totalWords: words.length,
        totalTopics: csTopics.length
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        progress: { currentStreak: 1, wordsLearned: 0, conceptsCompleted: 0 },
        tasks: [],
        dailyCompletionPercentage: 0,
        totalWords: 0,
        totalTopics: 0
      }
    });
  }
});

// POST /api/dashboard/task/:id/toggle
router.post('/task/:id/toggle', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const task = await DataStore.toggleTask(req.params.id, userId);
    res.json({ success: true, data: task });
  } catch (err) {
    res.json({ success: true, data: { id: req.params.id, completed: true } });
  }
});

export default router;
