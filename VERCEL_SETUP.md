# 🚀 Быстрая настройка Vercel

## ⚙️ Настройка переменных окружения

После создания проекта в Vercel, добавьте следующие переменные окружения в настройках проекта:

### Обязательные переменные:

```env
BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=production
```

### Дополнительные переменные (опционально):

```env
# База данных
DATABASE_PATH=/tmp/database.sqlite
DATABASE_URL=sqlite:///tmp/database.sqlite

# Администраторы
ADMIN_IDS=123456789,987654321

# Webhook
WEBHOOK_URL=https://your-project.vercel.app/bot

# AI модерация (НОВОЕ!)
AI_MODERATION=true
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo

# Настройки модерации (НОВОЕ!)
MAX_WARNINGS=3
MUTE_DURATION=600

# Устаревшие настройки (для совместимости)
USE_AI_ANTISPAM=false
AI_MODE=simple
```

## 📋 Пошаговая инструкция:

1. **Создайте проект в Vercel**
   - Подключите GitHub репозиторий
   - Framework: `Other`
   - Root Directory: `./` (оставить пустым)

2. **Настройте переменные окружения**
   - Перейдите в Settings → Environment Variables
   - Добавьте `BOT_TOKEN` со значением вашего Telegram бота
   - Добавьте `NODE_ENV=production`
   - **ДЛЯ AI МОДЕРАЦИИ (опционально):**
     - `AI_MODERATION=true`
     - `AI_PROVIDER=openai`
     - `AI_API_KEY=sk-your-openai-key`
     - `MAX_WARNINGS=3`
     - `MUTE_DURATION=600`

3. **Установите webhook**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://<YOUR_VERCEL_URL>/bot"}'
   ```

4. **Проверьте работу**
   - `https://your-project.vercel.app/` - главная страница
   - `https://your-project.vercel.app/health` - статус API
   - `https://your-project.vercel.app/bot` - webhook бота

5. **Протестируйте модерацию** (после настройки AI_MODERATION)
   - Напишите в чат запрещенное слово из списка
   - Используйте команды `/badwords list`, `/modlog`
   - Проверьте работу AI-анализа спама

## ❗ Важно

- Замените `your_telegram_bot_token_here` на реальный токен от BotFather
- Замените `your-project.vercel.app` на ваш реальный URL проекта
- Не коммитьте токены в репозиторий!

## 🔧 Диагностика проблем

Если бот не работает:

1. Проверьте логи в Vercel Dashboard
2. Откройте `/bot` в браузере - должен показать статус
3. Проверьте webhook: `/api/bot`
4. Убедитесь что `BOT_TOKEN` установлен правильно 