import { Telegraf, Context } from 'telegraf';
import { logService } from '../services/logService';

export function banCommand(bot: Telegraf<Context>) {
  bot.command('ban', async (ctx) => {
    // ... логика бана
    await logService.logAction('ban', ctx.from?.id, ctx.message?.text);
  });
} 