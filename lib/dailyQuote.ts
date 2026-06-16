import { ALL_PHILOSOPHERS } from '@/data/philosophers';

// One philosophical quote per calendar day. Deterministic (stable for the whole
// day, the same on every screen) and pulled from the full philosopher canon.
// Used by the Daily Quote Widget.

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  philosopherId: string;
  branchSlugs: string[];
}

const POOL: DailyQuote[] = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({
    id: q.id,
    text: q.text,
    author: p.name,
    philosopherId: p.id,
    branchSlugs: p.branchSlugs,
  }))
);

/** Whole days since the Unix epoch — the rotation key. */
export function dayNumber(): number {
  return Math.floor(Date.now() / 86_400_000);
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** A short label for today, e.g. "JUN 6". */
export function todayLabel(): string {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Today's quote. A prime stride scatters the pick across the pool so
 * consecutive days feel varied (and differ from the home "Daily Reflection",
 * which steps through the pool sequentially).
 */
export function getDailyQuote(): DailyQuote {
  const len = POOL.length || 1;
  const idx = ((dayNumber() * 7919) % len + len) % len;
  return POOL[idx];
}

export function quotePoolSize(): number {
  return POOL.length;
}

// ─── Home-screen widget rotation ─────────────────────────────────────────────
// The Android home-screen widget shows a different quote every 3 hours. It's
// computed from the current time bucket (not stored), so the widget's headless
// task can recompute it on each OS update without the app running.
const ROTATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export function rotationBucket(now: number = Date.now()): number {
  return Math.floor(now / ROTATION_MS);
}

/** The quote for the current 3-hour window. A prime stride scatters picks. */
export function getRotatingQuote(now: number = Date.now()): DailyQuote {
  const len = POOL.length || 1;
  const idx = ((rotationBucket(now) * 7919) % len + len) % len;
  return POOL[idx];
}
