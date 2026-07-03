import express from 'express';
import { getDb } from '../middleware/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.post('/push', authMiddleware, (req, res) => {
  try {
    const { mastered, attempts, gamification, learning_stages, recording_history, search_history } = req.body;
    const db = getDb();

    const data = JSON.stringify({
      mastered: mastered || [],
      attempts: attempts || {},
      gamification: gamification || null,
      learning_stages: learning_stages || {},
      recording_history: recording_history || [],
      search_history: search_history || [],
      synced_at: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    db.prepare(
      'INSERT OR REPLACE INTO user_data (user_id, data, updated_at) VALUES (?, ?, ?)'
    ).run(req.user.userId, data, now);

    res.json({ ok: true, synced_at: new Date().toISOString() });
  } catch (err) {
    console.error('Sync push error:', err.message);
    res.status(500).json({ error: '同步失败' });
  }
});

// Pull
router.get('/pull', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT data FROM user_data WHERE user_id = ?').get(req.user.userId);

    if (row) {
      res.json({ data: JSON.parse(row.data) });
    } else {
      res.json({ data: null });
    }
  } catch (err) {
    res.status(500).json({ error: '拉取失败' });
  }
});

// Last sync time
router.get('/status', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT updated_at FROM user_data WHERE user_id = ?').get(req.user.userId);
    res.json({ last_sync: row?.updated_at || null });
  } catch {
    res.json({ last_sync: null });
  }
});

export default router;
