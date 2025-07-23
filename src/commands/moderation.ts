import { Telegraf, Context } from 'telegraf';
import { badWordsService } from '../services/badWordsService';
import { moderationLogService } from '../services/moderationLogService';

export function setupModerationCommands(bot: Telegraf<Context>) {
  
  // Команда /badwords - управление запрещенными словами
  bot.command('badwords', async (ctx, next) => {
    try {
      // Проверяем права администратора
      if (!(await isAdmin(ctx))) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1);
      const action = args[0];

      switch (action) {
        case 'list':
          await handleListBadWords(ctx);
          break;
        
        case 'add':
          const wordToAdd = args.slice(1).join(' ').trim();
          await handleAddBadWord(ctx, wordToAdd);
          break;
        
        case 'remove':
          const wordToRemove = args.slice(1).join(' ').trim();
          await handleRemoveBadWord(ctx, wordToRemove);
          break;
        
        default:
          await ctx.reply(
            `🛡️ <b>Управление запрещенными словами</b>\n\n` +
            `<b>Команды:</b>\n` +
            `• <code>/badwords list</code> - показать список слов\n` +
            `• <code>/badwords add [слово]</code> - добавить слово\n` +
            `• <code>/badwords remove [слово]</code> - удалить слово\n\n` +
            `<b>Всего слов:</b> ${badWordsService.getCount()}`,
            { parse_mode: 'HTML' }
          );
          break;
      }
    } catch (error) {
      console.error('❌ Error in badwords command:', error);
      await ctx.reply('⚠️ Произошла ошибка при выполнении команды.');
    }
  });

  // Команда /modlog - показать логи модерации
  bot.command('modlog', async (ctx, next) => {
    try {
      // Проверяем права администратора
      if (!(await isAdmin(ctx))) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1);
      const limit = parseInt(args[0]) || 10;
      
      await handleModerationLog(ctx, Math.min(limit, 20)); // Максимум 20 записей
    } catch (error) {
      console.error('❌ Error in modlog command:', error);
      await ctx.reply('⚠️ Произошла ошибка при получении логов.');
    }
  });

  // Команда /modstats - статистика модерации
  bot.command('modstats', async (ctx, next) => {
    try {
      // Проверяем права администратора
      if (!(await isAdmin(ctx))) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1);
      const days = parseInt(args[0]) || 7;
      
      await handleModerationStats(ctx, Math.min(days, 30)); // Максимум 30 дней
    } catch (error) {
      console.error('❌ Error in modstats command:', error);
      await ctx.reply('⚠️ Произошла ошибка при получении статистики.');
    }
  });
}

// Обработчики команд

async function handleListBadWords(ctx: Context) {
  const words = badWordsService.getAllWords();
  
  if (words.length === 0) {
    await ctx.reply('📋 Список запрещенных слов пуст.');
    return;
  }

  const chunks = [];
  const wordsPerChunk = 30;
  
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk);
    chunks.push(chunk);
  }

  for (let i = 0; i < chunks.length; i++) {
    const wordsList = chunks[i]
      .map((word, index) => `${i * wordsPerChunk + index + 1}. <code>${word}</code>`)
      .join('\n');

    const message = 
      `🚫 <b>Запрещенные слова ${i > 0 ? `(часть ${i + 1})` : ''}</b>\n\n` +
      wordsList +
      `\n\n<b>Всего:</b> ${words.length} слов`;

    await ctx.reply(message, { parse_mode: 'HTML' });
  }
}

async function handleAddBadWord(ctx: Context, word: string) {
  if (!word) {
    await ctx.reply('❌ Укажите слово для добавления.\n\nПример: <code>/badwords add спам</code>', { parse_mode: 'HTML' });
    return;
  }

  const added = badWordsService.addWord(word);
  
  if (added) {
    await ctx.reply(
      `✅ <b>Слово добавлено!</b>\n\n` +
      `🚫 Новое запрещенное слово: <code>${word}</code>\n` +
      `📊 Всего слов: ${badWordsService.getCount()}`,
      { parse_mode: 'HTML' }
    );

    // Логируем действие
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    if (chatId && userId) {
      await moderationLogService.logAction(
        'badword_added',
        userId,
        chatId,
        `Добавлено запрещенное слово: "${word}"`,
        { username: ctx.from?.username }
      );
    }
  } else {
    await ctx.reply(
      `⚠️ <b>Слово уже в списке!</b>\n\n` +
      `🚫 Слово "<code>${word}</code>" уже находится в списке запрещенных.`,
      { parse_mode: 'HTML' }
    );
  }
}

async function handleRemoveBadWord(ctx: Context, word: string) {
  if (!word) {
    await ctx.reply('❌ Укажите слово для удаления.\n\nПример: <code>/badwords remove спам</code>', { parse_mode: 'HTML' });
    return;
  }

  const removed = badWordsService.removeWord(word);
  
  if (removed) {
    await ctx.reply(
      `✅ <b>Слово удалено!</b>\n\n` +
      `🗑️ Удалено запрещенное слово: <code>${word}</code>\n` +
      `📊 Осталось слов: ${badWordsService.getCount()}`,
      { parse_mode: 'HTML' }
    );

    // Логируем действие
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    if (chatId && userId) {
      await moderationLogService.logAction(
        'badword_removed',
        userId,
        chatId,
        `Удалено запрещенное слово: "${word}"`,
        { username: ctx.from?.username }
      );
    }
  } else {
    await ctx.reply(
      `⚠️ <b>Слово не найдено!</b>\n\n` +
      `🔍 Слово "<code>${word}</code>" не найдено в списке запрещенных.\n` +
      `Используйте <code>/badwords list</code> для просмотра списка.`,
      { parse_mode: 'HTML' }
    );
  }
}

async function handleModerationLog(ctx: Context, limit: number) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const logs = await moderationLogService.getRecentLogs(limit, chatId);
  
  if (logs.length === 0) {
    await ctx.reply('📋 Логи модерации пусты.');
    return;
  }

  let message = `📋 <b>Последние ${logs.length} действий модерации</b>\n\n`;

  for (const log of logs) {
    const date = new Date(log.timestamp).toLocaleString('ru-RU');
    const username = log.username ? `@${log.username}` : `ID:${log.userId}`;
    
    // Форматируем действие с эмодзи
    const actionEmoji = getActionEmoji(log.action);
    
    message += `${actionEmoji} <b>${formatAction(log.action)}</b>\n`;
    message += `👤 ${username}\n`;
    message += `📅 ${date}\n`;
    message += `📝 ${log.reason}\n`;
    
    if (log.aiConfidence) {
      message += `🤖 AI: ${Math.round(log.aiConfidence * 100)}%\n`;
    }
    
    message += '\n';
  }

  message += `💡 <i>Используйте</i> <code>/modlog [число]</code> <i>для показа другого количества записей</i>`;

  await ctx.reply(message, { parse_mode: 'HTML' });
}

async function handleModerationStats(ctx: Context, days: number) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const stats = await moderationLogService.getModerationStats(days, chatId);
  
  let message = `📊 <b>Статистика модерации за ${days} дней</b>\n\n`;
  
  message += `🔢 <b>Всего действий:</b> ${stats.totalActions}\n\n`;
  
  if (Object.keys(stats.actionBreakdown).length > 0) {
    message += `📋 <b>По типам действий:</b>\n`;
    for (const [action, count] of Object.entries(stats.actionBreakdown)) {
      const emoji = getActionEmoji(action);
      message += `${emoji} ${formatAction(action)}: ${count}\n`;
    }
    message += '\n';
  }
  
  if (stats.topReasons.length > 0) {
    message += `🏆 <b>Топ причин:</b>\n`;
    for (let i = 0; i < Math.min(5, stats.topReasons.length); i++) {
      const reason = stats.topReasons[i];
      message += `${i + 1}. ${reason.reason} (${reason.count})\n`;
    }
  }

  await ctx.reply(message, { parse_mode: 'HTML' });
}

// Вспомогательные функции

function getActionEmoji(action: string): string {
  const emojiMap: Record<string, string> = {
    'message_deleted': '🗑️',
    'user_muted': '🔇',
    'user_banned': '🚫',
    'ai_analysis': '🤖',
    'ai_suspicious': '🔍',
    'badword_added': '➕',
    'badword_removed': '➖',
    'warning_added': '⚠️'
  };
  
  return emojiMap[action] || '📝';
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    'message_deleted': 'Сообщение удалено',
    'user_muted': 'Пользователь заглушен',
    'user_banned': 'Пользователь забанен',
    'ai_analysis': 'AI анализ',
    'ai_suspicious': 'Подозрительное сообщение',
    'badword_added': 'Слово добавлено',
    'badword_removed': 'Слово удалено',
    'warning_added': 'Предупреждение выдано'
  };
  
  return actionMap[action] || action;
}

async function isAdmin(ctx: Context): Promise<boolean> {
  try {
    if (!ctx.from || !ctx.chat) return false;
    
    const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
    return ['creator', 'administrator'].includes(member.status);
  } catch (error) {
    return false;
  }
} 