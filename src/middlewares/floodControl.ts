import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { userService } from '../services/userService';

const userMessages: Record<number, number[]> = {};

export function setupFloodControl(bot: Telegraf<Context>) {
  bot.on('message', async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();
    const now = Date.now();
    userMessages[userId] = (userMessages[userId] || []).filter(ts => now - ts < config.flood.intervalSec * 1000);
    userMessages[userId].push(now);
    if (userMessages[userId].length > config.flood.maxMessages) {
      await userService.muteUser(userId, config.flood.muteDurationMin);
      await ctx.reply('Вы слишком часто отправляете сообщения. Мут на 10 минут.');
      return;
    }
    return next();
  });
} 