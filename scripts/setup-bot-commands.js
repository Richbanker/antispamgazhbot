#!/usr/bin/env node

const https = require('https');

// Получаем токен из переменных окружения или параметров
const BOT_TOKEN = process.env.BOT_TOKEN || process.argv[2];

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден!');
  console.log('Использование:');
  console.log('  node setup-bot-commands.js <BOT_TOKEN>');
  console.log('  или установите переменную окружения BOT_TOKEN');
  process.exit(1);
}

// Список команд для бота
const commands = [
  { command: 'start', description: '🚀 Запуск бота' },
  { command: 'help', description: '❓ Помощь и список команд' },
  { command: 'stats', description: '📊 Статистика чата' },
  { command: 'status', description: '🟢 Статус системы' },
  { command: 'rules', description: '📋 Правила чата' },
  { command: 'about', description: '🤖 О боте' }
];

// Функция для отправки команд в Telegram
function setupBotCommands() {
  const data = JSON.stringify({ commands });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/setMyCommands`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        if (response.ok) {
          console.log('✅ Команды бота успешно настроены!');
          console.log('📋 Установленные команды:');
          commands.forEach(cmd => {
            console.log(`   /${cmd.command} - ${cmd.description}`);
          });
        } else {
          console.error('❌ Ошибка настройки команд:', response.description);
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга ответа:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error.message);
  });

  req.write(data);
  req.end();
}

// Функция для проверки бота
function checkBot() {
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/getMe`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        if (response.ok) {
          const bot = response.result;
          console.log('🤖 Информация о боте:');
          console.log(`   Имя: ${bot.first_name}`);
          console.log(`   Username: @${bot.username}`);
          console.log(`   ID: ${bot.id}`);
          console.log(`   Верифицирован: ${bot.is_verified ? '✅' : '❌'}`);
          console.log('');
          
          // Настраиваем команды
          setupBotCommands();
        } else {
          console.error('❌ Ошибка получения информации о боте:', response.description);
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга ответа:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error.message);
  });

  req.end();
}

console.log('🔧 Настройка команд Telegram бота...');
console.log('');
checkBot(); 