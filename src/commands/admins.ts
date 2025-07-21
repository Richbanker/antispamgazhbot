import { Telegraf, Context } from 'telegraf';
import { adminService, AdminRole } from '../admin/adminService';
import { userService } from '../services/userService';
import { requireOwner } from '../admin/adminMiddleware';

function getMentionedUser(ctx: Context) {
  const username = (ctx.message && 'text' in ctx.message)
    ? (ctx.message as any).text.split(' ')[1]?.replace('@', '')
    : undefined;
  return username;
}

export function adminsCommands(bot: Telegraf<Context>) {
  bot.command('addadmin', requireOwner(), async (ctx) => {
    const [_, username, role] = ctx.message?.text?.split(' ') || [];
    if (!username || !role) return ctx.reply('Используйте: /addadmin @user role');
    if (!['owner', 'admin', 'moderator'].includes(role)) return ctx.reply('Роль должна быть owner, admin или moderator');
    const user = await userService.getUserByUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Пользователь не найден');
    adminService.addAdmin(user.id, username.replace('@', ''), role as AdminRole);
    ctx.reply(`Пользователь @${username} назначен ${role}`);
  });

  bot.command('removeadmin', requireOwner(), async (ctx) => {
    const [_, username] = ctx.message?.text?.split(' ') || [];
    if (!username) return ctx.reply('Используйте: /removeadmin @user');
    const user = await userService.getUserByUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Пользователь не найден');
    adminService.removeAdmin(user.id);
    ctx.reply(`Пользователь @${username} больше не админ.`);
  });

  bot.command('admins', async (ctx) => {
    const admins = adminService.getAdmins();
    if (!admins.length) return ctx.reply('Нет админов.');
    const list = admins.map(a => `@${a.username} — ${a.role}`).join('\n');
    ctx.reply('Список админов:\n' + list);
  });
} 