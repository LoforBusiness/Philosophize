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
// THE GILT — the one colour in a black-and-white app, and where it may go.
//
// §19 bends the strict B&W identity exactly once, for desaturated photographs,
// and says why: nothing may take its contrast from artwork. This is the second
// bend, and it is deliberate rather than a drift.
//
// WHY A STREAK EARNS ONE. A streak's entire job is to say ALIVE or ABOUT TO DIE,
// at a glance, from across a room, before the reader has decided whether to open
// the app. In ink that distinction can only be carried by tone — a fuller disc, a
// heavier ring — and tone reads as "more of the same thing", not as a state
// change. Duolingo's streak works substantially because the flame is coloured and
// a dead one is grey, and that is the specific mechanism being borrowed.
//
// WHERE IT MAY APPEAR, and nowhere else:
//   · the streak mark, when the streak is alive
//   · a completed day in the streak calendar
//   · the count-up on the reward screen
//   · the habit panel, on Home and on Profile
//
// It may NOT appear on: lesson art, badges, ranks, buttons, the paywall, or any
// other counter. One colour used in one place is a signal. The same colour used
// in six places is a theme, and then it signals nothing.
//
// ── TWICE NOW THE HUE HAS BEEN THE COMPLAINT, AND THE THIRD ONE IS RESEARCHED ─
//
// FIRST IT WAS AN EMBER, AND AN EMBER IS A SEASON. `#B4541E` on cream, every
// contrast floor cleared, and the reader said what a burnt orange on cream
// actually looks like: *"it just looks like it is fall or it's Halloween … the
// orange just looks like a festive colour."* Measured afterwards, they were
// describing something real: L* 47 C* 59 h 53 is the LOUDEST warm value in the
// whole app — above CRIMSON, above AURUM — sitting at the most autumnal hue
// there is.
//
// THEN IT WAS A VERDIGRIS, AND A VERDIGRIS READS AS BLUE. `#068177`, chosen
// because a gilt is proof of time served where an ember is something you are
// about to lose. The metaphor was right and the colour was not: *"the blue look
// kidish, and not very good. The color just looks to strange."* Its on-ink twin
// was the real offender — `#2BACB0` sits at **hue 200**, which is not teal any
// more, and it was the brightest thing on Home's dark panel. It also collided:
// ΔE 9 from the EASTERN era's jade, in an app that already owns four blue-greens.
//
// ── WHAT THE CATEGORY ACTUALLY DOES, LOOKED UP RATHER THAN GUESSED ──────────
//
// Every streak worth copying is WARM, and a dead one is grey. Duolingo's flame
// is `#FF9600` and its whole documented mechanism is that a lost streak turns
// grey — the colour IS the state. Brilliant's brand refresh puts streaks on a
// warm "pear" spectrum. Snapchat's is a fire. Not one of them is cool, and the
// one this app shipped was the outlier.
//
// So the third answer goes back to warm, and the interesting part is which warm.
//
// ── THE HIGH-CHROMA WARM BAND *IS* THE REJECTED EMBER ───────────────────────
//
// This is the finding that decided it, and it is not obvious. Searching the gold
// band the way the last two searches were run — maximise chroma at the contrast
// floor — returns h60 C54, which measures **ΔE 8 from `#B4541E`**. That is not a
// new answer, it is the Halloween colour with a different name. Anything at
// h50–65 above C* 48 is the same trap.
//
// The escape is the axis neither previous search moved: **chroma DOWN**. Every
// committed colour in this app sits at C* 33–59, so C* 36 in the gold band is
// genuinely unoccupied ground — and low chroma is what "premium" has meant on
// every other surface here (the certificates, the quote plates, the rank pins
// all carry their colour in edges and shading, never in a flood).
//
// ── SO IT IS GILT: TARNISHED GILDING, NOT A PAINT ───────────────────────────
//
// L* 48, C* 38, hue 76. The warmth the category asks for, at the loudness this
// app's own materials are cut to, and it lands where the app already knows how
// to draw: a struck disc with a lit corner and a shaded one is a COIN, and a run
// of days you have earned is a row of them. That is why the object survives at
// 26px on a calendar where a flat dot did not.
//
// It is also the only candidate that works on BOTH grounds, which turned out to
// be the binding constraint rather than a nicety. Home's panel is near-black and
// Profile's is cream, so the pair has to be legible on each — and a red walked
// bright enough for 4.5:1 on ink becomes PINK (measured: every candidate at
// h16–h42 did), while a teal walked bright enough becomes CYAN, which is exactly
// what shipped. Gold is the one hue that is rich on cream and still gold on
// black. Gold leaf on a dark ground is not a coincidence.
//
// SEPARATIONS, all re-derived by `npm run check:streak`:
//   ΔE 28.5 from the rejected ember   — a different answer, not a re-run
//   ΔE 33.7 from SLATE                — alive vs lapsed, floor 20
//   ΔE 15.2 from AURUM, 15.9 from BRONZE — the two rank metals it could meet on
//                                        Profile, at design.ts's own ΔE 15 floor
export const GILT = '#926B33';       // 4.59:1 on paper — safe for the number
export const GILT_DEEP = '#7C5820';  // 6.13:1 on paper, carries cream at 5.69:1
export const GILT_SOFT = '#E9E3D8';  // wash only; ink on it is 13.63:1
/** The gilt on a DARK ground — Home's habit panel. 5.85:1 on ink. */
export const GILT_LIT = '#B98E54';

/**
 * A lapsed streak is not a duller gilt, it is bare SLATE — cool, flat, dead.
 *
 * The value is unchanged from when this was called ASH, and it still passes: a
 * warm grey is what an unkept bronze looks like as much as what a cold fire
 * does. The name moved with the metaphor, because a file carrying `GILT` and
 * `ASH` side by side is two stories about one pair, and design.ts already
 * records what that costs ("two names for one grey, so nothing could tell you
 * whether a difference was meant").
 *
 * #B8B5AC was the first choice and it FAILED at 1.96:1. The mistake is worth
 * keeping written down because it is the natural one: a dead thing feels pale,
 * so a pale grey feels right, and a pale grey cannot carry the number it is
 * supposed to be colouring. A lapsed streak still has to say what it lapsed
 * FROM; that is the number the reader needs most.
 */
export const SLATE = '#6E6C64';       // 5.03:1 on paper
/**
 * And slate on a dark ground. 5.60:1 on ink, and ΔE 35.7 from `GILT_LIT` — the
 * pair has to stay tellable apart in BOTH printings or the panel that inverts
 * loses the only state it exists to report.
 *
 * THE SEPARATION IS SMALLER THAN THE EMBER'S WAS (56.2 → 32.1 on paper) and that
 * is arithmetic, not a regression: a teal and a warm grey are genuinely nearer
 * in Lab than an orange and a warm grey, because orange sits on the opposite
 * side of neutral from both. The floor this has to clear is 20, and the state is
 * still carried by hue rather than by lightness — 2.8 L apart, which is the
 * property that actually matters and the one the check measures.
 */
export const SLATE_LIT = '#95928A';

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
