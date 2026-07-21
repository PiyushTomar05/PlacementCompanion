import express from 'express';
import { DataStore } from '../models/index.js';
import { evaluateSentence } from '../services/aiService.js';

const router = express.Router();

// GET /api/english/words - Today's 10 words
router.get('/words', async (req, res) => {
  try {
    const words = await DataStore.getEnglishWords();
    res.json({ success: true, data: words });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/english/review - AI sentence review
router.post('/review', async (req, res) => {
  try {
    const { wordId, word, sentence } = req.body;
    if (!word || !sentence) {
      return res.status(400).json({ success: false, error: "Word and sentence are required." });
    }

    const evaluation = await evaluateSentence(word, sentence);

    // Save submission to database
    await DataStore.addSubmission({
      wordId,
      word,
      userSentence: sentence,
      evaluation
    });

    res.json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
