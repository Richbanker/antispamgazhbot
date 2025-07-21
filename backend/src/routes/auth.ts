import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { verifyTelegramAuth } from '../utils/verifyTelegramAuth';

const router = Router();

const dbPromise = open({
  filename: process.env.DATABASE_PATH || '../database.sqlite',
  driver: sqlite3.Database
});

router.post('/telegram', async (req, res) => {
  const { id, username, hash, ...rest } = req.body;
  if (!verifyTelegramAuth(req.body, process.env.TELEGRAM_BOT_TOKEN!)) {
    return res.status(401).json({ error: 'Invalid Telegram sign' });
  }
  const db = await dbPromise;
  const admin = await db.get('SELECT * FROM admins WHERE user_id = ?', id);
  if (!admin) return res.status(403).json({ error: 'Not admin' });
  const token = jwt.sign({ id, username, role: admin.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token });
});

export default router; 