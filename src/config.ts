export const config = {
  stopWords: ['реклама', 'казино', 'http', 'https', 'спам'],
  flood: {
    maxMessages: 5,
    intervalSec: 30,
    muteDurationMin: 10,
  },
  captcha: {
    timeoutSec: 60,
  },
  db: {
    type: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite',
    url: process.env.DATABASE_URL || 'sqlite://database.sqlite',
  },
  USE_AI_ANTISPAM: process.env.USE_AI_ANTISPAM === 'true',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-3.5-turbo',
  AI_MODE: process.env.AI_MODE || 'simple',
  PROMOTE_AFTER_DAYS: Number(process.env.PROMOTE_AFTER_DAYS) || 3,
  PROMOTE_AFTER_MESSAGES: Number(process.env.PROMOTE_AFTER_MESSAGES) || 20,
  WARN_LIMIT_MUTE: Number(process.env.WARN_LIMIT_MUTE) || 3,
  WARN_LIMIT_BAN: Number(process.env.WARN_LIMIT_BAN) || 5,
  WARN_EXPIRATION_DAYS: Number(process.env.WARN_EXPIRATION_DAYS) || 7,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
  ENABLE_AUTO_RESPONDER: process.env.ENABLE_AUTO_RESPONDER === 'true',
  
  // Новые параметры для улучшенной модерации
  AI_MODERATION: process.env.AI_MODERATION === 'true',
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai', // openai или claude
  MAX_WARNINGS: Number(process.env.MAX_WARNINGS) || 3,
  MUTE_DURATION: Number(process.env.MUTE_DURATION) || 600, // секунды (10 минут по умолчанию)
}; 