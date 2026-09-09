const DAY_MS = 86_400_000;

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const isFriday = (d: Date): boolean => d.getDay() === 5;

/** ISO 8601 week number (weeks start Monday, week 1 contains Jan 4th). */
export function weekNum(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); // shift to Thursday of this week
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - yearStart) / DAY_MS + 1) / 7);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2025-03-28" */
export const isoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "Friday, March 28th 2025" */
export function longDate(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${month} ${ordinal(d.getDate())} ${d.getFullYear()}`;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return n + (["th", "st", "nd", "rd"][n % 10] ?? "th");
}

export function isEndOfMonthFriday(d: Date): boolean {
  return isFriday(d) && addDays(d, 7).getMonth() !== d.getMonth();
}

export function isEndOfQuarterFriday(d: Date): boolean {
  const quarter = (x: Date) => x.getFullYear() * 4 + Math.floor(x.getMonth() / 3);
  return isFriday(d) && quarter(addDays(d, 7)) !== quarter(d);
}

/** The last Friday on or before December `cutOffDay` — the final working Friday before the holiday break. */
export function isVacationFriday(d: Date, cutOffDay: number): boolean {
  if (!isFriday(d) || d.getMonth() !== 11) return false;
  const cutOff = new Date(d.getFullYear(), 11, cutOffDay);
  const diff = (cutOff.getTime() - startOfDay(d).getTime()) / DAY_MS;
  return diff >= 0 && diff < 7;
}
