import { Router, Request, Response, NextFunction } from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const router = Router();
const dbPromise = open({
  filename: process.env.DATABASE_PATH || '../database.sqlite',
  driver: sqlite3.Database
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.get('/summary', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const total = await db.get('SELECT SUM(messages) as messages, SUM(new_users) as new_users, SUM(bans) as bans FROM stats');
  const spam = await db.get("SELECT COUNT(*) as spam FROM ai_categories WHERE category = 'spam'");
  res.json({
    messages: total.messages || 0,
    new_users: total.new_users || 0,
    bans: total.bans || 0,
    spam: spam.spam || 0
  });
});

router.get('/activity', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const stats = await db.all('SELECT * FROM stats ORDER BY date DESC LIMIT 30');
  res.json(stats.reverse());
});

router.get('/topusers', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const top = await db.all('SELECT username, messages_count as count FROM users ORDER BY messages_count DESC LIMIT 10');
  res.json(top);
});

router.get('/topwords', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all('SELECT message FROM user_messages');
  const freq: Record<string, number> = {};
  for (const row of rows) {
    for (const word of (row.message || '').toLowerCase().split(/\W+/)) {
      if (word.length < 3) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({ word, count }));
  res.json(top);
});

router.get('/categories', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all('SELECT category, COUNT(*) as count FROM ai_categories WHERE date >= date("now", "-7 day") GROUP BY category');
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  const stats: Record<string, number> = {};
  for (const r of rows) stats[r.category] = Math.round((r.count / total) * 100);
  res.json(stats);
});

export default router; 