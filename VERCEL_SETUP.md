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
DATABASE_PATH=/tmp/database.sqlite
ADMIN_IDS=123456789,987654321
WEBHOOK_URL=https://your-project.vercel.app/bot
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