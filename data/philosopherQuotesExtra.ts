import type { PhilosopherQuote } from './philosophers';

// Additional AUTHENTIC quotes for well-known thinkers — sourced and then
// adversarially fact-checked (a two-pass pipeline) so nothing fabricated or
// misattributed slips in. Merged onto each philosopher's `quotes` array in
// philosophers.ts, so they flow to the profile sheet, the quote book, the
// daily-quote pool, and everywhere else automatically.
//
// Ids use an `-x` suffix (e.g. `socrates-x1`) so they can never collide with
// the base `-1..-n` ids. Thinkers not listed here keep just their base quotes.
export const PHILOSOPHER_QUOTES_EXTRA: Record<string, PhilosopherQuote[]> = {
  // Populated by the verified expansion pass.
};
