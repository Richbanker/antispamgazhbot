# 🤖 Telegram Moderator Bot

Продвинутый Telegram-бот для модерации чатов с ИИ-анализом спама и React-панелью управления.

## ✨ Возможности

### 🛡️ Модерация
- **ИИ Анти-спам** - Нейросеть для обнаружения спама и рекламы
- **Флуд-контроль** - Защита от массовых сообщений
- **Система предупреждений** - Автоматические варны и баны
- **Капча для новичков** - Проверка новых участников
- **Роли пользователей** - VIP, Verified, Active, Newbie

### 📊 Аналитика
- **Детальная статистика** - Графики активности и угроз
- **Экспорт данных** - PDF, Excel отчёты
- **Мониторинг системы** - CPU, память, производительность

### 🎛️ Панель управления
- **Современный UI** - Киберпанк дизайн с анимациями
- **Управление пользователями** - Поиск, фильтры, действия
- **Гибкие настройки** - Конфигурация всех параметров
- **Русский интерфейс** - Полная локализация

## 🚀 Быстрый запуск

### Предварительные требования

- **Node.js 20.x LTS** (рекомендуется использовать nvm)
- **npm 10+**
- **Docker** (для контейнерного деплоя)
- **Telegram Bot Token** (получить у @BotFather)
- **Домен с SSL** (для webhook режима)

### 1. Установка Node.js

```bash
# Используя nvm (рекомендуется)
nvm install 20
nvm use 20

# Проверка версии
node -v  # должно быть v20.x.x
npm -v   # должно быть 10.x.x
```

### 2. Клонирование и установка

```bash
git clone <your-repo-url>
cd telegram-moderator-bot

# Установка зависимостей
npm install

# Установка фронтенд зависимостей
cd frontend
npm install
cd ..
```

### 3. Настройка окружения

```bash
# Копируем пример конфигурации
cp .env.example .env

# Редактируем .env
nano .env
```

**Обязательные параметры в `.env`:**

```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=                              # Для продакшена
PORT=3000

# Database
DATABASE_PATH=./database.sqlite

# Admin settings
ADMIN_IDS=123456789,987654321

# AI Features (опционально)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Integration (опционально)
GOOGLE_SHEETS_ID=your_sheets_id
WEBHOOK_NOTIFICATION_URL=your_webhook_url
```

### 4. Запуск в разработке

```bash
# Терминал 1: Запуск бота
npm run dev:bot

# Терминал 2: Запуск фронтенда
cd frontend
npm run dev
```

**Доступ:**
- 🤖 **Бот**: Работает в Telegram (long polling)
- 🖥️ **Панель**: http://localhost:5173
- 🔗 **API**: http://localhost:3000

## 🐳 Docker деплой

### Быстрый запуск одной командой

```bash
# Запуск всего стека
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Ручная сборка

```bash
# Сборка образа
npm run docker:build

# Запуск контейнера
npm run docker:run

# Просмотр логов
docker logs telegram-bot -f

# Остановка
npm run docker:stop
```

### Продакшен с Nginx

```bash
# Запуск с reverse proxy
docker-compose --profile production up -d

# Доступ через Nginx
# http://localhost - фронтенд
# http://localhost/bot - webhook для бота
# http://localhost/api - API эндпоинты
```

## 🌐 Продакшен деплой

### VPS деплой с PM2

#### 1. Подготовка сервера

```bash
# Обновление системы (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 глобально
sudo npm install -g pm2

# Установка Nginx
sudo apt install nginx -y
```

#### 2. Деплой приложения

```bash
# Клонирование на сервер
git clone <your-repo> /var/www/telegram-bot
cd /var/www/telegram-bot

# Установка зависимостей
npm install
cd frontend && npm install && cd ..

# Сборка приложения
npm run build
cd frontend && npm run build && cd ..

# Настройка .env для продакшена
cp .env.example .env
nano .env
```

**Продакшен `.env`:**

```env
BOT_TOKEN=your_real_bot_token
WEBHOOK_URL=https://yourdomain.com/bot
PORT=3000
NODE_ENV=production
DATABASE_PATH=/var/www/telegram-bot/data/database.sqlite
```

#### 3. Запуск с PM2

```bash
# Создание директорий
mkdir -p logs data

# Запуск бота
npm run start:pm2

# Проверка статуса
pm2 status

# Просмотр логов
npm run logs:pm2

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

#### 4. Настройка Nginx

```bash
# Копирование конфигурации
sudo cp nginx.conf /etc/nginx/sites-available/telegram-bot
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/

# Копирование статики фронтенда
sudo cp -r frontend/dist/* /var/www/html/

# Перезапуск Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Webhook настройка

#### 1. Получение SSL сертификата

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d yourdomain.com

# Автообновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. Установка webhook

```bash
# Проверка webhook (замените на ваш домен и токен)
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/bot"}'

# Проверка статуса webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## 🔧 Управление

### PM2 команды

```bash
# Статус процессов
pm2 status

# Перезапуск
npm run restart:pm2

# Остановка
npm run stop:pm2

# Мониторинг в реальном времени
pm2 monit

# Просмотр логов
npm run logs:pm2
```

### Docker команды

```bash
# Просмотр контейнеров
docker ps

# Логи конкретного сервиса
docker-compose logs bot -f

# Перезапуск сервиса
docker-compose restart bot

# Обновление образов
docker-compose pull && docker-compose up -d
```

### Обновление приложения

```bash
# Получение изменений
git pull origin main

# Установка новых зависимостей
npm install
cd frontend && npm install && cd ..

# Пересборка
npm run build
cd frontend && npm run build && cd ..

# Перезапуск
npm run restart:pm2
```

## 🔍 Мониторинг и логи

### Логи приложения

```bash
# PM2 логи
tail -f logs/combined.log
tail -f logs/err.log

# Docker логи
docker-compose logs -f bot
```

### Системный мониторинг

```bash
# Использование ресурсов
pm2 monit

# Статистика системы
htop
df -h
free -h
```

### Health checks

```bash
# Проверка API
curl http://localhost:3000/health

# Проверка webhook
curl https://yourdomain.com/health

# Проверка фронтенда
curl http://localhost:3001
```

## 🔧 Конфигурация

### Переменные окружения

Все настройки бота конфигурируются через файл `.env`:

```env
# Обязательные параметры
BOT_TOKEN=your_telegram_bot_token_here    # Токен бота от @BotFather
WEBHOOK_URL=https://yourdomain.com/bot    # Для webhook режима
PORT=3000                                 # Порт сервера

# База данных
DATABASE_PATH=./database.sqlite           # Путь к файлу БД

# Администраторы
ADMIN_IDS=123456789,987654321            # ID админов через запятую

# ИИ функции (опционально)
OPENAI_API_KEY=your_openai_key           # Для ИИ анти-спам
GEMINI_API_KEY=your_gemini_key           # Альтернативный ИИ

# Интеграции (опционально)
GOOGLE_SHEETS_ID=your_sheets_id          # Экспорт в Google Sheets
WEBHOOK_NOTIFICATION_URL=your_webhook    # Уведомления
```

### Настройка функций

Бот поддерживает гибкую настройку через конфигурационные файлы:

- **Анти-спам**: Настройка фильтров и правил
- **Роли пользователей**: Автоматическое повышение
- **Лимиты**: Предупреждения, муты, баны
- **Логирование**: Уровни детализации

## 🛠️ Разработка

### Структура проекта

```
telegram-moderator-bot/
├── src/                    # Backend (Node.js + TypeScript)
│   ├── bot.ts             # Основной файл бота
│   ├── commands/          # Команды бота
│   ├── middlewares/       # Middleware (анти-спам, флуд)
│   ├── services/          # Сервисы (пользователи, логи)
│   └── utils/             # Утилиты
├── frontend/              # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── pages/         # Страницы (Dashboard, Analytics, Users)
│   │   └── components/    # Компоненты
│   └── dist/              # Собранный фронтенд
├── docker-compose.yml     # Docker конфигурация
├── Dockerfile             # Docker образ
├── ecosystem.config.js    # PM2 конфигурация
└── nginx.conf            # Nginx конфигурация
```

### Добавление новых функций

1. **Новая команда бота:**

```typescript
// src/commands/newcommand.ts
import { Telegraf } from 'telegraf';

export function newCommand(bot: Telegraf) {
  bot.command('newcommand', async (ctx) => {
    await ctx.reply('Новая команда работает!');
  });
}
```

2. **Новая страница фронтенда:**

```tsx
// frontend/src/pages/NewPage.tsx
import React from 'react';

export default function NewPage() {
  return (
    <div className="min-h-screen bg-black">
      <h1 className="text-green-400">Новая страница</h1>
    </div>
  );
}
```

### Тестирование

```bash
# Линтинг
npm run lint

# Форматирование
npm run format

# Тестирование бота локально
npm run dev:bot

# Тестирование фронтенда
cd frontend && npm run dev
```

## 🆘 Устранение неисправностей

### Частые проблемы

#### 1. Бот не запускается

```bash
# Проверка токена
echo $BOT_TOKEN

# Проверка подключения к Telegram
curl "https://api.telegram.org/bot$BOT_TOKEN/getMe"

# Проверка логов
npm run logs:pm2
```

#### 2. Webhook не работает

```bash
# Проверка SSL
curl -I https://yourdomain.com/bot

# Проверка webhook статуса
curl "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"

# Сброс webhook
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook"
```

#### 3. Фронтенд не загружается

```bash
# Проверка сборки
cd frontend && npm run build

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx

# Проверка портов
netstat -tlnp | grep :80
```

#### 4. База данных

```bash
# Проверка файла БД
ls -la database.sqlite

# Права доступа
chmod 664 database.sqlite
chown www-data:www-data database.sqlite
```

### Логи и диагностика

```bash
# Системные логи
journalctl -u nginx
journalctl -f

# PM2 логи
pm2 logs --lines 100

# Docker логи
docker-compose logs --tail=100
```

## 📞 Поддержка

- 📧 **Email**: support@yourbot.com
- 💬 **Telegram**: @YourBotSupport
- 📖 **Документация**: https://docs.yourbot.com
- 🐛 **Issues**: GitHub Issues

## 📄 Лицензия

MIT License - смотрите [LICENSE](LICENSE) файл для деталей.

---

**Создано с ❤️ для Telegram сообществ** 