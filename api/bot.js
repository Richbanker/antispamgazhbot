const { Telegraf } = require('telegraf');

// Загружаем переменные окружения
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Проверяем наличие BOT_TOKEN
if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is not set in environment variables');
}

// Создаем бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Базовые команды
bot.start(async (ctx) => {
  await ctx.reply('🤖 Бот запущен и готов к работе!\n\n/help - список команд');
});

bot.help(async (ctx) => {
  await ctx.reply(`
🤖 *Команды бота:*

👋 /start - Запуск бота
❓ /help - Эта справка
📊 /stats - Статистика чата

*Статус:* ✅ Активен (Vercel)
  `, { parse_mode: 'Markdown' });
});

bot.command('stats', async (ctx) => {
  const chatInfo = await ctx.getChatMembersCount();
  
  await ctx.reply(`
📊 *Статистика чата:*

👥 Участников: ${chatInfo}
🤖 Бот активен: ✅
📡 Режим: Webhook (Vercel)
⏰ Время работы: ${Math.floor(process.uptime() / 60)} мин

🛡️ *Система модерации активна*
  `, { parse_mode: 'Markdown' });
});

// Приветствие новых участников
bot.on('new_chat_members', async (ctx) => {
  try {
    const newMembers = ctx.message.new_chat_members;
    for (const member of newMembers) {
      await ctx.replyWithMarkdown(
        `*Добро пожаловать, ${member.first_name}!*\n\nПравила чата:\n1. Без спама и рекламы\n2. Не флудить\n3. Соблюдать уважение`
      );
    }
  } catch (error) {
    console.error('Error greeting new members:', error);
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

module.exports = async (req, res) => {
  try {
    // Проверяем наличие токена
    if (!process.env.BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'BOT_TOKEN not configured' 
      });
    }

    if (req.method === 'POST') {
      // Обработка webhook от Telegram
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } else {
      // GET запрос - информация о боте
      res.status(200).json({
        status: 'ok',
        message: 'Telegram Bot Webhook is ready',
        method: req.method,
        timestamp: new Date().toISOString(),
        hasToken: !!process.env.BOT_TOKEN,
        nodeEnv: process.env.NODE_ENV || 'development'
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 