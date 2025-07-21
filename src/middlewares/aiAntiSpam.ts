import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { checkSpamAI } from '../ai/antiSpamAI';
import { logService } from '../services/logService';

export function setupAIAntiSpam(bot: Telegraf<Context>) {
  if (!config.USE_AI_ANTISPAM) return;
  bot.on('message', async (ctx, next) => {
    const text = (ctx.message && 'text' in ctx.message)
      ? (ctx.message as any).text
      : undefined;
    if (!text) return next();
    const ai = await checkSpamAI(text);
    if ('isSpam' in ai) {
      const { isSpam, confidence, reason } = ai;
      if (isSpam && confidence >= 0.8) {
        await ctx.deleteMessage();
        await logService.logAction('ai_spam', ctx.from?.id, `AI: spam (conf=${Math.round(confidence*100)}%)\n${reason}\n${text}`);
        return;
      } else if (isSpam) {
        await logService.logAction('ai_suspect', ctx.from?.id, `AI: подозрение на спам (conf=${Math.round(confidence*100)}%)\n${reason}\n${text}`);
      }
    }
    return next();
  });
} 