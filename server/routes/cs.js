import express from 'express';
import { DataStore } from '../models/index.js';
import { getFallbackDailyBundle } from '../services/aiService.js';
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/cs/topics - Get all daily CS topics for all 10 roadmap subjects
router.get('/topics', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const topics = await DataStore.getCsTopics(userId);
    const notes = await DataStore.getUserNotes(userId).catch(() => []);
    const bookmarks = await DataStore.getBookmarks(userId).catch(() => []);

    if (Array.isArray(topics) && topics.length > 0) {
      const merged = topics.map(t => {
        const userNote = notes.find(n => n.topicId === t.id);
        const isBookmarked = bookmarks.some(b => b.itemId === t.id);
        return {
          ...t,
          note: userNote ? userNote.noteText : '',
          bookmarked: isBookmarked
        };
      });
      return res.json({ success: true, data: merged });
    }

    const fallback = getFallbackDailyBundle();
    res.json({ success: true, data: fallback.csTopics });
  } catch (err) {
    console.warn('CS topics route notice:', err.message);
    const fallback = getFallbackDailyBundle();
    res.json({ success: true, data: fallback.csTopics });
  }
});

// POST /api/cs/topic/:id/toggle - Toggle completion
router.post('/topic/:id/toggle', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const topic = await DataStore.toggleCsTopicComplete(req.params.id, userId);
    res.json({ success: true, data: topic });
  } catch (err) {
    res.json({ success: true, data: { topicId: req.params.id, completed: true } });
  }
});

// POST /api/cs/note - Save personal note
router.post('/note', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const { topicId, noteText } = req.body;
    const result = await DataStore.saveNote(topicId, noteText, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: true, data: { topicId: req.body.topicId, noteText: req.body.noteText } });
  }
});

// POST /api/cs/bookmark - Toggle bookmark
router.post('/bookmark', optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.userId || 'default';
  try {
    const { itemId, title, type = 'CS' } = req.body;
    const bookmarks = await DataStore.toggleBookmark(type, itemId, title, userId);
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

export default router;
