// Single source of truth for rest days ("streak freezes").
//
// A rest day is spent automatically to cover a missed calendar day, so a streak
// survives one ordinary bad day instead of resetting to 1. It is the moment
// readers quit, and the cheapest place to stop them quitting.
//
// WHY TWO MONOTONIC COUNTERS AND NOT A "REMAINING" ONE. The cloud snapshot
// merges by taking the larger of two numbers wherever progress is involved
// (lib/supabase/sync.ts), because that is the only merge that can never lose
// progress. A single `restDaysRemaining` field would therefore REFILL itself:
// spend your last rest day on the phone, open the tablet that still says 2, and
// max(0, 2) hands it back. Storing `earned` and `used` separately makes max the
// correct merge in BOTH directions — the higher earn count is the true one, and
// so is the higher spend count — and `held` is derived, never stored.
export const REST_EARN_EVERY_FREE = 10; // one rest day per N-day streak
export const REST_EARN_EVERY_PRO = 5;

export const REST_CAP_FREE = 2; // most rest days that can be held at once
export const REST_CAP_PRO = 5;

export function restEarnEvery(isPro: boolean): number {
  return isPro ? REST_EARN_EVERY_PRO : REST_EARN_EVERY_FREE;
}

export function restCap(isPro: boolean): number {
  return isPro ? REST_CAP_PRO : REST_CAP_FREE;
}

/**
 * Rest days available to spend right now.
 *
 * Derived rather than stored, and clamped at 0 because a merge can legitimately
 * produce a `used` higher than this device's `earned` (the other device both
 * earned and spent one before syncing).
 */
export function restDaysHeld(earned: number, used: number): number {
  return Math.max(0, earned - used);
}

// ═════════════════════════════════════════════════════════════════════════════
// THE EMBER — the one colour in a black-and-white app, and where it may go.
//
// §19 bends the strict B&W identity exactly once, for desaturated photographs,
// and says why: nothing may take its contrast from artwork. This is the second
// bend, and it is deliberate rather than a drift.
//
// WHY A STREAK EARNS ONE. A streak's entire job is to say ALIVE or ABOUT TO DIE,
// at a glance, from across a room, before the reader has decided whether to open
// the app. In ink that distinction can only be carried by tone — a fuller disc, a
// heavier ring — and tone reads as "more of the same thing", not as a state
// change. Duolingo's streak works substantially because the flame is orange and
// a dead one is grey, and that is the specific mechanism being borrowed.
//
// WHERE IT MAY APPEAR, and nowhere else:
//   · the streak flame, when the streak is alive
//   · a completed day in the streak calendar
//   · the count-up and ignite on the reward screen
//   · THE HABIT PANEL, on Home and on Profile — added deliberately, see below
//
// It may NOT appear on: lesson art, badges, ranks, buttons, the paywall, or any
// other counter. One colour used in one place is a signal. The same colour used
// in six places is a theme, and then it signals nothing.
//
// ── WHY THE HABIT PANEL WAS ADDED TO THAT LIST ──────────────────────────────
//
// The list above was written when the flame lived in Home's header, and it went
// stale the day the flame came out of the header and the habit card took over.
// The result was that the two screens a reader actually looks at — Home's streak
// panel and Profile's — drew the streak in flat ink and cream, while the app
// carried a measured ember whose stated purpose is to say ALIVE or ABOUT TO DIE
// "before the reader has decided whether to open the app". The one colour in the
// app existed for exactly this object and was not on it.
//
// It is still one signal in one place: the streak, wherever the streak is drawn.
//
// ── AND A COLOUR MEASURED ON ONE GROUND DOES NOT SURVIVE ANOTHER ────────────
//
// Home's panel is printed on INK, and every value below was fitted against
// paper. `EMBER` measures 3.50:1 on ink and `ASH` 3.31:1 — both under the 4.5:1
// floor for the number they are supposed to be colouring. That is the same
// finding tone.ts records for the era plates ("all five clear 4.5:1 on paper by
// construction, but the byline sits in the plate's SHADED corner"), and the same
// reason constants/design.ts carries `paperSoft` and `dim` as separate tokens
// from `inkSoft`: a dark ground needs its own secondary values, not a borrowed
// one.
//
// So there are two of each, and `npm run check:streak` measures both pairs.
//
// THE VALUES ARE MEASURED, not picked, and `npm run check:streak` re-derives
// every one of them so this comment cannot drift into fiction.
export const EMBER = '#B4541E';       // 4.75:1 on paper — safe for the number
export const EMBER_DEEP = '#8A3F16';  // 7.16:1 on paper, carries cream at 6.64:1
export const EMBER_SOFT = '#F0DCCB';  // wash only; ink on it is 13.10:1
/** The ember on a DARK ground — Home's habit panel. 5.46:1 on ink. */
export const EMBER_LIT = '#DC7434';

/**
 * A lapsed streak is not a dimmer ember, it is ash — cool, flat, obviously off.
 *
 * #B8B5AC was the first choice and it FAILED at 1.96:1. The mistake is worth
 * keeping written down because it is the natural one: ash is a pale, dead thing,
 * so a pale grey feels right, and a pale grey cannot carry the number it is
 * supposed to be colouring. A lapsed streak still has to say what it lapsed
 * FROM; that is the number the reader needs most. Cool and DARK is the honest
 * reading of "burnt out" anyway.
 */
export const ASH = '#6E6C64';         // 5.03:1 on paper
/**
 * And ash on a dark ground. 5.60:1 on ink, and ΔE 59.6 from `EMBER_LIT` — the
 * pair has to stay tellable apart in BOTH printings or the panel that inverts
 * loses the only state it exists to report.
 */
export const ASH_LIT = '#95928A';

/**
 * Milestones the calendar marks and the reward screen celebrates.
 *
 * Kept short on purpose. A landmark every week stops being a landmark; these are
 * the four a reader actually says out loud.
 */
export const STREAK_MILESTONES = [7, 30, 100, 365] as const;

/** The next milestone above `n`, or null once they are all behind you. */
export function nextMilestone(n: number): number | null {
  return STREAK_MILESTONES.find((m) => m > n) ?? null;
}

// ═════════════════════════════════════════════════════════════════════════════
// THE SOCIETY — what a long streak makes you, as opposed to what it counts.
//
// A number going up is not an identity. Duolingo's "Streak Society" works because
// at 365 days you stop being someone with a big number and start being a MEMBER of
// something, and the app says so out loud. This is that, in this app's own terms.
//
// WHY THESE NAMES AND NOT RANK NAMES. `data/ranks.ts` already has 25 tiers from
// Novice to Grand Philosopher, and those are earned with XP — they say how much you
// have LEARNED. These say how faithfully you have shown up, which is a different
// virtue and deserves different words. Every one is a real school or discipline
// whose defining trait is the habit itself:
//
//   Peripatetic  Aristotle's school, named for the covered walk its members paced
//                while arguing. It means, literally, "given to walking" — which is
//                also what the mascot does, so the first tier a reader reaches is
//                named after the thing they have been watching all along.
//   Stoic        the discipline of turning up whether or not you feel like it.
//   Ascetic      practice sustained past the point where it is still novel.
//   Immovable    Aristotle's unmoved mover, the thing that causes motion in
//                everything else without itself being moved. A year without a
//                missed day has earned the joke.
//
// THE THRESHOLDS ARE STREAK_MILESTONES, deliberately, and not a second ladder
// beside them. Two sets of landmarks in one feature means the reward screen
// celebrates one thing and the streak screen celebrates another.
export interface StreakTier {
  /** Streak length at which this tier is conferred. */
  at: number;
  name: string;
  /** One line, shown under the name. Not a slogan — a description of the reader. */
  blurb: string;
}

export const STREAK_TIERS: readonly StreakTier[] = [
  { at: 7, name: 'Peripatetic', blurb: 'A week of showing up. You walk while you think.' },
  { at: 30, name: 'Stoic', blurb: 'A month. You come whether or not you feel like it.' },
  { at: 100, name: 'Ascetic', blurb: 'A hundred days. It stopped being novel long ago.' },
  { at: 365, name: 'Immovable', blurb: 'A year unbroken. Nothing moves you. You move everything else.' },
] as const;

/** The tier a streak of `n` days has earned, or null below the first one. */
export function tierFor(n: number): StreakTier | null {
  let out: StreakTier | null = null;
  for (const t of STREAK_TIERS) if (n >= t.at) out = t;
  return out;
}

/** The next tier to reach, or null once they are all behind you. */
export function nextTier(n: number): StreakTier | null {
  return STREAK_TIERS.find((t) => t.at > n) ?? null;
}
