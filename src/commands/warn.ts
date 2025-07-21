import { Telegraf, Context } from 'telegraf';
import { logService } from '../services/logService';

export function warnCommand(bot: Telegraf<Context>) {
  bot.command('warn', async (ctx) => {
    // ... логика варна
    await logService.logAction('warn', ctx.from?.id, ctx.message?.text);
  });
} 