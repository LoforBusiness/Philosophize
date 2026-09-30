import type { GlyphName } from '@/components/shared/Glyph';
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
// THE STREAK'S COLOUR — royal purple, and where it may go.
//
// §19 bends the strict B&W identity exactly once, for desaturated photographs,
// and says why: nothing may take its contrast from artwork. The streak is the
// second bend, and it is deliberate rather than a drift.
//
// WHY A STREAK EARNS ONE. A streak's entire job is to say ALIVE or ABOUT TO DIE,
// at a glance, from across a room, before the reader has decided whether to open
// the app. In ink that distinction can only be carried by tone — a fuller disc, a
// heavier ring — and tone reads as "more of the same thing", not as a state
// change. Duolingo's streak works substantially because the flame is coloured and
// a dead one is grey, and that is the specific mechanism being borrowed.
//
// WHERE IT APPEARS:
//   · the streak mark, when the streak is alive
//   · a completed day in the streak calendar
//   · the count-up on the reward screen
//   · the habit panel, on Home and on Profile
//
// ── FIVE HUES, AND THE FIFTH IS WHERE THE RESEARCH POINTED ALL ALONG ───────
//
// An EMBER (`#B4541E`) read as Halloween. A VERDIGRIS (`#068177`) read as blue,
// "kidish". A GILT (`#926B33`, tarnished gilding) was chosen from what the
// streaks worth copying do, which is to be WARM — Duolingo's flame is `#FF9600`,
// a lapsed one turns grey, and the colour IS the state. Then on 2026-09-15 the
// owner replaced every gold in the app ("the gold looks pretty AI") with a ROYAL
// PURPLE, and this note recorded, in as many words, that a cool streak "goes
// against that research, and it is the owner's call."
//
// LATER THE SAME DAY THEY REPLACED THE PURPLE TOO, with a sheet of six, and one
// of the six is `#D35E36` — a warm orange. So the streak is warm again, not
// because the note argued it back but because the palette the owner picked has
// exactly one loud colour in it and that colour is the one every streak worth
// copying uses. It lives in components/shared/tone.ts as EMBER.
//
// IT IS THE DEEPENED EMBER THAT SHIPS HERE, not the swatch. The raw spark is
// 3.70:1 on paper — over the 3:1 a MARK needs, under the 4.5:1 a WORD needs, and
// the streak's whole job is to colour a NUMBER. `EMBER_INK` is the smallest
// deepening that clears the text floor; at half that it measures 4.29 and fails.
// This is the same trap the first ember fell into from the other side, and it is
// why the value here is not simply the swatch.
//
// WHAT check:streak HOLDS, restated for the new pair: alive against lapsed is a
// real difference of colour (ΔE 49.8 from SLATE on paper, 40.0 on ink), and the
// spark stays tellable from the rank metals it can actually meet on Profile —
// BRONZE at ΔE 18.8 is the close one, AURUM 42.5, SILVER 55.3.
//
// THE FLOOR THAT WAS DELETED, AND WHY. The old check asserted ΔE ≥ 105 from the
// rejected `#B4541E`, which encoded "never go back to the Halloween orange". The
// streak is now deliberately a warm orange, so that assertion measured the wrong
// thing and would fail a colour the owner chose. Distance from SLATE is what the
// research was ever actually about; that one stays.
//
// THE HEX VALUES BELOW ARE COPIES, AND THAT IS FORCED. check:streak loads this
// file in plain Node, which cannot follow an import, so the four are written out
// here and the check re-derives each one from tone.ts and fails on any drift.
export const STREAK_EMBER = '#B25231'; // EMBER_INK. 4.85:1 on paper
export const STREAK_DEEP = '#803F29';  // the spark in shadow, for a struck end
// THE WASH WAS SAND UNTIL 2026-09-16. The owner asked for the gold look to go
// from every surface it was on, and a sand chip behind "5 DAYS PERFECT" or under
// a rested day was exactly that. It is the palette's neutral FLOOR now: the
// ember is what makes the streak warm, and it does not need a beige behind it.
export const STREAK_WASH = '#F2F2EF';  // FLOOR. A wash; ink on it is 15.52:1
/** The spark on a DARK ground — Home's habit panel. EMBER_LIT, 6.41:1 on ink. */
export const STREAK_ON_INK = '#DD8768';

/**
 * A lapsed streak is not a duller spark, it is bare SLATE — cool, flat, dead.
 *
 * #B8B5AC was the first choice and it FAILED at 1.96:1. The mistake is worth
 * keeping written down because it is the natural one: a dead thing feels pale,
 * so a pale grey feels right, and a pale grey cannot carry the number it is
 * supposed to be colouring. A lapsed streak still has to say what it lapsed
 * FROM; that is the number the reader needs most.
 */
export const SLATE = '#6E6C64';       // 5.03:1 on paper
/**
 * And slate on a dark ground. 5.60:1 on ink, and ΔE 33.1 from `STREAK_ON_INK` —
 * the pair has to stay tellable apart in BOTH printings or the panel that inverts
 * loses the only state it exists to report.
 */
export const SLATE_LIT = '#95928A';

/**
 * Milestones the calendar marks and the reward screen celebrates.
 *
 * THEY ARE THE SOCIETIES' THRESHOLDS, and there are ten of them since
 * 2026-09-29. It was four (a week, a month, a hundred days, a year) on the
 * reasoning that a landmark every week stops being a landmark. The owner asked
 * for ten societies, and the rule below — one ladder, not two — means each one
 * has to be a day the reward screen marks. The gaps widen as the run grows, so
 * the early ones come quickly and the late ones stay rare.
 */
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 75, 100, 150, 250, 365] as const;

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
// WHY THESE NAMES AND NOT RANK NAMES. `data/ranks.ts` has the XP ladder, and
// those say how much you have LEARNED. These say how faithfully you have shown
// up, which is a different virtue and deserves different words.
//
// A SCHOLAR'S CLUB, NOT A PHILOSOPHY SCHOOL (2026-09-29). The first four were
// Peripatetic, Stoic, Ascetic and Immovable — real schools of philosophy, which
// was apt while the app taught nothing else and stopped being apt the day
// Economics arrived. The owner chose the scholar's-club set from three and asked
// for ten tiers topping out at a year. The names climb in standing, from someone
// who has just arrived to someone who keeps the place, and not one of them names
// a subject. (It also retires a collision: Peripatetic was rank 23 as well.)
//
// Each carries a glyph, so a society is an EMBLEM on the streak screen and not
// only a word — the same reason every rank and badge is a struck mark.
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
  /** Its emblem, from components/shared/Glyph. */
  glyph: GlyphName;
}

export const STREAK_TIERS: readonly StreakTier[] = [
  { at: 3, name: 'The Newcomers', glyph: 'seed', blurb: 'Three days running. You found the door and came back through it.' },
  { at: 7, name: 'The Regulars', glyph: 'candle', blurb: 'A week of showing up. They know your face here now.' },
  { at: 14, name: 'The Studious', glyph: 'book', blurb: 'Two weeks. Learning something is part of your day.' },
  { at: 30, name: 'The Devoted', glyph: 'lamp', blurb: 'A month. You come whether or not you feel like it.' },
  { at: 50, name: 'The Diligent', glyph: 'quill', blurb: 'Fifty days. The habit holds on the days you would rather skip.' },
  { at: 75, name: 'The Learned', glyph: 'scroll', blurb: 'Seventy-five days. It stopped being new a long time ago.' },
  { at: 100, name: 'The Scholars', glyph: 'cap', blurb: 'A hundred days. Very few readers get this far.' },
  { at: 150, name: 'The Fellows', glyph: 'key', blurb: 'A hundred and fifty days. You have a key to the reading room.' },
  { at: 250, name: 'The Luminaries', glyph: 'star', blurb: 'Two hundred and fifty days. Others steer by the example.' },
  { at: 365, name: 'The Keepers', glyph: 'torch', blurb: 'A year unbroken. You keep the lamp lit for everyone else.' },
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
