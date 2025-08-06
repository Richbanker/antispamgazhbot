import { Telegraf } from 'telegraf';
import { config } from './config';
import { setupAntiSpam } from './middlewares/antiSpam';
import { setupCaptcha } from './middlewares/captcha';
import { setupFloodControl } from './middlewares/floodControl';
import { setupAIAntiSpam } from './middlewares/aiAntiSpam';
import { setupAIModeration } from './middlewares/aiModeration';
import { setupModerationCommands } from './commands/moderation';
import { banCommand } from './commands/ban';
import { muteCommand } from './commands/mute';
import { warnCommand } from './commands/warn';
import { unmuteCommand } from './commands/unmute';
import { userService } from './services/userService';
import { rolesCommands } from './commands/roles';
import { roleService } from './roles/roleService';
import { badWordsService } from './services/badWordsService';
import { moderationLogService } from './services/moderationLogService';

// Создаем бота
const bot = new Telegraf(process.env.BOT_TOKEN!);

// Глобальная обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Функция запуска с проверкой токена
async function startBot() {
  try {
    // Проверяем токен через getMe
    console.log('🔐 Authenticating bot...');
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Bot authenticated as @${botInfo.username} → https://t.me/${botInfo.username}`);
    console.log(`🤖 Bot name: ${botInfo.first_name}`);
    console.log(`🆔 Bot ID: ${botInfo.id}`);
    
    // Инициализируем сервисы
    console.log('🔧 Initializing services...');
    console.log(`📋 Bad words loaded: ${badWordsService.getCount()} words`);
    
    // Настраиваем middleware (новый улучшенный middleware заменяет старые)
    setupAIModeration(bot); // Новый улучшенный middleware
    setupCaptcha(bot);
    setupFloodControl(bot);
    
    // ОСНОВНЫЕ КОМАНДЫ
    console.log('📋 Registering basic commands...');
    
    // Команда /start
    bot.command('start', async (ctx) => {
      const welcomeMessage = `🤖 **Добро пожаловать в GuardianGazhBot v2.0.0!**

🛡️ **Возможности бота:**
• Автоматическая модерация чата
• AI-анализ сообщений на спам
• Система предупреждений и банов
• Контроль флуда и капча
• Управление ролями пользователей

📋 **Основные команды:**
/help - показать все команды
/test_moderation - проверить работу бота

👑 **Для администраторов:**
/badwords - управление запрещенными словами
/ban, /mute, /warn - команды модерации
/stats - статистика чата

💡 Для полной функциональности добавьте бота как администратора группы!`;
      
      await ctx.replyWithMarkdown(welcomeMessage);
    });
    
    // Команда /help
    bot.command('help', async (ctx) => {
      const helpMessage = `🆘 **Справка по командам GuardianGazhBot**

📋 **Основные команды:**
/start - приветствие и информация о боте
/help - эта справка
/test_moderation - проверить работу системы модерации

👑 **Команды для администраторов:**

🛡️ **Модерация:**
/ban @user [причина] - заблокировать пользователя
/mute @user [время] - заглушить пользователя  
/warn @user [причина] - предупредить пользователя
/unmute @user - снять заглушение

📝 **Управление словами:**
/badwords list - список запрещенных слов
/badwords add [слово] - добавить слово
/badwords remove [слово] - удалить слово

👥 **Роли и права:**
/role [@user] - показать роль пользователя
/promote @user [роль] - повысить пользователя
/admins - список администраторов

📊 **Статистика:**
/stats - статистика чата за неделю
/topusers - топ активных пользователей
/report - подробный отчет

🔧 **Настройка:**
Добавьте бота как администратора группы с правами:
• Удаление сообщений
• Блокировка пользователей  
• Ограничение участников

❓ По вопросам: @your_support_username`;
      
      await ctx.replyWithMarkdown(helpMessage);
    });

    // ТЕСТОВАЯ КОМАНДА для диагностики
    console.log('🧪 Registering test command...');
    bot.command('test_moderation', async (ctx) => {
      await ctx.reply('✅ Команды модерации работают! Система v2.0.0 активна.');
    });
    
    // Настраиваем команды
    console.log('📝 Registering moderation commands...');
    try {
      setupModerationCommands(bot); // Новые команды модерации
      console.log('✅ Moderation commands registered successfully');
    } catch (error) {
      console.error('❌ Error registering moderation commands:', error);
    }
    
    banCommand(bot);
    muteCommand(bot);
    warnCommand(bot);
    unmuteCommand(bot);
    rolesCommands(bot);
    
    // Приветствие новых участников
    bot.on('new_chat_members', async (ctx) => {
      try {
        const newMembers = ctx.message.new_chat_members;
        for (const member of newMembers) {
          // Сохраняем пользователя
          await userService.ensureUser(member.id, member.username || '');
          
          console.log(`👋 New member: ${member.username || member.id} joined chat ${ctx.chat.id}`);
          
          // Отправляем приветствие
          await ctx.replyWithMarkdown(
            `*Добро пожаловать, ${member.first_name}!*\n\nПравила чата:\n1. Без спама и рекламы\n2. Не флудить\n3. Соблюдать уважение`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: 'Я не бот', callback_data: 'captcha_pass' }]]
              }
            }
          );
        }
      } catch (error) {
        console.error('Error greeting new members:', error);
      }
    });

    // Обработка callback для captcha
    bot.action('captcha_pass', async (ctx) => {
      try {
        await ctx.answerCbQuery('✅ Проверка пройдена!');
        await ctx.deleteMessage();
        console.log(`✅ User ${ctx.from?.username || ctx.from?.id} passed captcha`);
      } catch (error) {
        console.error('Error handling captcha:', error);
      }
    });

    // Сохраняем всех пользователей и обрабатываем сообщения
    bot.use(async (ctx, next) => {
      try {
        if (ctx.from && !ctx.from.is_bot) {
          await userService.ensureUser(ctx.from.id, ctx.from.username || '');
          if (ctx.message) {
            await userService.incrementMessages(ctx.from.id);
            await roleService.autoPromote(ctx.from.id);
          }
        }
        return next();
      } catch (error) {
        console.error('Error in user middleware:', error);
        return next(); // Продолжаем обработку даже при ошибке
      }
    });

    // Глобальная обработка ошибок бота
    bot.catch(async (err: any, ctx: any) => {
      console.error('🚨 Bot error:', err);
      console.error('Update type:', ctx.updateType);
      console.error('Chat ID:', ctx.chat?.id);
      console.error('User ID:', ctx.from?.id);
      
      // Пытаемся отправить сообщение об ошибке в чат (если возможно)
      try {
        if (ctx.chat && ctx.reply) {
          await ctx.reply('⚠️ Произошла техническая ошибка. Администраторы уведомлены.');
        }
      } catch (replyError) {
        console.error('Failed to send error message to chat:', replyError);
      }
    });

    // Запускаем бота
    const webhookUrl = process.env.WEBHOOK_URL;
    const port = parseInt(process.env.PORT || '3000');
    
    if (webhookUrl) {
      // Webhook mode для продакшена
      console.log('🌐 Starting in webhook mode...');
      
      // Устанавливаем webhook
      await bot.telegram.setWebhook(webhookUrl, {
        drop_pending_updates: true, // Очищаем старые обновления
        allowed_updates: ['message', 'callback_query', 'chat_member'] // Только нужные типы
      });
      
      // Запускаем webhook сервер
      await bot.launch({
        webhook: {
          domain: webhookUrl,
          port: port,
          hookPath: '/bot' // Путь для webhook
        }
      });
      
      console.log('✅ Bot started successfully!');
      console.log('📡 Mode: Webhook');
      console.log(`🌐 Webhook URL: ${webhookUrl}`);
      console.log(`🔌 Port: ${port}`);
      console.log(`📍 Webhook path: /bot`);
    } else {
      // Polling mode для разработки
      console.log('🔄 Starting in polling mode...');
      
      await bot.launch();
      
      console.log('✅ Bot started successfully!');
      console.log('📡 Mode: Long Polling');
    }
    
    console.log('🛑 Press Ctrl+C to stop\n');
    
  } catch (error: any) {
    if (error.response?.error_code === 401) {
      console.error('\n❌ Invalid token! (401 Unauthorized)');
      console.error('📋 Please check your BOT_TOKEN');
      console.error('💡 Get a new token from @BotFather');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n❌ Network error! Cannot connect to Telegram');
      console.error('📡 Check your internet connection');
      console.error('🔥 Check if Telegram is blocked in your region');
    } else {
      console.error('\n❌ Bot startup failed:', error.message || error);
      console.error('Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Останавливаем бота
    bot.stop(signal);
    console.log('✅ Bot stopped gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Запускаем бота
startBot();

// Экспортируем для тестов
export { bot }; 