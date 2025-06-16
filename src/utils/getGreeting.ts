export type DayPhase = 'morning' | 'afternoon' | 'evening';

export function getDayPhase(date: Date = new Date()): DayPhase {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export function getGreeting(
  opts: { firstName?: string; farmName?: string; tempC?: number; conditionSymbol?: string } = {},
  date: Date = new Date(),
  locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
) {
  const phase = getDayPhase(date);
  const namePart = opts.firstName ? `, ${opts.firstName}` : '';
  const farmPart = opts.farmName ? ` at ${opts.farmName}` : '';
  const weatherPart =
    typeof opts.tempC === 'number' && opts.conditionSymbol
      ? ` – ${opts.tempC.toFixed(0)}°C, ${opts.conditionSymbol}`
      : '';
  const icon = phase === 'morning' ? '🌅' : phase === 'afternoon' ? '🌞' : '🌙';
  return `${icon} Good ${phase}${namePart}${farmPart}${weatherPart}`;
}
