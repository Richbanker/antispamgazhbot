import { Telegraf, Context } from 'telegraf';
import { config } from '../config';

export function setupAntiSpam(bot: Telegraf<Context>) {
  bot.on('message', async (ctx, next) => {
    const text = (ctx.message && 'text' in ctx.message)
      ? (ctx.message as any).text
      : '';
    // Удаляем сообщения с ссылками или стоп-словами
    for (const word of config.stopWords) {
      if (text.toLowerCase().includes(word)) {
        await ctx.deleteMessage();
        return;
      }
    }
    return next();
  });
} 