import { Telegraf, Context } from 'telegraf';
import { userService } from '../services/userService';
import { requireModerator } from '../admin/adminMiddleware';

export function warningsCommand(bot: Telegraf<Context>) {
  bot.command('warns', requireModerator(), async (ctx) => {
    const [_, username] = ctx.message?.text?.split(' ') || [];
    if (!username) return ctx.reply('Используйте: /warns @user');
    const user = await userService.getUserByUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Пользователь не найден');
    const warns = await userService.getWarnings(user.id);
    ctx.reply(`@${username}: предупреждений — ${warns?.count || 0}${warns?.last_warn ? `\nПоследнее: ${warns.last_warn}` : ''}`);
  });
} 