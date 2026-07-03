import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../middleware/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'learnyb-secret-change-in-production';
const SALT_ROUNDS = 10;

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, display_name } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    if (username.length < 3) return res.status(400).json({ error: '用户名至少 3 个字符' });
    if (password.length < 6) return res.status(400).json({ error: '密码至少 6 个字符' });

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(409).json({ error: '用户名已存在' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = db.prepare(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
    ).run(username, password_hash, display_name || username);

    const token = createToken(result.lastInsertRowid, username);
    res.json({ token, user: { id: result.lastInsertRowid, username, display_name: display_name || username } });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: '用户名或密码错误' });

    const token = createToken(user.id, user.username);

    // Update session (30 day expiry)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT OR REPLACE INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .run(token, user.id, expiresAt);

    res.json({
      token,
      user: { id: user.id, username: user.username, display_name: user.display_name }
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ ok: true });
});

// Me
router.get('/me', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未登录' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, username, display_name, created_at FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: '用户不存在' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
});

function createToken(userId, username) {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '30d' });
}

export default router;
