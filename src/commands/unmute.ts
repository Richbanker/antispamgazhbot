import { Telegraf, Context } from 'telegraf';
import { logService } from '../services/logService';

export function unmuteCommand(bot: Telegraf<Context>) {
  bot.command('unmute', async (ctx) => {
    // ... логика снятия мута
    await logService.logAction('unmute', ctx.from?.id, ctx.message?.text);
  });
} 