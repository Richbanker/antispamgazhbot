// @ts-ignore
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { ChartConfiguration } from 'chart.js';

export async function buildStatsChart(stats: Array<{ date: string, messages: number, new_users: number, bans: number }>): Promise<Buffer> {
  const width = 800, height = 400;
  const chart = new ChartJSNodeCanvas({ width, height });
  const config: ChartConfiguration<'line'> = {
    type: 'line' as const,
    data: {
      labels: stats.map(s => s.date),
      datasets: [
        { label: 'Сообщения', data: stats.map(s => s.messages), borderColor: 'blue', fill: false },
        { label: 'Новые', data: stats.map(s => s.new_users), borderColor: 'green', fill: false },
        { label: 'Баны', data: stats.map(s => s.bans), borderColor: 'red', fill: false },
      ]
    },
    options: { responsive: false }
  };
  return await chart.renderToBuffer(config);
}

export async function buildReportPDF(data: { stats: any[], topUsers: any[], spamStats: any }): Promise<string> {
  const filePath = path.join(__dirname, '../../report.pdf');
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(18).text('Отчёт по чату', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Статистика за период:');
  data.stats.forEach(s => doc.text(`${s.date}: сообщений ${s.messages}, новых ${s.new_users}, банов ${s.bans}`));
  doc.moveDown();
  doc.text('Топ пользователей:');
  data.topUsers.forEach((u, i) => doc.text(`${i + 1}. @${u.username} (${u.count})`));
  doc.moveDown();
  doc.text('AI-анализ:');
  Object.entries(data.spamStats).forEach(([cat, val]) => doc.text(`${cat}: ${val}%`));
  doc.end();
  return filePath;
}

export async function buildReportExcel(data: { stats: any[], topUsers: any[], spamStats: any }): Promise<string> {
  const filePath = path.join(__dirname, '../../report.xlsx');
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Stats');
  ws.addRow(['Дата', 'Сообщения', 'Новые', 'Баны']);
  data.stats.forEach(s => ws.addRow([s.date, s.messages, s.new_users, s.bans]));
  const ws2 = wb.addWorksheet('TopUsers');
  ws2.addRow(['Username', 'Count']);
  data.topUsers.forEach(u => ws2.addRow([u.username, u.count]));
  const ws3 = wb.addWorksheet('SpamStats');
  ws3.addRow(['Категория', 'Процент']);
  Object.entries(data.spamStats).forEach(([cat, val]) => ws3.addRow([cat, val]));
  await wb.xlsx.writeFile(filePath);
  return filePath;
} 