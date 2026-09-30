// HOW WIDELY A READER HAS READ — the SUBJECTS badges (data/badges.ts), 2026-09-30.
//
// ZERO IMPORTS, like rig.ts and tone.ts, so scripts/validate-badges.mjs can load this
// file in plain Node and run the arithmetic itself rather than trusting a reading of it.
// The store hands in what it already knows: which subjects have a lesson finished, and
// the last day a lesson was finished in each.

/** 'YYYY-MM-DD' → a whole day number, or null for anything that is not a date key. */
function dayNumber(key: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  return Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
}

/**
 * How many subjects' LAST lesson falls within the seven days ending on the latest
 * one. A badge is only ever awarded at the moment a lesson lands, and at that moment
 * the latest day is today — so this is "subjects read in the past week", counted
 * without reading a clock, which keeps it pure and makes the reward screen's preview
 * agree with the store to the day.
 */
export function subjectsInWeek(subjectDays: Record<string, string> | undefined): number {
  const days = Object.values(subjectDays ?? {})
    .map(dayNumber)
    .filter((d): d is number => d != null);
  if (!days.length) return 0;
  const latest = Math.max(...days);
  return days.filter((d) => latest - d <= 6).length;
}

/** The later of two day keys; a missing or malformed one loses. */
export function laterDay(a: string | undefined, b: string | undefined): string | undefined {
  const na = a ? dayNumber(a) : null;
  const nb = b ? dayNumber(b) : null;
  if (na == null) return nb == null ? undefined : b;
  if (nb == null) return a;
  return nb > na ? b : a;
}

/** Two devices' last days, merged per subject to the later one. */
export function mergeSubjectDays(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) {
    const d = laterDay(a?.[k], b?.[k]);
    if (d) out[k] = d;
  }
  return out;
}
