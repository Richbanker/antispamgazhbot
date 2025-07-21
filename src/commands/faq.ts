import { Telegraf, Context } from 'telegraf';
import { userService } from '../services/userService';
import { requireAdmin } from '../admin/adminMiddleware';

export function faqCommands(bot: Telegraf<Context>) {
  bot.command('faq', requireAdmin(), async (ctx) => {
    const text = ctx.message?.text || '';
    const match = text.match(/^\/faq add (.+) - (.+)$/);
    if (!match) return ctx.reply('Используйте: /faq add <вопрос> - <ответ>');
    const [, question, answer] = match;
    await userService.createFaq(question.trim(), answer.trim());
    ctx.reply('FAQ добавлен!');
  });
} 