import { Telegraf } from 'telegraf';

export const logService = {
  logAction: async (action: string, userId?: number, details?: string) => {
    // ... отправка в лог-чат
  },
}; 