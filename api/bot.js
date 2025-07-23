const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Загружаем переменные окружения
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Проверяем наличие BOT_TOKEN
if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is not set in environment variables');
}

// Инициализируем базу данных
const db = new Database('/tmp/database.sqlite');

// Создаем таблицы
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  role TEXT DEFAULT 'newbie',
  join_date TEXT,
  messages_count INTEGER DEFAULT 0
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS warnings (
  user_id INTEGER PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_warn TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS moderation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  username TEXT,
  chat_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  message_text TEXT,
  ai_confidence REAL
)`).run();

// Сервис запрещенных слов
class BadWordsService {
  constructor() {
    this.badWords = [
      "спам", "реклама", "крипта", "казино", "xxx", "порно", 
      "18+", "секс", "заработок", "пирамида", "биткоин",
      "криптовалюта", "инвестиции", "форекс", "млм", "товар", "скидка"
    ];
  }

  checkMessage(text) {
    const lowerText = text.toLowerCase();
    for (const badWord of this.badWords) {
      if (lowerText.includes(badWord.toLowerCase())) {
        return { found: true, word: badWord };
      }
    }
    return { found: false };
  }

  getAllWords() {
    return [...this.badWords];
  }

  addWord(word) {
    const normalizedWord = word.toLowerCase().trim();
    if (!normalizedWord || this.badWords.some(w => w.toLowerCase() === normalizedWord)) {
      return false;
    }
    this.badWords.push(normalizedWord);
    return true;
  }

  removeWord(word) {
    const normalizedWord = word.toLowerCase().trim();
    const initialLength = this.badWords.length;
    this.badWords = this.badWords.filter(w => w.toLowerCase() !== normalizedWord);
    return this.badWords.length < initialLength;
  }

  getCount() {
    return this.badWords.length;
  }
}

const badWordsService = new BadWordsService();

// Сервис логирования
const moderationLogService = {
  async logAction(action, userId, chatId, reason, options = {}) {
    const timestamp = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO moderation_logs 
        (timestamp, action, user_id, username, chat_id, reason, message_text, ai_confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        timestamp,
        action,
        userId,
        options.username || null,
        chatId,
        reason,
        options.messageText || null,
        options.aiConfidence || null
      );
    } catch (error) {
      console.error('Error saving moderation log:', error);
    }
    console.log(`📝 Moderation log: ${action} - User ${userId} (${options.username || 'unknown'}) - ${reason}`);
  },

  async getRecentLogs(limit = 10, chatId) {
    try {
      let query = `
        SELECT id, timestamp, action, user_id as userId, username, chat_id as chatId, 
               reason, message_text as messageText, ai_confidence as aiConfidence
        FROM moderation_logs
      `;
      
      const params = [];
      
      if (chatId) {
        query += ' WHERE chat_id = ?';
        params.push(chatId);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      return db.prepare(query).all(...params);
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      return [];
    }
  }
};

// Сервис пользователей
const userService = {
  async ensureUser(userId, username) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      db.prepare('INSERT INTO users (id, username, role, join_date, messages_count) VALUES (?, ?, ?, ?, 0)')
        .run(userId, username, 'newbie', new Date().toISOString());
    }
  },

  async addWarning(userId) {
    const now = new Date().toISOString();
    const warn = db.prepare('SELECT * FROM warnings WHERE user_id = ?').get(userId);
    if (!warn) {
      db.prepare('INSERT INTO warnings (user_id, count, last_warn) VALUES (?, 1, ?)').run(userId, now);
    } else {
      db.prepare('UPDATE warnings SET count = count + 1, last_warn = ? WHERE user_id = ?').run(now, userId);
    }
  },

  async getWarnings(userId) {
    const result = db.prepare('SELECT count, last_warn FROM warnings WHERE user_id = ?').get(userId);
    return result || { count: 0, last_warn: null };
  }
};

// Создаем бота
let bot;
if (process.env.BOT_TOKEN) {
  bot = new Telegraf(process.env.BOT_TOKEN);
  
  // Конфигурация модерации
  const config = {
    AI_MODERATION: process.env.AI_MODERATION === 'true',
    MAX_WARNINGS: parseInt(process.env.MAX_WARNINGS || '3'),
    MUTE_DURATION: parseInt(process.env.MUTE_DURATION || '600')
  };

  console.log(`🛡️ Setting up AI Moderation (AI: ${config.AI_MODERATION ? 'ON' : 'OFF'})`);
  console.log(`📋 Bad words loaded: ${badWordsService.getCount()} words`);

  // Функция проверки админа
  async function isAdmin(ctx) {
    try {
      if (!ctx.from || !ctx.chat) return false;
      const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
      return ['creator', 'administrator'].includes(member.status);
    } catch (error) {
      return false;
    }
  }

  // КОМАНДЫ МОДЕРАЦИИ
  bot.command('badwords', async (ctx) => {
    try {
      if (!(await isAdmin(ctx))) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1);
      const action = args[0];

      switch (action) {
        case 'list':
          const words = badWordsService.getAllWords();
          if (words.length === 0) {
            await ctx.reply('📋 Список запрещенных слов пуст.');
            return;
          }
          
          const wordsList = words.slice(0, 30)
            .map((word, index) => `${index + 1}. <code>${word}</code>`)
            .join('\n');
          
          await ctx.reply(
            `🚫 <b>Запрещенные слова</b>\n\n${wordsList}\n\n<b>Всего:</b> ${words.length} слов`,
            { parse_mode: 'HTML' }
          );
          break;
        
        case 'add':
          const wordToAdd = args.slice(1).join(' ').trim();
          if (!wordToAdd) {
            await ctx.reply('❌ Укажите слово для добавления.\n\nПример: <code>/badwords add спам</code>', { parse_mode: 'HTML' });
            return;
          }
          
          const added = badWordsService.addWord(wordToAdd);
          if (added) {
            await ctx.reply(
              `✅ <b>Слово добавлено!</b>\n\n🚫 Новое запрещенное слово: <code>${wordToAdd}</code>\n📊 Всего слов: ${badWordsService.getCount()}`,
              { parse_mode: 'HTML' }
            );
            
            await moderationLogService.logAction(
              'badword_added',
              ctx.from.id,
              ctx.chat.id,
              `Добавлено запрещенное слово: "${wordToAdd}"`,
              { username: ctx.from.username }
            );
          } else {
            await ctx.reply(
              `⚠️ <b>Слово уже в списке!</b>\n\n🚫 Слово "<code>${wordToAdd}</code>" уже находится в списке запрещенных.`,
              { parse_mode: 'HTML' }
            );
          }
          break;
        
        case 'remove':
          const wordToRemove = args.slice(1).join(' ').trim();
          if (!wordToRemove) {
            await ctx.reply('❌ Укажите слово для удаления.\n\nПример: <code>/badwords remove спам</code>', { parse_mode: 'HTML' });
            return;
          }
          
          const removed = badWordsService.removeWord(wordToRemove);
          if (removed) {
            await ctx.reply(
              `✅ <b>Слово удалено!</b>\n\n🗑️ Удалено запрещенное слово: <code>${wordToRemove}</code>\n📊 Осталось слов: ${badWordsService.getCount()}`,
              { parse_mode: 'HTML' }
            );
            
            await moderationLogService.logAction(
              'badword_removed',
              ctx.from.id,
              ctx.chat.id,
              `Удалено запрещенное слово: "${wordToRemove}"`,
              { username: ctx.from.username }
            );
          } else {
            await ctx.reply(
              `⚠️ <b>Слово не найдено!</b>\n\n🔍 Слово "<code>${wordToRemove}</code>" не найдено в списке запрещенных.\nИспользуйте <code>/badwords list</code> для просмотра списка.`,
              { parse_mode: 'HTML' }
            );
          }
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
      console.error('Error in badwords command:', error);
      await ctx.reply('⚠️ Произошла ошибка при выполнении команды.');
    }
  });

  // Команда логов модерации
  bot.command('modlog', async (ctx) => {
    try {
      if (!(await isAdmin(ctx))) {
        await ctx.reply('❌ Эта команда доступна только администраторам.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1);
      const limit = Math.min(parseInt(args[0]) || 10, 20);
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
        
        const actionEmoji = {
          'message_deleted': '🗑️',
          'user_muted': '🔇',
          'badword_added': '➕',
          'badword_removed': '➖'
        }[log.action] || '📝';
        
        message += `${actionEmoji} <b>${log.action}</b>\n`;
        message += `👤 ${username}\n`;
        message += `📅 ${date}\n`;
        message += `📝 ${log.reason}\n\n`;
      }

      message += `💡 <i>Используйте</i> <code>/modlog [число]</code> <i>для показа другого количества записей</i>`;

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error in modlog command:', error);
      await ctx.reply('⚠️ Произошла ошибка при получении логов.');
    }
  });

  // Тестовая команда
  bot.command('test_moderation', async (ctx) => {
    await ctx.reply('✅ Команды модерации работают! Система v2.0.0 активна.');
  });

  // Обработка сообщений с проверкой запрещенных слов
  bot.on('text', async (ctx) => {
    try {
      const text = ctx.message.text;
      if (!text) return;

      // Пропускаем сообщения от администраторов
      if (await isAdmin(ctx)) return;

      const userId = ctx.from?.id;
      const username = ctx.from?.username || `user_${userId}`;
      const chatId = ctx.chat?.id;

      if (!userId || !chatId) return;

      // Проверяем запрещенные слова
      const badWordCheck = badWordsService.checkMessage(text);
      if (badWordCheck.found) {
        // Удаляем сообщение
        await ctx.deleteMessage();

        // Добавляем предупреждение
        await userService.addWarning(userId);
        const warnings = await userService.getWarnings(userId);

        // Логируем действие
        await moderationLogService.logAction(
          'message_deleted',
          userId,
          chatId,
          `Запрещенное слово: "${badWordCheck.word}"`,
          { username, messageText: text }
        );

        // Определяем действие на основе количества предупреждений
        if (warnings.count >= config.MAX_WARNINGS) {
          // Мут пользователя
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

            await moderationLogService.logAction(
              'user_muted',
              userId,
              chatId,
              `Заглушен на ${config.MUTE_DURATION} секунд (достигнут лимит предупреждений)`,
              { username }
            );
            
            await ctx.reply(
              `🔇 <b>Пользователь @${username} заглушен на ${Math.round(config.MUTE_DURATION / 60)} минут</b>\n` +
              `📊 Предупреждений: ${warnings.count}/${config.MAX_WARNINGS}\n` +
              `🚫 Причина: Запрещенное слово: "${badWordCheck.word}"`,
              { parse_mode: 'HTML' }
            );
          } catch (error) {
            console.error('Error muting user:', error);
          }
        } else {
          // Просто предупреждение
          await ctx.reply(
            `🚫 <b>Сообщение удалено</b>\n` +
            `⚠️ Предупреждений: ${warnings.count}/${config.MAX_WARNINGS}\n` +
            `📝 Причина: Запрещенное слово: "${badWordCheck.word}"\n\n` +
            `<i>При достижении ${config.MAX_WARNINGS} предупреждений пользователь будет заглушен.</i>`,
            { parse_mode: 'HTML' }
          );
        }

        return;
      }
    } catch (error) {
      console.error('Error in text message handler:', error);
    }
  });

  // Остальные базовые команды
  bot.start(async (ctx) => {
    try {
      await ctx.reply(
        '🤖 *Добро пожаловать в АнтиСпам Бот v2.0!*\n\n' +
        '✅ Бот активен и готов к работе\n' +
        '🛡️ Улучшенная система модерации\n' +
        '📊 AI-антиспам и аналитика\n' +
        '🚫 Управление запрещенными словами\n\n' +
        '/help - список всех команд', 
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Start command error:', error);
    }
  });

  bot.help(async (ctx) => {
    try {
      await ctx.reply(`
🤖 *Команды бота:*

🔹 *Основные:*
/start - Запуск бота
/help - Эта справка
/stats - Статистика чата
/status - Статус системы

🔹 *Модерация (админы):*
/badwords - Управление запрещенными словами
/badwords list - Показать список слов
/badwords add <слово> - Добавить слово
/badwords remove <слово> - Удалить слово
/modlog - Логи модерации
/test_moderation - Тест системы v2.0

🔹 *Информация:*
/rules - Правила чата
/about - О боте

*Статус:* ✅ Активен (Vercel v2.0)
*Версия:* 2.0.0 - Система модерации
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Help command error:', error);
    }
  });

  // Приветствие новых участников
  bot.on('new_chat_members', async (ctx) => {
    try {
      const newMembers = ctx.message.new_chat_members;
      for (const member of newMembers) {
        if (!member.is_bot) {
          await userService.ensureUser(member.id, member.username || '');
          
          await ctx.reply(
            `🎉 *Добро пожаловать, ${member.first_name}!*\n\n` +
            `👋 Рады видеть вас в нашем чате!\n\n` +
            `📋 Ознакомьтесь с правилами: /rules\n` +
            `❓ Список команд: /help\n\n` +
            `🛡️ Система модерации v2.0 активна\n` +
            `Приятного общения! 😊`,
            { parse_mode: 'Markdown' }
          );
        }
      }
    } catch (error) {
      console.error('Error greeting new members:', error);
    }
  });

  // Обработка ошибок
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    if (ctx && ctx.reply) {
      try {
        ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
      } catch (e) {
        console.error('Error sending error message:', e);
      }
    }
  });

} else {
  console.warn('Bot not initialized: BOT_TOKEN missing');
}

module.exports = async (req, res) => {
  try {
    if (!process.env.BOT_TOKEN) {
      console.error('BOT_TOKEN not configured');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'BOT_TOKEN not configured',
        timestamp: new Date().toISOString()
      });
    }

    if (!bot) {
      console.error('Bot not initialized');
      return res.status(500).json({ 
        error: 'Bot initialization error',
        message: 'Bot not properly initialized',
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      console.log('Received webhook request:', {
        timestamp: new Date().toISOString()
      });
      
      await bot.handleUpdate(req.body);
      res.status(200).json({ 
        ok: true,
        timestamp: new Date().toISOString() 
      });
    } else {
      const botInfo = {
        status: 'ok',
        message: 'Telegram Bot Webhook v2.0 is ready',
        method: req.method,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: [
          'AI Moderation System',
          'Bad Words Management',
          'Moderation Logging',
          'Admin Commands',
          'Auto Mute/Ban System'
        ],
        config: {
          hasToken: !!process.env.BOT_TOKEN,
          aiModeration: process.env.AI_MODERATION === 'true',
          maxWarnings: process.env.MAX_WARNINGS || '3',
          muteDuration: process.env.MUTE_DURATION || '600',
          badWordsCount: badWordsService.getCount()
        }
      };
      
      res.status(200).json(botInfo);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}; 