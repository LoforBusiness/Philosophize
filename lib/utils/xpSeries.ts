import type { XpEvent } from '@/stores/userDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// TURNING THE XP LOG INTO A SERIES YOU CAN DRAW.
//
// `xpEvents` is a running log of CUMULATIVE totals — `{ t, v }` where v is the
// XP after that event — which is the right shape for the rank climb, and the
// wrong shape for "how much did I do each day". The difference between
// consecutive entries is a day's earning; that is all this does, plus the two
// things that are easy to get wrong:
//
//   1. DAYS WITH NOTHING IN THEM STILL EXIST. A log only records earning, so a
//      week off leaves no entries at all. Bucketing by index rather than by date
//      would draw four busy days in a row where there were four busy days spread
//      over a fortnight, which is a graph that lies about a habit.
//   2. THE FIRST EVENT IS A TOTAL, NOT A GAIN. Diffing from zero would credit
//      every point of XP the reader has ever earned to whichever day happens to
//      sit at the start of the window.
// ─────────────────────────────────────────────────────────────────────────────

const DAY = 86_400_000;

/** Local midnight for a timestamp — buckets have to follow the reader's day. */
function dayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * XP earned on each of the last `days` days, oldest first, including the days
 * where nothing happened.
 */
export function dailyXP(events: XpEvent[] | undefined, days: number, nowMs: number): number[] {
  const out = new Array(days).fill(0);
  const log = (events ?? []).filter((e) => e && Number.isFinite(e.t) && Number.isFinite(e.v));
  if (log.length < 2) return out;

  const today = dayStart(nowMs);
  const first = today - (days - 1) * DAY;

  for (let i = 1; i < log.length; i++) {
    const gain = log[i].v - log[i - 1].v;
    if (gain <= 0) continue;                       // a toggle that netted nothing
    const bucket = Math.round((dayStart(log[i].t) - first) / DAY);
    if (bucket >= 0 && bucket < days) out[bucket] += gain;
  }
  return out;
}

/**
 * The same window as a count of DISTINCT ACTIVE DAYS, which is the honest thing
 * to put under a lesson count: a reader who did six lessons on one Sunday and a
 * reader who did one on each of six days have the same total and completely
 * different habits, and the bar chart should show that difference.
 */
export function activeDays(series: number[]): number {
  return series.filter((v) => v > 0).length;
}
