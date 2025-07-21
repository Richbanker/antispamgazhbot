import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS stats (
  date TEXT PRIMARY KEY,
  messages INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  bans INTEGER DEFAULT 0
)`).run();

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const statsService = {
  incrementMessage() {
    const d = today();
    db.prepare('INSERT OR IGNORE INTO stats (date) VALUES (?)').run(d);
    db.prepare('UPDATE stats SET messages = messages + 1 WHERE date = ?').run(d);
  },
  incrementNewUser() {
    const d = today();
    db.prepare('INSERT OR IGNORE INTO stats (date) VALUES (?)').run(d);
    db.prepare('UPDATE stats SET new_users = new_users + 1 WHERE date = ?').run(d);
  },
  incrementBan() {
    const d = today();
    db.prepare('INSERT OR IGNORE INTO stats (date) VALUES (?)').run(d);
    db.prepare('UPDATE stats SET bans = bans + 1 WHERE date = ?').run(d);
  },
  getStatsForDays(days: number) {
    return db.prepare('SELECT * FROM stats ORDER BY date DESC LIMIT ?').all(days).reverse();
  }
}; 