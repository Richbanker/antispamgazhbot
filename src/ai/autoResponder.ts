import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import axios from 'axios';

type OpenAIResponse = { choices: { message: { content: string } }[] };

export function handleAutoResponse(bot: Telegraf<Context>) {
  if (!config.ENABLE_AUTO_RESPONDER) return;
  bot.on('message', async (ctx, next) => {
    const text = (ctx.message && 'text' in ctx.message) ? (ctx.message as any).text : '';
    const botUsername = ctx.me || (await bot.telegram.getMe()).username;
    if (text.startsWith('?') || text.includes(`@${botUsername}`)) {
      // FAQ check (можно расширить)
      // AI ответ
      const prompt = `Ответь на вопрос пользователя максимально кратко и понятно.\n\nВопрос: ${text}`;
      try {
        const res = await axios.post<OpenAIResponse>(
          'https://api.openai.com/v1/chat/completions',
          {
            model: config.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Ты помощник для Telegram-чата. Отвечай кратко и понятно.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
          },
          {
            headers: {
              'Authorization': `Bearer ${config.AI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const answer = res.data.choices[0].message.content.trim();
        await ctx.telegram.sendMessage(
          ctx.chat!.id,
          answer,
          { reply_to_message_id: ctx.message?.message_id } as any
        );
      } catch (e) {
        await ctx.reply('Ошибка AI-ответа.');
      }
    } else {
      return next();
    }
  });
} 