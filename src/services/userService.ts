// @ts-nocheck
import Database from 'better-sqlite3';
import { UserRole } from '../roles/roleService';
const db = new Database('database.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  role TEXT DEFAULT 'newbie',
  join_date TEXT,
  messages_count INTEGER DEFAULT 0
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS warnings (
  user_id INTEGER PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_warn TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS faq (
  question TEXT PRIMARY KEY,
  answer TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS user_messages (
  user_id INTEGER,
  message TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS ai_categories (
  user_id INTEGER,
  category TEXT,
  date TEXT
)`).run();

import { config } from '../config';

export const userService = {
  async ensureUser(userId: number, username: string) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      db.prepare('INSERT INTO users (id, username, role, join_date, messages_count) VALUES (?, ?, ?, ?, 0)')
        .run(userId, username, 'newbie', new Date().toISOString());
    }
  },
  async getUser(userId: number): Promise<{ id: number, username: string, role: UserRole, join_date: string, messages_count: number } | null> {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as { id: number, username: string, role: UserRole, join_date: string, messages_count: number } || null;
  },
  async getUserByUsername(username: string): Promise<{ id: number, username: string, role: UserRole, join_date: string, messages_count: number } | null> {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number, username: string, role: UserRole, join_date: string, messages_count: number } || null;
  },
  async setRole(userId: number, role: UserRole) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  },
  async incrementMessages(userId: number) {
    db.prepare('UPDATE users SET messages_count = messages_count + 1 WHERE id = ?').run(userId);
  },
  async isNewUser(userId: number) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    return !user;
  },
  async muteUser(userId: number, durationMin: number) {
    // ... мут пользователя
  },
  async addWarning(userId: number, banNow = false) {
    const now = new Date().toISOString();
    const warn = db.prepare('SELECT * FROM warnings WHERE user_id = ?').get(userId);
    if (!warn) {
      db.prepare('INSERT INTO warnings (user_id, count, last_warn) VALUES (?, 1, ?)').run(userId, now);
    } else {
      db.prepare('UPDATE warnings SET count = count + 1, last_warn = ? WHERE user_id = ?').run(now, userId);
    }
    const updated = db.prepare('SELECT * FROM warnings WHERE user_id = ?').get(userId);
    if (banNow || updated.count >= config.WARN_LIMIT_BAN) {
      // ... бан пользователя (реализовать в боте)
      // Можно вызвать ctx.banChatMember(userId) в middleware
    } else if (updated.count >= config.WARN_LIMIT_MUTE) {
      // ... мут пользователя на 24 часа (реализовать в боте)
      // Можно вызвать ctx.restrictChatMember(userId, ...)
    }
  },
  async getWarnings(userId: number): Promise<{ count: number, last_warn: string } | null> {
    return db.prepare('SELECT count, last_warn FROM warnings WHERE user_id = ?').get(userId) || { count: 0, last_warn: null };
  },
  async resetWarnings(userId: number) {
    db.prepare('UPDATE warnings SET count = 0 WHERE user_id = ?').run(userId);
  },
  async getAllUsersWithWarnings(): Promise<Array<{ id: number, username: string, role: string, warnings: number }>> {
    const users = db.prepare('SELECT id, username, role FROM users').all();
    return users.map((u: any) => {
      const warn = db.prepare('SELECT count FROM warnings WHERE user_id = ?').get(u.id);
      return { ...u, warnings: warn?.count || 0 };
    });
  },
  async createFaq(question: string, answer: string) {
    db.prepare('INSERT OR REPLACE INTO faq (question, answer) VALUES (?, ?)').run(question, answer);
  },
  async getFaqByQuestion(question: string): Promise<string | null> {
    const row = db.prepare('SELECT answer FROM faq WHERE question = ?').get(question);
    return row?.answer || null;
  },
  async getTopUsers(limit = 10) {
    return db.prepare('SELECT username, messages_count as count FROM users ORDER BY messages_count DESC LIMIT ?').all(limit);
  },
  async getTopWords(limit = 10) {
    const rows = db.prepare('SELECT message FROM user_messages').all();
    const freq: Record<string, number> = {};
    for (const row of rows) {
      for (const word of (row.message || '').toLowerCase().split(/\W+/)) {
        if (word.length < 3) continue;
        freq[word] = (freq[word] || 0) + 1;
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count }));
  },
  async saveUserMessage(userId: number, message: string) {
    db.prepare('INSERT INTO user_messages (user_id, message) VALUES (?, ?)').run(userId, message);
  },
  async saveAICategory(userId: number, category: string) {
    db.prepare('INSERT INTO ai_categories (user_id, category, date) VALUES (?, ?, ?)')
      .run(userId, category, new Date().toISOString().slice(0, 10));
  },
  async getAICategoryStats(days = 1) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const rows = db.prepare('SELECT category, COUNT(*) as count FROM ai_categories WHERE date >= ? GROUP BY category').all(since);
    const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
    const stats: Record<string, number> = {};
    for (const r of rows) stats[r.category] = Math.round((r.count / total) * 100);
    return stats;
  },
}; 