import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Принудительная загрузка .env из корня проекта
const envPath = path.resolve(process.cwd(), '.env');
console.log('📁 Working directory:', process.cwd());
console.log('🔍 Looking for .env at:', envPath);

// Всегда используем ручную загрузку для надежности
if (fs.existsSync(envPath)) {
  console.log('📄 .env file found, loading manually...');
  
  try {
    // Читаем файл и удаляем BOM
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/^\uFEFF/, ''); // Убираем BOM
    
    console.log('📝 Raw .env content (first 100 chars):', envContent.substring(0, 100));
    
    // Парсим переменные
    const lines = envContent.split(/\r?\n/);
    let loadedCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          
          // Убираем кавычки если есть
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          process.env[key] = value;
          loadedCount++;
          console.log(`✅ Loaded ${key}=${value.length > 0 ? '***' : 'EMPTY'}`);
        }
      }
    }
    
    console.log(`✅ Successfully loaded ${loadedCount} environment variables`);
  } catch (error) {
    console.error('❌ Failed to read .env file:', error);
    
    // Fallback к dotenv
    console.log('🔄 Trying dotenv as fallback...');
    const result = dotenv.config({ path: envPath });
    if (result.parsed) {
      console.log('✅ dotenv fallback successful');
      Object.keys(result.parsed).forEach(key => {
        console.log(`✅ Loaded via dotenv ${key}=***`);
      });
    }
  }
} else {
  console.error('❌ .env file not found!');
}

// Debug: проверим что именно загружено
console.log('🔍 Debug - BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
console.log('🔍 Debug - BOT_TOKEN length:', process.env.BOT_TOKEN?.length || 0);
if (process.env.BOT_TOKEN) {
  console.log('🔍 Debug - BOT_TOKEN starts with:', process.env.BOT_TOKEN.substring(0, 10) + '...');
}

// Создаем .env.example если его нет
const envExamplePath = path.resolve(process.cwd(), '.env.example');
if (!fs.existsSync(envExamplePath)) {
  const envExampleContent = `# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=
PORT=3000

# Database
DATABASE_PATH=./database.sqlite

# Admin settings
ADMIN_IDS=123456789,987654321

# AI Features (optional)
OPENAI_API_KEY=
GEMINI_API_KEY=

# Integration (optional)
GOOGLE_SHEETS_ID=
WEBHOOK_NOTIFICATION_URL=
`;
  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('📝 Created .env.example file');
}

// Проверяем BOT_TOKEN
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN.trim() === '' || process.env.BOT_TOKEN === 'your_telegram_bot_token_here') {
  console.error('\n❌ BOT_TOKEN is missing or invalid!');
  console.error('✅ Checked path:', envPath);
  console.error('\n💡 How to fix:');
  console.error('1. Create .env file and add BOT_TOKEN=your_token');
  console.error('2. Or run with environment variable:');
  console.error('   PowerShell: $env:BOT_TOKEN="your_token"; npm run dev:bot');
  console.error('   Unix/Git Bash: BOT_TOKEN=your_token npm run dev:bot');
  console.error('\n📄 See .env.example for reference');
  process.exit(1);
}

console.log('✅ BOT_TOKEN loaded successfully\n');

// Импортируем бота после проверки токена
import('./bot').catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
