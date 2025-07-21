import crypto from 'crypto';

export function verifyTelegramAuth(data: any, botToken: string) {
  const authData = { ...data };
  const hash = authData.hash;
  delete authData.hash;
  const dataCheckString = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return hmac === hash;
} 