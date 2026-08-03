# Telegram Moderator Bot

Система модерации Telegram-чатов на TypeScript: бот на Telegraf, API на Express и отдельная React-панель. Проект объединяет правила антиспама, предупреждения и ограничения пользователей, аналитику, отчёты и опциональную проверку сообщений через OpenAI API.

## Основные возможности

- фильтрация стоп-слов и ссылок;
- flood control и captcha для новых участников;
- предупреждения, mute, ban и управление ролями;
- журналирование действий модерации;
- команды администратора и аналитика активности;
- экспорт отчётов в Excel и PDF;
- интеграция с Google Sheets и внешними webhook;
- опциональная AI-классификация `normal`, `spam`, `scam` и `offtopic`;
- React-панель со страницами dashboard, analytics, users и settings;
- long polling для разработки и webhook для deployment.

AI-модерация отключается при отсутствии конфигурации. Базовые правила модерации продолжают работать без внешней AI-службы.

## Технологический стек

### Bot и API

- Node.js 20, TypeScript;
- Telegraf и Express;
- SQLite;
- Axios;
- ExcelJS, PDFKit, Chart.js;
- Google APIs;
- PM2.

### Панель управления

- React 18, TypeScript;
- React Router;
- Vite и Tailwind CSS;
- Chart.js.

### Инфраструктура

- Docker и Docker Compose;
- Nginx;
- GitHub Actions;
- Vercel-конфигурация для serverless API и frontend.

## Архитектура

```text
Telegram
   │
   ▼
Telegraf bot ──► moderation middleware ──► services ──► SQLite
   │                       │                    │
   │                       └──► OpenAI API      ├──► Excel/PDF reports
   │                            (optional)      └──► Google Sheets/webhooks
   ▼
Express API ◄────────────────────────────── React admin panel
```

- `src/middlewares/` применяет правила антиспама, captcha и flood control;
- `src/services/` хранит пользователей, предупреждения и журналы модерации;
- `src/commands/` содержит команды управления и отчётности;
- `src/ai/` изолирует опциональную AI-интеграцию;
- `backend/` предоставляет API для панели;
- `frontend/` содержит React-приложение панели;
- `api/` адаптирует HTTP-обработчики для serverless deployment.

## Локальный запуск

Требуются Node.js 20 и npm 10+.

```bash
git clone https://github.com/Richbanker/antispamgazhbot.git
cd antispamgazhbot
npm install
cp .env.example .env
npm run dev:bot
```

Панель запускается отдельно:

```bash
cd frontend
npm install
npm run dev
```

## Переменные окружения

Никогда не добавляйте реальные значения в git. Основные имена конфигурации:

- `BOT_TOKEN` — токен Telegram-бота;
- `APP_BASE_URL`, `WEBHOOK_PATH`, `WEBHOOK_SECRET`, `WEBHOOK_URL` — webhook;
- `PORT`, `NODE_ENV` — HTTP-сервер и режим запуска;
- `DATABASE_URL` — подключение к хранилищу;
- `USE_AI_ANTISPAM`, `AI_MODERATION`, `AI_API_KEY`, `AI_MODEL`, `AI_MODE` — AI-модерация;
- `MAX_WARNINGS`, `MUTE_DURATION`, `WARN_LIMIT_MUTE`, `WARN_LIMIT_BAN` — санкции;
- `GOOGLE_API_KEY`, `GOOGLE_SHEET_ID` — Google Sheets;
- `SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL` — внешние уведомления.

## Проверки

```bash
npm run lint
npm run build
cd frontend && npm run lint
cd frontend && npm run build
```

Автоматических unit- и integration-тестов в текущей версии нет: команда `npm test` выводит только сообщение-заглушку.

Минимальный test plan:

1. unit-тесты правил стоп-слов, flood control и расчёта предупреждений;
2. integration-тесты middleware с mock Telegraf context;
3. проверка webhook secret и административной авторизации;
4. smoke-тест запуска bot/API без внешних интеграций;
5. компонентные тесты критичных экранов панели.

## Deployment

Репозиторий содержит Docker, Docker Compose, Nginx, PM2 и GitHub Actions. Перед deployment проверьте права Telegram-бота, HTTPS, webhook secret и переменные окружения. Workflow не должен содержать резервные токены или другие credentials в открытом виде.

## Статус проекта

Pet project / технический showcase. Функциональность широкая, но перед production-использованием необходимы ротация всех когда-либо опубликованных credentials, автоматические тесты и дополнительная проверка административного API.

## Планы развития

- покрыть правила модерации и API тестами;
- унифицировать конфигурацию bot, backend и serverless API;
- добавить миграции схемы данных;
- документировать модель доступа к панели;
- настроить безопасное хранение deployment secrets.
