import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { checkSpamAI } from '../ai/antiSpamAI';
import { logService } from '../services/logService';
import { userService } from '../services/userService';

export function setupAIAdvanced(bot: Telegraf<Context>) {
  if (!config.USE_AI_ANTISPAM || config.AI_MODE !== 'advanced') return;
  bot.on('message', async (ctx, next) => {
    const text = (ctx.message && 'text' in ctx.message)
      ? (ctx.message as any).text
      : undefined;
    const userId = ctx.from?.id;
    if (!text || !userId) return next();
    const ai = await checkSpamAI(text);
    if ('category' in ai) {
      const { category, explanation } = ai;
      // Лог в лог-чат
      await logService.logAction('ai_advanced', userId, `AI: ${category}\n${explanation}\n@${ctx.from?.username || userId}: ${text}`);
      await userService.saveAICategory(userId, category);
      await userService.saveUserMessage(userId, text);
      if (category === 'spam') {
        await ctx.deleteMessage();
        await userService.addWarning(userId);
        return;
      }
      if (category === 'scam') {
        await ctx.deleteMessage();
        await userService.addWarning(userId, true); // true = бан
        return;
      }
      if (category === 'offtopic') {
        await ctx.reply(`@${ctx.from?.username || userId}, пожалуйста, по теме!`);
        await userService.addWarning(userId);
        return next();
      }
      // normal — ничего
    }
    return next();
  });
} 