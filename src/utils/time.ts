export function parseDuration(str: string): number {
  // Пример: '10m' => 600
  const match = str.match(/(\d+)([smhd])/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return value / 60;
    case 'm': return value;
    case 'h': return value * 60;
    case 'd': return value * 60 * 24;
    default: return 0;
  }
} 