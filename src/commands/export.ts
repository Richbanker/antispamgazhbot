import { Telegraf, Context } from 'telegraf';
import { userService } from '../services/userService';
import { requireAdmin } from '../admin/adminMiddleware';
import { promises as fs } from 'fs';
import path from 'path';

export function exportCommands(bot: Telegraf<Context>) {
  bot.command('export', requireAdmin(), async (ctx) => {
    const [_, what] = ctx.message?.text?.split(' ') || [];
    if (what !== 'users') return ctx.reply('Используйте: /export users');
    const users = await userService.getAllUsersWithWarnings();
    const rows = [
      ['id', 'username', 'role', 'warnings'],
      ...users.map(u => [u.id, u.username, u.role, u.warnings])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const filePath = path.join(__dirname, '../../users_export.csv');
    await fs.writeFile(filePath, csv, 'utf8');
    await ctx.replyWithDocument({ source: filePath, filename: 'users_export.csv' });
    await fs.unlink(filePath);
  });
} 