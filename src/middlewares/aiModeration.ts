import { Telegraf, Context } from 'telegraf';
import { badWordsService } from '../services/badWordsService';
import { moderationLogService } from '../services/moderationLogService';
import { userService } from '../services/userService';
import { checkSpamAI } from '../ai/antiSpamAI';

interface ModerationConfig {
  AI_MODERATION: boolean;
  AI_PROVIDER: string;
  AI_API_KEY: string;
  MAX_WARNINGS: number;
  MUTE_DURATION: number; // в секундах
}

const config: ModerationConfig = {
  AI_MODERATION: process.env.AI_MODERATION === 'true',
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  AI_API_KEY: process.env.AI_API_KEY || '',
  MAX_WARNINGS: parseInt(process.env.MAX_WARNINGS || '3'),
  MUTE_DURATION: parseInt(process.env.MUTE_DURATION || '600'), // 10 минут по умолчанию
};

export function setupAIModeration(bot: Telegraf<Context>) {
  console.log(`🛡️ Setting up AI Moderation (AI: ${config.AI_MODERATION ? 'ON' : 'OFF'})`);

  bot.on('message', async (ctx, next) => {
    try {
      // Проверяем, есть ли текст в сообщении
      const text = getMessageText(ctx.message);
      if (!text) {
        return next();
      }

      // Пропускаем сообщения от администраторов
      if (await isAdmin(ctx)) {
        return next();
      }

      const userId = ctx.from?.id;
      const username = ctx.from?.username || `user_${userId}`;
      const chatId = ctx.chat?.id;

      if (!userId || !chatId) {
        return next();
      }

      // 1. Проверяем запрещенные слова
      const badWordCheck = badWordsService.checkMessage(text);
      if (badWordCheck.found) {
        await handleViolation(ctx, {
          type: 'bad_word',
          reason: `Запрещенное слово: "${badWordCheck.word}"`,
          messageText: text,
          userId,
          username,
          chatId
        });
        return; // Не продолжаем обработку
      }

      // 2. AI-проверка (если включена)
      if (config.AI_MODERATION && config.AI_API_KEY) {
        try {
          const aiResult = await checkSpamAI(text);
          
          if ('isSpam' in aiResult) {
            const { isSpam, confidence, reason } = aiResult;
            
            // Логируем AI-анализ
            await moderationLogService.logAction(
              'ai_analysis',
              userId,
              chatId,
              `AI: ${isSpam ? 'spam' : 'clean'} (${Math.round(confidence * 100)}%) - ${reason}`,
              { username, messageText: text, aiConfidence: confidence }
            );

            // Если AI определил как спам с высокой уверенностью
            if (isSpam && confidence >= 0.8) {
              await handleViolation(ctx, {
                type: 'ai_spam',
                reason: `AI: спам (${Math.round(confidence * 100)}%) - ${reason}`,
                messageText: text,
                userId,
                username,
                chatId,
                aiConfidence: confidence
              });
              return;
            }
            
            // Если подозрение на спам, но не удаляем
            if (isSpam && confidence >= 0.6) {
              await moderationLogService.logAction(
                'ai_suspicious',
                userId,
                chatId,
                `AI: подозрение на спам (${Math.round(confidence * 100)}%) - ${reason}`,
                { username, messageText: text, aiConfidence: confidence }
              );
            }
          }
        } catch (aiError) {
          console.error('❌ AI moderation error:', aiError);
          // Продолжаем работу без AI
        }
      }

      return next();
    } catch (error) {
      console.error('❌ Error in AI moderation middleware:', error);
      return next(); // Продолжаем обработку при ошибке
    }
  });
}

/**
 * Обработка нарушения (удаление сообщения, предупреждение, мут/бан)
 */
async function handleViolation(ctx: Context, violation: {
  type: string;
  reason: string;
  messageText: string;
  userId: number;
  username: string;
  chatId: number;
  aiConfidence?: number;
}) {
  try {
    // Удаляем сообщение
    await ctx.deleteMessage();

    // Добавляем предупреждение
    await userService.addWarning(violation.userId);
    const warnings = await userService.getWarnings(violation.userId);

    // Логируем действие
    await moderationLogService.logAction(
      'message_deleted',
      violation.userId,
      violation.chatId,
      violation.reason,
      {
        username: violation.username,
        messageText: violation.messageText,
        aiConfidence: violation.aiConfidence
      }
    );

    // Определяем действие на основе количества предупреждений
    if (warnings.count >= config.MAX_WARNINGS) {
      // Мут пользователя
      await muteUser(ctx, violation.userId, violation.username, violation.chatId);
      
      await ctx.reply(
        `🔇 <b>Пользователь @${violation.username} заглушен на ${Math.round(config.MUTE_DURATION / 60)} минут</b>\n` +
        `📊 Предупреждений: ${warnings.count}/${config.MAX_WARNINGS}\n` +
        `🚫 Причина: ${violation.reason}`,
        { parse_mode: 'HTML' }
      );
    } else {
      // Просто предупреждение
      await ctx.reply(
        `🚫 <b>Сообщение удалено</b>\n` +
        `⚠️ Предупреждений: ${warnings.count}/${config.MAX_WARNINGS}\n` +
        `📝 Причина: ${violation.reason}\n\n` +
        `<i>При достижении ${config.MAX_WARNINGS} предупреждений пользователь будет заглушен.</i>`,
        { parse_mode: 'HTML' }
      );
    }

  } catch (error) {
    console.error('❌ Error handling violation:', error);
  }
}

/**
 * Заглушить пользователя
 */
async function muteUser(ctx: Context, userId: number, username: string, chatId: number) {
  try {
    const until = Math.floor(Date.now() / 1000) + config.MUTE_DURATION;
    
    await ctx.telegram.restrictChatMember(chatId, userId, {
      permissions: {
        can_send_messages: false,
        can_send_audios: false,
        can_send_documents: false,
        can_send_photos: false,
        can_send_videos: false,
        can_send_video_notes: false,
        can_send_voice_notes: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
        can_manage_topics: false
      },
      until_date: until
    });

    // Логируем мут
    await moderationLogService.logAction(
      'user_muted',
      userId,
      chatId,
      `Заглушен на ${config.MUTE_DURATION} секунд (достигнут лимит предупреждений)`,
      { username }
    );

    console.log(`🔇 User ${username} (${userId}) muted for ${config.MUTE_DURATION} seconds`);
  } catch (error) {
    console.error('❌ Error muting user:', error);
  }
}

/**
 * Получить текст из сообщения
 */
function getMessageText(message: any): string | null {
  if ('text' in message) {
    return message.text;
  }
  if ('caption' in message) {
    return message.caption;
  }
  return null;
}

/**
 * Проверить, является ли пользователь администратором
 */
async function isAdmin(ctx: Context): Promise<boolean> {
  try {
    if (!ctx.from || !ctx.chat) return false;
    
    const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
    return ['creator', 'administrator'].includes(member.status);
  } catch (error) {
    return false;
  }
} 