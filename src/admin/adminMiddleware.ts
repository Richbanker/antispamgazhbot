import { MiddlewareFn } from 'telegraf';
import { adminService } from './adminService';

export function requireOwner(): MiddlewareFn<any> {
  return (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !adminService.isOwner(userId)) {
      ctx.reply('Только owner может выполнять эту команду.');
      return;
    }
    return next();
  };
}

export function requireAdmin(): MiddlewareFn<any> {
  return (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !adminService.isAdmin(userId)) {
      ctx.reply('Только admin или выше может выполнять эту команду.');
      return;
    }
    return next();
  };
}

export function requireModerator(): MiddlewareFn<any> {
  return (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !adminService.isModerator(userId)) {
      ctx.reply('Только moderator или выше может выполнять эту команду.');
      return;
    }
    return next();
  };
} 