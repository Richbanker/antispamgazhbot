import { Telegraf, Context, Markup } from 'telegraf';
import { config } from '../config';
import { userService } from '../services/userService';

const pendingCaptcha = new Map<number, NodeJS.Timeout>();

export function setupCaptcha(bot: Telegraf<Context>) {
  bot.on('new_chat_members', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    const msg = await ctx.reply('Добро пожаловать! Подтвердите, что вы не бот', Markup.inlineKeyboard([
      Markup.button.callback('Я не бот', 'captcha_pass')
    ]));
    // Таймер на кик
    const timeout = setTimeout(async () => {
      await ctx.kickChatMember(userId);
      await ctx.reply('Пользователь не прошёл капчу и был удалён.');
    }, config.captcha.timeoutSec * 1000);
    pendingCaptcha.set(userId, timeout);
  });
  bot.action('captcha_pass', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (pendingCaptcha.has(userId)) {
      clearTimeout(pendingCaptcha.get(userId));
      pendingCaptcha.delete(userId);
      await ctx.reply('Спасибо, вы прошли капчу!');
    }
    await ctx.answerCbQuery();
  });
} 