# 🚀 Деплой на GitHub и Vercel

## 📋 Пошаговая инструкция

### 1. Подготовка проекта

```bash
# Убедитесь что проект собран
npm run check:production

# Если есть ошибки - исправьте их
npm run build
cd frontend && npm run build && cd ..
```

### 2. Загрузка на GitHub

#### 2.1. Создайте репозиторий на GitHub

1. Идите на https://github.com
2. Нажмите "New repository"
3. Название: `telegram-moderator-bot` (или любое другое)
4. Описание: `Advanced Telegram bot for chat moderation with AI anti-spam`
5. Выберите "Public" или "Private"
6. **НЕ** добавляйте README, .gitignore, license (у нас уже есть)

#### 2.2. Инициализируйте Git локально

```bash
# Инициализация репозитория
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Telegram moderator bot with React panel"

# Подключение к GitHub (замените YOUR_USERNAME и YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Отправка на GitHub
git branch -M main
git push -u origin main
```

### 3. Деплой на Vercel

#### 3.1. Подключение к Vercel

1. Идите на https://vercel.com
2. Войдите через GitHub аккаунт
3. Нажмите "New Project"
4. Выберите ваш репозиторий `telegram-moderator-bot`

#### 3.2. Настройка проекта в Vercel

**Build & Development Settings:**
- Framework Preset: `Other`
- Root Directory: `./` (оставить пустым)
- Build Command: `npm run build && cd frontend && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install && cd frontend && npm install`

**Environment Variables:**
Добавьте переменные окружения в настройках Vercel:

```env
BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=production
DATABASE_PATH=/tmp/database.sqlite
ADMIN_IDS=123456789,987654321
```

#### 3.3. Настройка webhook URL

После деплоя получите URL вашего проекта (например: `https://your-project.vercel.app`)

Добавьте переменную окружения в Vercel:
```env
WEBHOOK_URL=https://your-project.vercel.app/bot
```

### 4. Настройка Telegram webhook

```bash
# Установите webhook (замените YOUR_BOT_TOKEN и YOUR_VERCEL_URL)
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_VERCEL_URL/bot"}'

# Проверьте статус webhook
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

### 5. Проверка работы

1. **Бот**: Отправьте `/start` вашему боту в Telegram
2. **Панель**: Откройте `https://your-project.vercel.app`
3. **API**: Проверьте `https://your-project.vercel.app/health`

## 🔧 Настройки Vercel

### Рекомендуемые настройки

**Function Configuration:**
```json
{
  "functions": {
    "dist/index.js": {
      "maxDuration": 30
    }
  }
}
```

**Headers для безопасности:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📊 Мониторинг

### Vercel Analytics

1. В настройках проекта включите "Analytics"
2. В настройках включите "Speed Insights"

### Логи

```bash
# Просмотр логов в реальном времени
vercel logs https://your-project.vercel.app

# Логи функции
vercel logs https://your-project.vercel.app --function=dist/index.js
```

## 🛠️ Обновление проекта

```bash
# Внесите изменения в код
git add .
git commit -m "Update: описание изменений"
git push

# Vercel автоматически пересоберет проект
```

## ⚡ Быстрый деплой (одной командой)

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel --prod

# Настройка webhook
vercel env add WEBHOOK_URL
# Введите: https://your-project.vercel.app/bot
```

## 🆘 Устранение неисправностей

### Проблемы с деплоем

**Build Error:**
```bash
# Локально проверьте сборку
npm run build
cd frontend && npm run build
```

**Function Timeout:**
- Увеличьте `maxDuration` до 30 секунд в `vercel.json`

**Database Issues:**
- Vercel использует serverless функции, база данных будет пересоздаваться
- Рассмотрите использование внешней БД (PlanetScale, Railway)

### Проблемы с ботом

**Webhook не работает:**
```bash
# Проверьте URL
curl https://your-project.vercel.app/health

# Проверьте webhook
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"
```

**Бот не отвечает:**
- Проверьте логи в Vercel Dashboard
- Убедитесь что `BOT_TOKEN` правильно настроен

## 🎯 Результат

После успешного деплоя у вас будет:

- ✅ **Бот работает** через webhook на Vercel
- ✅ **Панель доступна** по URL проекта
- ✅ **Автоматические обновления** при push в GitHub
- ✅ **Мониторинг** через Vercel Dashboard

**URL структура:**
- `https://your-project.vercel.app/` - Панель управления
- `https://your-project.vercel.app/bot` - Webhook для Telegram
- `https://your-project.vercel.app/health` - Health check 