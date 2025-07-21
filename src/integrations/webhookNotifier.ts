import axios from 'axios';
import { config } from '../config';

interface NotifyEventParams {
  type: 'ban' | 'mute' | 'spam' | 'custom';
  user: { id: number; username?: string };
  reason: string;
  link?: string;
}

function formatMessage({ type, user, reason, link }: NotifyEventParams) {
  let emoji = '';
  if (type === 'ban') emoji = '🚫';
  if (type === 'mute') emoji = '🔇';
  if (type === 'spam') emoji = '🛑';
  let text = `${emoji} *${type.toUpperCase()}*
User: @${user.username || user.id}
Reason: ${reason}`;
  if (link) text += `\n[Подробнее](${link})`;
  return text;
}

export async function notifyEvent(params: NotifyEventParams) {
  const text = formatMessage(params);
  if (config.SLACK_WEBHOOK_URL) {
    await axios.post(config.SLACK_WEBHOOK_URL, { text });
  }
  if (config.DISCORD_WEBHOOK_URL) {
    await axios.post(config.DISCORD_WEBHOOK_URL, { content: text });
  }
} 