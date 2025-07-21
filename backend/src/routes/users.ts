import { Router, Request, Response, NextFunction   } from 'express';
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

router.get('/list', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const users = await db.all('SELECT u.id, u.username, u.role, w.count as warnings FROM users u LEFT JOIN warnings w ON u.id = w.user_id');
  res.json(users);
});

router.post('/mute/:id', requireAuth, async (req, res) => {
  const db = await dbPromise;
  // Пример: мут на 10 минут
  await db.run('UPDATE users SET muted_until = ? WHERE id = ?', new Date(Date.now() + 10*60*1000).toISOString(), req.params.id);
  res.json({ success: true });
});

router.post('/ban/:id', requireAuth, async (req, res) => {
  const db = await dbPromise;
  await db.run('UPDATE users SET banned = 1 WHERE id = ?', req.params.id);
  res.json({ success: true });
});

router.post('/promote/:id', requireAuth, async (req, res) => {
  const db = await dbPromise;
  const { role } = req.body;
  await db.run('UPDATE users SET role = ? WHERE id = ?', role, req.params.id);
  res.json({ success: true });
});

export default router; 