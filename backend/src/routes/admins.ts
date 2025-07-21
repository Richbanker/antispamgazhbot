import { Router, Request, Response, NextFunction } from 'express';
// @ts-ignore
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

router.get('/', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const admins = await db.all('SELECT user_id, username, role FROM admins');
  res.json(admins);
});

router.post('/', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const { user_id, username, role } = req.body;
  await db.run('INSERT OR REPLACE INTO admins (user_id, username, role) VALUES (?, ?, ?)', user_id, username, role);
  res.json({ success: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const db = await dbPromise;
  await db.run('DELETE FROM admins WHERE user_id = ?', req.params.id);
  res.json({ success: true });
});

export default router; 