import { Telegraf, Context } from 'telegraf';
import { logService } from '../services/logService';

export function muteCommand(bot: Telegraf<Context>) {
  bot.command('mute', async (ctx) => {
    // ... логика мута
    await logService.logAction('mute', ctx.from?.id, ctx.message?.text);
  });
} 