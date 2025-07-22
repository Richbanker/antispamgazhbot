// @ts-nocheck
import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS admins (
  user_id INTEGER PRIMARY KEY,
  username TEXT,
  role TEXT CHECK(role IN ('owner','admin','moderator'))
)`).run();

export type AdminRole = 'owner' | 'admin' | 'moderator';

export const adminService = {
  addAdmin: (userId: number, username: string, role: AdminRole) => {
    db.prepare('INSERT OR REPLACE INTO admins (user_id, username, role) VALUES (?, ?, ?)')
      .run(userId, username, role);
  },
  removeAdmin: (userId: number) => {
    db.prepare('DELETE FROM admins WHERE user_id = ?').run(userId);
  },
  getAdmins: (): Array<{ user_id: number, username: string, role: AdminRole }> => {
    return db.prepare('SELECT * FROM admins').all() as Array<{ user_id: number, username: string, role: AdminRole }>;
  },
  getAdmin: (userId: number): { user_id: number, username: string, role: AdminRole } | null => {
    return db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) as { user_id: number, username: string, role: AdminRole } || null;
  },
  isOwner: (userId: number): boolean => {
    const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) as { role: AdminRole } | undefined;
    return admin?.role === 'owner';
  },
  isAdmin: (userId: number): boolean => {
    const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) as { role: AdminRole } | undefined;
    return admin?.role === 'admin' || admin?.role === 'owner';
  },
  isModerator: (userId: number): boolean => {
    const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) as { role: AdminRole } | undefined;
    return admin?.role === 'moderator' || admin?.role === 'admin' || admin?.role === 'owner';
  },
}; 