import axios from 'axios';
import { config } from '../config';

const aiCache = new Map<string, any>();

export type AIResult =
  | { isSpam: boolean; confidence: number; reason: string }
  | { category: 'normal' | 'spam' | 'scam' | 'offtopic'; explanation: string };

export async function checkSpamAI(message: string): Promise<AIResult> {
  if (aiCache.has(message)) {
    return aiCache.get(message);
  }
  if (!config.USE_AI_ANTISPAM || !config.AI_API_KEY) {
    return { isSpam: false, confidence: 0, reason: 'AI disabled' };
  }
  if (config.AI_MODE === 'advanced') {
    const prompt = `Классифицируй это сообщение для Telegram-чата по категориям: normal, spam, scam, offtopic. Ответь в формате: CATEGORY (объяснение).\n\nСообщение: "${message}"`;
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: config.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Ты антиспам-фильтр для Telegram. Отвечай только одной категорией (normal, spam, scam, offtopic) и кратко объясняй почему.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.0,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      type OpenAIResponse = { choices: { message: { content: string } }[] };
      const answer = (res.data as OpenAIResponse).choices[0].message.content.trim();
      // Пример: "spam (ссылка на казино)"
      const match = answer.match(/^(normal|spam|scam|offtopic)\s*\(([^)]*)\)/i);
      if (match) {
        const category = match[1].toLowerCase() as 'normal' | 'spam' | 'scam' | 'offtopic';
        const explanation = match[2];
        const result = { category, explanation };
        aiCache.set(message, result);
        return result;
      }
      // fallback: если не удалось распарсить
      aiCache.set(message, { category: 'normal', explanation: answer });
      return { category: 'normal', explanation: answer };
    } catch (e) {
      return { category: 'normal', explanation: 'AI error' };
    }
  } else {
    // simple режим (YES/NO)
    const prompt = `Это спам/реклама/мошенничество? Ответь YES или NO.\n\nСообщение: "${message}"`;
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: config.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Ты антиспам-фильтр для Telegram. Отвечай только YES или NO и кратко объясняй почему.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.0,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      type OpenAIResponse = { choices: { message: { content: string } }[] };
      const answer = (res.data as OpenAIResponse).choices[0].message.content.trim();
      const isSpam = /^yes/i.test(answer);
      let confidence = 1.0;
      let reason = answer;
      const match = answer.match(/([0-9]{1,3})%/);
      if (match) confidence = Math.min(1, parseInt(match[1], 10) / 100);
      const result = { isSpam, confidence, reason };
      aiCache.set(message, result);
      return result;
    } catch (e) {
      return { isSpam: false, confidence: 0, reason: 'AI error' };
    }
  }
} 