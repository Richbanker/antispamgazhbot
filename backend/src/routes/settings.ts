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

// Для простоты настройки храним в таблице settings (key, value)
router.get('/', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all('SELECT key, value FROM settings');
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(settings);
});

router.post('/', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const updates = req.body;
  for (const key in updates) {
    await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, String(updates[key]));
  }
  res.json({ success: true });
});

export default router; 