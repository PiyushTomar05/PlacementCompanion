import express from 'express';
import { DataStore } from '../models/index.js';
import { evaluateInterviewAnswer } from '../services/aiService.js';

const router = express.Router();

// GET /api/interview/questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await DataStore.getInterviewQuestions();
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/interview/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { questionId, question, category, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: "Question and answer are required." });
    }

    const evaluation = await evaluateInterviewAnswer(question, answer, category || 'Technical');
    res.json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
