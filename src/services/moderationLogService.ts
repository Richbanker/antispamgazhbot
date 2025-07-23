import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'moderation.log');

// Создаем таблицу для логов модерации в базе данных
const db = new Database('database.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS moderation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  username TEXT,
  chat_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  message_text TEXT,
  ai_confidence REAL
)`).run();

export interface ModerationLog {
  id?: number;
  timestamp: string;
  action: string;
  userId: number;
  username?: string;
  chatId: number;
  reason: string;
  messageText?: string;
  aiConfidence?: number;
}

export class ModerationLogService {
  constructor() {
    this.ensureLogsDir();
  }

  private ensureLogsDir(): void {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
  }

  /**
   * Записать действие модерации в базу данных и файл лога
   */
  async logAction(
    action: string,
    userId: number,
    chatId: number,
    reason: string,
    options: {
      username?: string;
      messageText?: string;
      aiConfidence?: number;
    } = {}
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Сохраняем в базу данных
    try {
      db.prepare(`
        INSERT INTO moderation_logs 
        (timestamp, action, user_id, username, chat_id, reason, message_text, ai_confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        timestamp,
        action,
        userId,
        options.username || null,
        chatId,
        reason,
        options.messageText || null,
        options.aiConfidence || null
      );
    } catch (error) {
      console.error('❌ Error saving moderation log to database:', error);
    }

    // Также записываем в текстовый файл для резервного копирования
    try {
      const logEntry = {
        timestamp,
        action,
        userId,
        username: options.username,
        chatId,
        reason,
        messageText: options.messageText?.substring(0, 100), // Ограничиваем длину
        aiConfidence: options.aiConfidence
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(LOG_FILE, logLine, 'utf8');
    } catch (error) {
      console.error('❌ Error writing to moderation log file:', error);
    }

    console.log(`📝 Moderation log: ${action} - User ${userId} (${options.username || 'unknown'}) - ${reason}`);
  }

  /**
   * Получить последние записи логов модерации
   */
  async getRecentLogs(limit: number = 10, chatId?: number): Promise<ModerationLog[]> {
    try {
      let query = `
        SELECT id, timestamp, action, user_id as userId, username, chat_id as chatId, 
               reason, message_text as messageText, ai_confidence as aiConfidence
        FROM moderation_logs
      `;
      
      const params: any[] = [];
      
      if (chatId) {
        query += ' WHERE chat_id = ?';
        params.push(chatId);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const rows = db.prepare(query).all(...params);
      return rows as ModerationLog[];
    } catch (error) {
      console.error('❌ Error fetching moderation logs:', error);
      return [];
    }
  }

  /**
   * Получить статистику модерации за определенный период
   */
  async getModerationStats(days: number = 7, chatId?: number): Promise<{
    totalActions: number;
    actionBreakdown: Record<string, number>;
    topReasons: Array<{ reason: string; count: number }>;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      let baseQuery = 'FROM moderation_logs WHERE timestamp >= ?';
      const params: any[] = [since];
      
      if (chatId) {
        baseQuery += ' AND chat_id = ?';
        params.push(chatId);
      }

      // Общее количество действий
      const totalActions = (db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params) as { count: number } | undefined)?.count || 0;

      // Разбивка по типам действий
      const actionRows = db.prepare(`
        SELECT action, COUNT(*) as count 
        ${baseQuery} 
        GROUP BY action 
        ORDER BY count DESC
      `).all(...params) as Array<{ action: string; count: number }>;
      
      const actionBreakdown: Record<string, number> = {};
      for (const row of actionRows) {
        actionBreakdown[row.action] = row.count;
      }

      // Топ причин
      const reasonRows = db.prepare(`
        SELECT reason, COUNT(*) as count 
        ${baseQuery} 
        GROUP BY reason 
        ORDER BY count DESC 
        LIMIT 10
      `).all(...params);

      const topReasons = reasonRows.map((row: any) => ({
        reason: row.reason,
        count: row.count
      }));

      return {
        totalActions,
        actionBreakdown,
        topReasons
      };
    } catch (error) {
      console.error('❌ Error fetching moderation stats:', error);
      return {
        totalActions: 0,
        actionBreakdown: {},
        topReasons: []
      };
    }
  }

  /**
   * Очистить старые логи (старше указанного количества дней)
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
      const result = db.prepare('DELETE FROM moderation_logs WHERE timestamp < ?').run(cutoffDate);
      
      console.log(`🧹 Cleaned up ${result.changes} old moderation logs`);
      return result.changes;
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
      return 0;
    }
  }
}

export const moderationLogService = new ModerationLogService(); 