import { google } from 'googleapis';
import { config } from '../config';

export async function syncUsersToSheet(users: Array<{ id: number, username: string, role: string, warnings: number }>) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const values = [
    ['id', 'username', 'role', 'warnings'],
    ...users.map(u => [u.id, u.username, u.role, u.warnings])
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.GOOGLE_SHEET_ID,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });
} 