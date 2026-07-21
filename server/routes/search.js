import express from 'express';
import { DataStore } from '../models/index.js';

const router = express.Router();

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ success: true, data: { words: [], topics: [], questions: [], notes: [] } });
    }

    const words = await DataStore.getEnglishWords();
    const topics = await DataStore.getCsTopics();
    const questions = await DataStore.getInterviewQuestions();
    const notes = await DataStore.getUserNotes();

    const matchedWords = words.filter(w => 
      w.word.toLowerCase().includes(query) || 
      w.meaning.toLowerCase().includes(query) ||
      w.category.toLowerCase().includes(query)
    );

    const matchedTopics = topics.filter(t => 
      t.subject.toLowerCase().includes(query) || 
      t.topicName.toLowerCase().includes(query) ||
      t.definition.toLowerCase().includes(query)
    );

    const matchedQuestions = questions.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.category.toLowerCase().includes(query) ||
      q.subject.toLowerCase().includes(query)
    );

    const matchedNotes = notes.filter(n => n.noteText.toLowerCase().includes(query));

    res.json({
      success: true,
      data: {
        words: matchedWords,
        topics: matchedTopics,
        questions: matchedQuestions,
        notes: matchedNotes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
