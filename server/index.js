import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { getDb } from './middleware/db.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/sync', authMiddleware, syncRoutes);
app.use('/api/leaderboard', authMiddleware, leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Init DB and start
try {
  const db = getDb();
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`LearnYB server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err.message);
  if (!process.env.NODE_ENV) {
    console.log('Hint: run "cd server && npm install" first');
  }
}
