import express from 'express';
import { DataStore } from '../models/index.js';

const router = express.Router();

// GET /api/cs/topics - Get all daily CS topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await DataStore.getCsTopics();
    const notes = await DataStore.getUserNotes();
    const bookmarks = await DataStore.getBookmarks();

    const merged = topics.map(t => {
      const userNote = notes.find(n => n.topicId === t.id);
      const isBookmarked = bookmarks.some(b => b.itemId === t.id);
      return {
        ...t,
        note: userNote ? userNote.noteText : '',
        bookmarked: isBookmarked
      };
    });

    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cs/topic/:id/toggle - Toggle completion
router.post('/topic/:id/toggle', async (req, res) => {
  try {
    const topic = await DataStore.toggleCsTopicComplete(req.params.id);
    res.json({ success: true, data: topic });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cs/note - Save personal note
router.post('/note', async (req, res) => {
  try {
    const { topicId, noteText } = req.body;
    const result = await DataStore.saveNote(topicId, noteText);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cs/bookmark - Toggle bookmark
router.post('/bookmark', async (req, res) => {
  try {
    const { itemId, title, type = 'CS' } = req.body;
    const bookmarks = await DataStore.toggleBookmark(type, itemId, title);
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
