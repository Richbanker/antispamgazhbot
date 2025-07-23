# 🔧 Переменные окружения для Vercel

Скопируйте эти переменные в Settings → Environment Variables вашего Vercel проекта:

## 🚀 Обязательные переменные

```
BOT_TOKEN=your_telegram_bot_token_from_botfather
NODE_ENV=production
```

## 🛡️ Система модерации (рекомендуется)

```
AI_MODERATION=true
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-3.5-turbo
MAX_WARNINGS=3
MUTE_DURATION=600
```

## 📊 Дополнительные настройки

```
DATABASE_URL=sqlite:///tmp/database.sqlite
WEBHOOK_URL=https://your-vercel-domain.vercel.app/bot
ADMIN_IDS=123456789,987654321
PROMOTE_AFTER_DAYS=3
PROMOTE_AFTER_MESSAGES=20
WARN_LIMIT_MUTE=3
WARN_LIMIT_BAN=5
WARN_EXPIRATION_DAYS=7
```

## 🔗 Интеграции (опционально)

```
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SHEET_ID=your_google_sheet_id
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
ENABLE_AUTO_RESPONDER=false
```

## 🎯 Пошаговая настройка в Vercel:

1. Перейдите в ваш проект на Vercel
2. Settings → Environment Variables
3. Добавьте переменные по одной:
   - Name: `BOT_TOKEN`
   - Value: `ваш_токен_от_botfather`
   - Environments: Production, Preview, Development
4. Повторите для каждой переменной
5. Deploy → Redeploy для применения изменений

## ⚠️ Важные примечания:

- **BOT_TOKEN** - получите у @BotFather в Telegram
- **AI_API_KEY** - получите на https://platform.openai.com/
- **WEBHOOK_URL** - замените на ваш реальный домен Vercel
- Не добавляйте секретные ключи в код - только в Environment Variables!

## 🔍 Проверка настройки:

После деплоя проверьте:
- `https://your-domain.vercel.app/health` - статус API
- `https://your-domain.vercel.app/bot` - webhook status
- Отправьте боту `/badwords` - должны работать команды модерации 