import { Telegraf, Context } from 'telegraf';
import { roleService, UserRole } from '../roles/roleService';
import { userService } from '../services/userService';
import { config } from '../config';
import { requireAdmin, requireModerator } from '../admin/adminMiddleware';

export function rolesCommands(bot: Telegraf<Context>) {
  bot.command('role', requireModerator(), async (ctx) => {
    const user = ctx.message?.reply_to_message?.from || ctx.from;
    if (!user) return ctx.reply('Пользователь не найден');
    const role = await roleService.getRole(user.id);
    ctx.reply(`Роль пользователя @${user.username || user.id}: ${role}`);
  });

  bot.command('promote', requireAdmin(), async (ctx) => {
    const [_, username, roleName] = ctx.message?.text?.split(' ') || [];
    if (!username || !roleName) return ctx.reply('Используйте: /promote @user role');
    const user = await userService.getUserByUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Пользователь не найден');
    if (!['newbie', 'verified', 'vip'].includes(roleName)) return ctx.reply('Роль должна быть newbie, verified или vip');
    await roleService.promote(user.id, roleName as UserRole);
    ctx.reply(`Пользователь @${username} повышен до ${roleName}`);
  });

  bot.command('demote', requireAdmin(), async (ctx) => {
    const [_, username] = ctx.message?.text?.split(' ') || [];
    if (!username) return ctx.reply('Используйте: /demote @user');
    const user = await userService.getUserByUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Пользователь не найден');
    await roleService.demote(user.id);
    ctx.reply(`Пользователь @${username} понижен до newbie`);
  });

  bot.command('ai', requireAdmin(), async (ctx) => {
    const [_, arg, mode] = ctx.message?.text?.split(' ') || [];
    if (arg === 'on') {
      process.env.USE_AI_ANTISPAM = 'true';
      ctx.reply('AI-антиспам включён');
    } else if (arg === 'off') {
      process.env.USE_AI_ANTISPAM = 'false';
      ctx.reply('AI-антиспам выключен');
    } else if (arg === 'mode' && (mode === 'simple' || mode === 'advanced')) {
      process.env.AI_MODE = mode;
      ctx.reply(`AI-антиспам режим: ${mode}`);
    } else {
      ctx.reply('Используйте: /ai on, /ai off, /ai mode simple, /ai mode advanced');
    }
  });
} 