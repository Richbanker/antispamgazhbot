// @ts-nocheck
import { Telegraf, Context } from 'telegraf';
import { requireAdmin } from '../admin/adminMiddleware';
import { statsService } from '../analytics/statsService';
import { userService } from '../services/userService';
import { buildStatsChart, buildReportPDF, buildReportExcel } from '../analytics/reportService';

export function analyticsCommands(bot: Telegraf<Context>) {
  bot.command('stats', requireAdmin(), async (ctx) => {
    const stats = statsService.getStatsForDays(7);
    const chart = await buildStatsChart(stats);
    await ctx.replyWithPhoto({ source: chart, filename: 'stats.png' });
  });

  bot.command('topusers', requireAdmin(), async (ctx) => {
    const top = await userService.getTopUsers(10);
    const text = top.map((u, i) => `${i + 1}. @${u.username} — ${u.count}`).join('\n');
    await ctx.reply('Топ пользователей:\n' + text);
  });

  bot.command('topwords', requireAdmin(), async (ctx) => {
    const top = await userService.getTopWords(10);
    const text = top.map((w, i) => `${i + 1}. ${w.word} — ${w.count}`).join('\n');
    await ctx.reply('Топ слов:\n' + text);
  });

  bot.command('report', requireAdmin(), async (ctx) => {
    const stats = statsService.getStatsForDays(7);
    const topUsers = await userService.getTopUsers(10);
    const spamStats = {}; // TODO: собрать AI-статистику
    const pdf = await buildReportPDF({ stats, topUsers, spamStats });
    await ctx.replyWithDocument({ source: pdf, filename: 'report.pdf' });
  });

  bot.command('spamstats', requireAdmin(), async (ctx) => {
    const statsDay = await userService.getAICategoryStats(1);
    const statsWeek = await userService.getAICategoryStats(7);
    const format = (stats: any) => Object.entries(stats).map(([cat, val]) => `${cat}: ${val}%`).join('\n');
    await ctx.reply(`AI-анализ за день:\n${format(statsDay)}\n\nЗа неделю:\n${format(statsWeek)}`);
  });
} 