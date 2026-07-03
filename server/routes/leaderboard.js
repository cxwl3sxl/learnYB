import express from 'express';
import { getDb } from '../middleware/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get global leaderboard (top users by mastered count + XP)
router.get('/global', authMiddleware, (req, res) => {
  try {
    const db = getDb();

    // Gather all users with their data
    const users = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.created_at, ud.data
      FROM users u
      LEFT JOIN user_data ud ON u.id = ud.user_id
    `).all();

    const leaderboard = users.map(u => {
      let mastered = 0;
      let xp = 0;
      if (u.data) {
        try {
          const parsed = JSON.parse(u.data);
          mastered = (parsed.mastered || []).length;
          xp = parsed.gamification?.xp || 0;
        } catch {}
      }
      return {
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        mastered,
        xp,
        score: mastered * 10 + xp,
      };
    }).sort((a, b) => b.score - a.score).slice(0, 50);

    // Find current user's rank
    const me = db.prepare('SELECT data FROM user_data WHERE user_id = ?').get(req.user.userId);
    let myMastered = 0, myXP = 0;
    if (me?.data) {
      try {
        const parsed = JSON.parse(me.data);
        myMastered = (parsed.mastered || []).length;
        myXP = parsed.gamification?.xp || 0;
      } catch {}
    }
    const myScore = myMastered * 10 + myXP;
    const myRank = users.filter(u => {
      let s = 0;
      if (u.data) {
        try { s = (JSON.parse(u.data).mastered || []).length * 10 + (JSON.parse(u.data).gamification?.xp || 0); } catch {}
      }
      return s > myScore;
    }).length + 1;

    res.json({ leaderboard, my_rank: myRank, my_score: myScore });
  } catch (err) {
    res.status(500).json({ error: '获取排行榜失败' });
  }
});

export default router;
