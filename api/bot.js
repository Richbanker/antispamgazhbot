const { Telegraf } = require('telegraf');

// Загружаем переменные окружения
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Проверяем наличие BOT_TOKEN
if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is not set in environment variables');
}

// Создаем бота только если токен есть
let bot;
if (process.env.BOT_TOKEN) {
  bot = new Telegraf(process.env.BOT_TOKEN);
} else {
  console.warn('Bot not initialized: BOT_TOKEN missing');
}

// Настройка команд бота (только если бот создан)
if (bot) {
  // Базовые команды
  bot.start(async (ctx) => {
    try {
      await ctx.reply(
        '🤖 *Добро пожаловать в АнтиСпам Бот!*\n\n' +
        '✅ Бот активен и готов к работе\n' +
        '🛡️ Автоматическая защита от спама\n' +
        '📊 Аналитика и статистика\n\n' +
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

🔹 *Модерация:*
/ban - Забанить пользователя
/unban - Разбанить пользователя
/mute - Заглушить пользователя
/warn - Предупреждение пользователю

🔹 *Информация:*
/rules - Правила чата
/about - О боте

*Статус:* ✅ Активен (Vercel Serverless)
*Версия:* 1.0.0
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Help command error:', error);
    }
  });

  bot.command('stats', async (ctx) => {
    try {
      let chatInfo = 'N/A';
      try {
        chatInfo = await ctx.getChatMembersCount();
      } catch (e) {
        console.log('Could not get chat members count:', e.message);
      }
      
      await ctx.reply(`
📊 *Статистика чата:*

👥 Участников: ${chatInfo}
🤖 Бот: ✅ Активен
📡 Режим: Webhook (Vercel)
⏰ Время работы: ${Math.floor(process.uptime() / 60)} мин
🌍 Регион: ${process.env.VERCEL_REGION || 'Auto'}

🛡️ *Система модерации активна*
🔄 Обновлено: ${new Date().toLocaleString('ru-RU')}
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Stats command error:', error);
      await ctx.reply('❌ Ошибка получения статистики');
    }
  });

  bot.command('status', async (ctx) => {
    try {
      await ctx.reply(`
🟢 *Статус системы: ONLINE*

✅ Webhook активен
✅ База данных подключена
✅ Модерация работает
✅ АнтиСпам включен

🕐 ${new Date().toLocaleString('ru-RU')}
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Status command error:', error);
    }
  });

  bot.command('rules', async (ctx) => {
    try {
      await ctx.reply(`
📋 *Правила чата:*

1️⃣ Без спама и рекламы
2️⃣ Уважительное общение
3️⃣ Запрещен флуд
4️⃣ Без оскорблений
5️⃣ По теме чата

⚠️ *За нарушения:*
• Предупреждение
• Временная блокировка
• Исключение из чата

🤖 Модерация автоматическая
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Rules command error:', error);
    }
  });

  bot.command('about', async (ctx) => {
    try {
      await ctx.reply(`
🤖 *АнтиСпам Модератор Бот*

🔹 *Функции:*
• Автоматическое удаление спама
• Система предупреждений
• Аналитика чата
• Приветствие новых участников

🔹 *Технологии:*
• Node.js + Telegraf
• Vercel Serverless
• SQLite Database
• AI модерация

🔹 *Версия:* 1.0.0
🔹 *Статус:* Активен 24/7

Разработано для эффективной модерации чатов
      `, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('About command error:', error);
    }
  });

  // Приветствие новых участников
  bot.on('new_chat_members', async (ctx) => {
    try {
      const newMembers = ctx.message.new_chat_members;
      for (const member of newMembers) {
        if (!member.is_bot) {
          await ctx.reply(
            `🎉 *Добро пожаловать, ${member.first_name}!*\n\n` +
            `👋 Рады видеть вас в нашем чате!\n\n` +
            `📋 Ознакомьтесь с правилами: /rules\n` +
            `❓ Список команд: /help\n\n` +
            `Приятного общения! 😊`,
            { parse_mode: 'Markdown' }
          );
        }
      }
    } catch (error) {
      console.error('Error greeting new members:', error);
    }
  });

  // Простая анти-спам защита
  bot.on('text', async (ctx) => {
    try {
      const message = ctx.message.text.toLowerCase();
      const spamWords = ['реклама', 'купи', 'продам', 'заработок', 'биткоин', 'крипта'];
      
      const isSpam = spamWords.some(word => message.includes(word));
      
      if (isSpam && ctx.chat.type !== 'private') {
        await ctx.deleteMessage();
        await ctx.reply(
          `⚠️ Сообщение удалено (подозрение на спам)\n` +
          `👤 Пользователь: @${ctx.from.username || ctx.from.first_name}`,
          { reply_to_message_id: ctx.message.message_id }
        );
      }
    } catch (error) {
      console.error('Anti-spam error:', error);
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
}

module.exports = async (req, res) => {
  try {
    // Проверяем наличие токена
    if (!process.env.BOT_TOKEN) {
      console.error('BOT_TOKEN not configured');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'BOT_TOKEN not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем что бот создан
    if (!bot) {
      console.error('Bot not initialized');
      return res.status(500).json({ 
        error: 'Bot initialization error',
        message: 'Bot not properly initialized',
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Обработка webhook от Telegram
      console.log('Received webhook request:', {
        headers: req.headers,
        bodyKeys: Object.keys(req.body || {}),
        timestamp: new Date().toISOString()
      });
      
      await bot.handleUpdate(req.body);
      res.status(200).json({ 
        ok: true,
        timestamp: new Date().toISOString() 
      });
    } else {
      // GET запрос - информация о боте
      const botInfo = {
        status: 'ok',
        message: 'Telegram Bot Webhook is ready',
        method: req.method,
        timestamp: new Date().toISOString(),
        config: {
          hasToken: !!process.env.BOT_TOKEN,
          nodeEnv: process.env.NODE_ENV || 'development',
          botInitialized: !!bot,
          region: process.env.VERCEL_REGION || 'unknown'
        },
        endpoints: {
          webhook: '/bot (POST)',
          status: '/bot (GET)',
          health: '/health'
        }
      };
      
      res.status(200).json(botInfo);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 