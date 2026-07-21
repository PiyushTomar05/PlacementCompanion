import express from 'express';
import { DataStore } from '../models/index.js';

const router = express.Router();

// GET /api/revision/data - AI generated spaced repetition items
router.get('/data', async (req, res) => {
  try {
    const revision = await DataStore.getRevisionData();
    res.json({
      success: true,
      data: {
        dailyWords: revision.dailyWords,
        dailyCsTopics: revision.dailyCsTopics,
        interviewQuestions: revision.interviewQuestions,
        spacedIntervals: revision.spacedIntervals,
        weeklySummary: {
          vocabQuizAvailable: true,
          csQuizAvailable: true,
          interviewQuizAvailable: true
        },
        monthlyReport: {
          recommendedFocus: ["Operating System", "Computer Networks", "DSA Concepts"],
          revisionAccuracy: 92,
          masteryPercentage: 85
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
