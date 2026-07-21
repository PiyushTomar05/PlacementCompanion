import express from 'express';
import { DataStore } from '../models/index.js';

const router = express.Router();

// GET /api/dashboard - Combined statistics, streak, daily progress
router.get('/', async (req, res) => {
  try {
    const progress = await DataStore.getProgress();
    const tasks = await DataStore.getDailyTasks();
    const words = await DataStore.getEnglishWords();
    const csTopics = await DataStore.getCsTopics();

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length;
    const dailyCompletionPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

    res.json({
      success: true,
      data: {
        progress,
        tasks,
        dailyCompletionPercentage,
        totalWords: words.length,
        totalTopics: csTopics.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dashboard/task/:id/toggle
router.post('/task/:id/toggle', async (req, res) => {
  try {
    const task = await DataStore.toggleTask(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
