import type { GlyphName } from '@/components/shared/Glyph';

// ─────────────────────────────────────────────────────────────────────────────
// FIFTY BADGES.
//
// THE IDS ARE FROZEN. They are persisted in `userDataStore.earnedBadges` and
// synced into the Supabase `user_state` snapshot, and the merge on sign-in is a
// UNION of local and remote ids. So renaming one does not rename anything — it
// invents a badge nobody has and abandons one everybody holds, and every
// existing reader gets the new id popped at them on their next lesson as if
// they had just earned it. Change `name`, `caption`, `glyph`, `family`, `tier`
// and the criterion freely. Never the id.
//
// WHY THE NAMES CHANGED. They used to be named after their own ICON — "Half
// Circle" for eight saved quotes, "Oval Seeker" for eight thinkers met, "Star of
// David" for 15,000 XP. A name that describes the picture tells the reader
// nothing about what they did, which is why fifty of them felt like one badge
// printed fifty times. Every name here is an allusion to the DEED, and the
// caption is there to let the reader in on it — a badge that teaches you what a
// florilegium was is worth more than a badge that tells you a shape.
//
// ONE COUNT, NOT TWO. A badge declares `goal(stats)` (what you have) and `need`
// (what it takes), and `isEarned` is derived from those. There is deliberately
// no separate `earned` predicate: with two expressions of one rule, a badge can
// show a full progress bar and still read as locked, and that bug is invisible
// until someone is staring at it. Everything the set asks for is a count, so one
// pair covers all fifty.
// ─────────────────────────────────────────────────────────────────────────────

/** Which SHAPE the medal is struck in. Six families, six silhouettes. */
export type BadgeFamily = 'lessons' | 'streak' | 'thinkers' | 'quotes' | 'xp' | 'mastery';

/**
 * WHAT THE MEDAL IS STRUCK IN — five tiers, iron → bronze → jade → crimson →
 * aurum, taken from the rank ladder's own orders (constants/insignia.ts).
 *
 * Three was too few for a case a reader works through over months, and the two
 * that were added are the two they asked for by name.
 */
export type BadgeTier = 1 | 2 | 3 | 4 | 5;

// Snapshot of the user's progress used to decide which badges are earned.
export interface ProgressStats {
  totalXP: number;
  lessons: number;
  quotes: number;
  philosophers: number;      // distinct philosophers viewed
  streak: number;
  mastery: Record<string, number>; // branch slug -> percent (0–100)
  // ── Added when the set was rebalanced. Fourteen of the fifty used to be bare
  // XP thresholds, which is one deed wearing fourteen hats. Everything below is
  // already recorded by the store; none of it needed a new persisted key.
  quizAces: number;          // thinkers whose quiz has been aced at least once
  eras: number;              // distinct era groups among thinkers met (0–5)
  quoteBranches: number;     // distinct branches represented in saved quotes (0–6)
  branchesTouched: number;   // branches with at least one lesson done
  branchesHalf: number;      // branches at 50% or more
  unitsComplete: number;     // units finished end to end
  // ── added when the case was rebalanced for difficulty ─────────────────────
  // All four are derived in `progressStats` from state the store already keeps,
  // so every existing reader is measured against them correctly on the first
  // launch instead of starting at zero.
  branchesComplete: number;  // branches at 100%
  /**
   * TOTAL days practised, not consecutive ones.
   *
   * The deep end of this case used to hang on `streak`, and a streak is a bad
   * thing to gate a long badge behind: one missed Tuesday puts a 200-day
   * condition seven months out of reach, and the badge stops being an ambition
   * and becomes a punishment. This only ever goes up.
   */
  daysPractised: number;
  quoteAuthors: number;      // distinct thinkers represented in saved quotes
  rank: number;              // the rank INDEX held (0-based), for the order badges
}

export interface BadgeDef {
  /** FROZEN. See the header. */
  id: string;
  name: string;
  /** The wink, one line. Says what the name is referring to. */
  caption: string;
  glyph: GlyphName;
  family: BadgeFamily;
  tier: BadgeTier;
  /** What the reader has, in the badge's own units. */
  goal: (s: ProgressStats) => number;
  /** What it takes. */
  need: number;
  /** Plural noun for the progress line: "8 / 12 thinkers". '%' renders bare. */
  unit: string;
}

export const isEarned = (b: BadgeDef, s: ProgressStats) => b.goal(s) >= b.need;

/** 0..1, for the bar under a locked badge. */
export const badgeProgress = (b: BadgeDef, s: ProgressStats) =>
  Math.max(0, Math.min(1, b.need <= 0 ? 1 : b.goal(s) / b.need));

/** "8 / 12 thinkers" — or "18% / 25%" for the mastery badges. */
export function badgeProgressLabel(b: BadgeDef, s: ProgressStats) {
  const have = Math.min(b.goal(s), b.need);
  return b.unit === '%'
    ? `${have}% / ${b.need}%`
    : `${have.toLocaleString()} / ${b.need.toLocaleString()} ${b.unit}`;
}

/** What the badge asks of you, as a sentence. Used on the detail card. */
export function badgeCriterion(b: BadgeDef) {
  return b.unit === '%' ? `Reach ${b.need}% of the branch` : `${b.need.toLocaleString()} ${b.unit}`;
}

export const FAMILY_LABEL: Record<BadgeFamily, string> = {
  lessons: 'LESSONS FINISHED',
  // Not 'DAYS RUNNING' any more: this family now holds both the consecutive-day
  // badges and the total-days-turned-up ones, and a header that promises a
  // streak over a badge earned by NOT needing one is a small lie in a big font.
  streak: 'THE HABIT',
  thinkers: 'THINKERS MET',
  quotes: 'QUOTES KEPT',
  xp: 'THE LONG ROAD',
  mastery: 'MASTERY',
};

/** Display order of the families in the grid. */
export const FAMILY_ORDER: BadgeFamily[] = [
  'lessons', 'streak', 'thinkers', 'quotes', 'mastery', 'xp',
];

const mastery = (slug: string) => (s: ProgressStats) => s.mastery[slug] ?? 0;

// 50 badges, grouped by family, easiest → hardest within each.
// ─────────────────────────────────────────────────────────────────────────────
// SIXTY-EIGHT BADGES, AND THEY ARE MEANT TO BE HARD.
//
// A reader: "I don't want the user to have forty badges out of fifty very
// quickly. I want it to be difficult to obtain badges, but also the user will
// get badges from natural ways of using the app."
//
// The old fifty were easy, and countably so. The lesson badges ran 1, 3, 5, 10,
// 15, 20, 25, 30, 40, 50 against a curriculum of 222 — so every one of them was
// held by lesson fifty, a quarter of the way in, and the family had nothing left
// to say for the remaining 172. The thinkers family topped out at 20 of 322. The
// quotes family at 30 of 132.
//
// So the deep end is now pinned to what the app actually CONTAINS: 222 lessons,
// 322 thinkers, 132 saveable quotes, 28 units, six branches, and the 21,400 XP
// counted in data/ranks.ts. The last badge in most families is "all of them".
//
// THE SHALLOW END IS UNCHANGED ON PURPOSE. First lesson, three days, first
// perfect quiz, three quotes — a reader should hold four or five badges in their
// first week without trying, because a case with nothing in it is not a case.
// What changed is everything after that.
//
// ── FIVE TIERS, AND WHAT THEY MEAN ─────────────────────────────────────────
//
// Iron, bronze, jade, crimson, aurum — the rank ladder's own orders (see
// constants/insignia.ts), so the two reward systems speak one language. 10 at
// iron, 13 bronze, 14 jade, 16 crimson, 15 aurum: weighted to the hard end,
// because the hard end is where a reader spends most of their time.
//
// ── THE IDS ARE STILL FROZEN ───────────────────────────────────────────────
//
// All fifty of the originals are still here, re-tiered and re-thresholded and
// some of them re-glyphed, which the header above explicitly permits. Eighteen
// are new. `scripts/validate-badges.mjs` carries the roll and will not let one
// be dropped, because dropping one strands the badge everybody holds.
// ─────────────────────────────────────────────────────────────────────────────
export const BADGES: BadgeDef[] = [
  // ── LESSONS FINISHED · the stele ────────────────────────────────────────────
  {
    id: 'first-light', name: 'Out of the Cave',
    caption: "Plato's prisoner turns around and sees the fire.",
    glyph: 'torch', family: 'lessons', tier: 1,
    goal: (s) => s.lessons, need: 1, unit: 'lessons',
  },
  {
    id: 'star-pupil', name: 'The Examined Life',
    caption: 'Socrates said the other kind was not worth living.',
    glyph: 'magnifier', family: 'lessons', tier: 1,
    goal: (s) => s.lessons, need: 5, unit: 'lessons',
  },
  {
    id: 'arch-of-wisdom', name: 'The Threshold',
    caption: 'Every school in Athens had a gate you had to walk through.',
    glyph: 'arch', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 15, unit: 'lessons',
  },
  {
    id: 'true-north', name: 'A Fixed Point',
    caption: 'Descartes wanted one thing he could not doubt. You have thirty.',
    glyph: 'starcompass', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 30, unit: 'lessons',
  },
  {
    id: 'the-pillars', name: 'The Long Colonnade',
    caption: 'The Stoics were named after a porch they would not leave.',
    glyph: 'column', family: 'lessons', tier: 3,
    goal: (s) => s.lessons, need: 55, unit: 'lessons',
  },
  {
    id: 'grid-thinker', name: 'The Method',
    caption: 'Somewhere past here it stops being reading and becomes practice.',
    glyph: 'grid', family: 'lessons', tier: 3,
    goal: (s) => s.lessons, need: 90, unit: 'lessons',
  },
  {
    id: 'ascent', name: 'The Long Ascent',
    caption: 'Two thirds of the way up, and the view has changed.',
    glyph: 'ascend', family: 'lessons', tier: 4,
    goal: (s) => s.lessons, need: 130, unit: 'lessons',
  },
  {
    id: 'summit', name: 'Near the Summit',
    caption: 'Most people who start a thing like this are long gone by now.',
    glyph: 'mountain', family: 'lessons', tier: 4,
    goal: (s) => s.lessons, need: 175, unit: 'lessons',
  },
  {
    id: 'the-great-question', name: 'Every Last One',
    caption: 'There is no lesson in this app you have not finished.',
    glyph: 'bookrays', family: 'lessons', tier: 5,
    goal: (s) => s.lessons, need: 222, unit: 'lessons',
  },

  // ── THE STREAK · days in a row ──────────────────────────────────────────────
  {
    id: 'turning-point', name: 'Three Days Running',
    caption: 'Aristotle: we are what we repeatedly do.',
    glyph: 'candle', family: 'streak', tier: 1,
    goal: (s) => s.streak, need: 3, unit: 'days',
  },
  {
    id: 'lamp-bearer', name: 'A Week Unbroken',
    caption: 'The lamp in the window of the Lyceum.',
    glyph: 'lamp', family: 'streak', tier: 2,
    goal: (s) => s.streak, need: 7, unit: 'days',
  },
  {
    id: 'moonlit-path', name: 'Three Weeks',
    caption: 'Long enough that it has stopped being a decision.',
    glyph: 'crescent', family: 'streak', tier: 3,
    goal: (s) => s.streak, need: 21, unit: 'days',
  },
  {
    id: 'solar-mind', name: 'Fifty Days',
    caption: 'Marcus Aurelius wrote his to himself, nightly, for years.',
    glyph: 'sun', family: 'streak', tier: 4,
    goal: (s) => s.streak, need: 50, unit: 'days',
  },
  {
    id: 'the-hourglass', name: 'One Hundred Days',
    caption: 'A hundred consecutive days is a different animal.',
    glyph: 'hourglass', family: 'streak', tier: 5,
    goal: (s) => s.streak, need: 100, unit: 'days',
  },

  // ── DAYS PRACTISED · days you turned up, in a row or not ────────────────────
  {
    id: 'deep-roots', name: 'Ten Days In',
    caption: 'Not in a row. Just ten days you turned up.',
    glyph: 'seed', family: 'streak', tier: 1,
    goal: (s) => s.daysPractised, need: 10, unit: 'days',
  },
  {
    id: 'the-willow', name: 'Fifty Days In',
    caption: 'The willow bends and is still standing.',
    glyph: 'willow', family: 'streak', tier: 3,
    goal: (s) => s.daysPractised, need: 50, unit: 'days',
  },
  {
    id: 'the-keep', name: 'A Hundred and Fifty',
    caption: 'A habit nobody can take off you, missed Tuesdays and all.',
    glyph: 'tower', family: 'streak', tier: 4,
    goal: (s) => s.daysPractised, need: 150, unit: 'days',
  },
  {
    id: 'the-fortress', name: 'Three Hundred Days',
    caption: 'Most of a year of turning up.',
    glyph: 'vault', family: 'streak', tier: 5,
    goal: (s) => s.daysPractised, need: 300, unit: 'days',
  },

  // ── THINKERS MET · the bust ─────────────────────────────────────────────────
  {
    id: 'oval-seeker', name: 'First Acquaintance',
    caption: 'You have met somebody.',
    glyph: 'bust', family: 'thinkers', tier: 1,
    goal: (s) => s.philosophers, need: 5, unit: 'thinkers',
  },
  {
    id: 'crowned-star', name: 'A Small Circle',
    caption: 'Twenty names you would now recognise.',
    glyph: 'star', family: 'thinkers', tier: 2,
    goal: (s) => s.philosophers, need: 20, unit: 'thinkers',
  },
  {
    id: 'circle-of-stars', name: 'The Symposium',
    caption: 'Fifty guests, and the conversation is still going.',
    glyph: 'ring', family: 'thinkers', tier: 3,
    goal: (s) => s.philosophers, need: 50, unit: 'thinkers',
  },
  {
    id: 'crossed-paths', name: 'The Academy Roll',
    caption: 'A hundred thinkers opened, one at a time.',
    glyph: 'chain', family: 'thinkers', tier: 4,
    goal: (s) => s.philosophers, need: 100, unit: 'thinkers',
  },
  {
    id: 'the-colosseum', name: 'The Great Hall',
    caption: 'Half of everyone in here.',
    glyph: 'dome', family: 'thinkers', tier: 4,
    goal: (s) => s.philosophers, need: 175, unit: 'thinkers',
  },
  {
    id: 'the-lens', name: 'Two Hundred and Fifty',
    caption: 'At this point the gaps are the interesting part.',
    glyph: 'orbit', family: 'thinkers', tier: 5,
    goal: (s) => s.philosophers, need: 250, unit: 'thinkers',
  },
  {
    id: 'the-infinite', name: 'Every Voice',
    caption: 'All three hundred and twenty-two of them.',
    glyph: 'infinity', family: 'thinkers', tier: 5,
    goal: (s) => s.philosophers, need: 322, unit: 'thinkers',
  },

  // ── QUOTES KEPT · the folio ─────────────────────────────────────────────────
  {
    id: 'half-circle', name: 'First Keeping',
    caption: 'A commonplace book starts with one line.',
    glyph: 'page', family: 'quotes', tier: 1,
    goal: (s) => s.quotes, need: 3, unit: 'quotes',
  },
  {
    id: 'open-page', name: 'The Florilegium',
    caption: 'Medieval readers called a gathering of quotations a bouquet.',
    glyph: 'flower', family: 'quotes', tier: 2,
    goal: (s) => s.quotes, need: 10, unit: 'quotes',
  },
  {
    id: 'the-vessel', name: 'The Commonplace Book',
    caption: 'Twenty-five lines worth carrying around.',
    glyph: 'amphora', family: 'quotes', tier: 3,
    goal: (s) => s.quotes, need: 25, unit: 'quotes',
  },
  {
    id: 'flourish', name: 'The Anthology',
    caption: 'Fifty. Enough to notice what you keep choosing.',
    glyph: 'quill', family: 'quotes', tier: 4,
    goal: (s) => s.quotes, need: 50, unit: 'quotes',
  },
  {
    id: 'the-amphora', name: 'The Full Cellar',
    caption: 'Eighty-five kept lines.',
    glyph: 'harp', family: 'quotes', tier: 5,
    goal: (s) => s.quotes, need: 85, unit: 'quotes',
  },
  {
    id: 'the-vessel-ii', name: 'Every Line Worth Keeping',
    caption: 'Every saveable quote in the app is in your collection.',
    glyph: 'book', family: 'quotes', tier: 5,
    goal: (s) => s.quotes, need: 132, unit: 'quotes',
  },

  // ── VOICES KEPT · distinct thinkers in the collection ───────────────────────
  {
    id: 'the-rings', name: 'Ten Voices',
    caption: 'Ten different thinkers, not ten lines from the same one.',
    glyph: 'knot', family: 'quotes', tier: 2,
    goal: (s) => s.quoteAuthors, need: 10, unit: 'thinkers',
  },
  {
    id: 'facets', name: 'Forty Voices',
    caption: 'A collection with an argument in it.',
    glyph: 'prism', family: 'quotes', tier: 4,
    goal: (s) => s.quoteAuthors, need: 40, unit: 'thinkers',
  },
  {
    id: 'mandala', name: 'Ninety Voices',
    caption: 'Nobody assembles this by accident.',
    glyph: 'maze', family: 'quotes', tier: 5,
    goal: (s) => s.quoteAuthors, need: 90, unit: 'thinkers',
  },

  // ── THE COLLECTION’S REACH ──────────────────────────────────────────────────
  {
    id: 'compass-rose', name: 'All Six Subjects',
    caption: 'A saved line from every branch of the tree.',
    glyph: 'wheel', family: 'quotes', tier: 3,
    goal: (s) => s.quoteBranches, need: 6, unit: 'branches',
  },

  // ── EXPERIENCE · the octagon ────────────────────────────────────────────────
  {
    id: 'bright-star', name: 'First Five Hundred',
    caption: 'It counts everything: lessons, quotes, thinkers, quizzes.',
    glyph: 'sunface', family: 'xp', tier: 1,
    goal: (s) => s.totalXP, need: 500, unit: 'XP',
  },
  {
    id: 'radiant-mind', name: 'Two Thousand',
    caption: 'Real distance now.',
    glyph: 'ripple', family: 'xp', tier: 2,
    goal: (s) => s.totalXP, need: 2000, unit: 'XP',
  },
  {
    id: 'the-crown', name: 'Five Thousand',
    caption: 'A third of everything this app can pay out.',
    glyph: 'crown', family: 'xp', tier: 3,
    goal: (s) => s.totalXP, need: 5000, unit: 'XP',
  },
  {
    id: 'diamond-eye', name: 'Nine Thousand',
    caption: 'Past the point where anyone is doing this casually.',
    glyph: 'gem', family: 'xp', tier: 4,
    goal: (s) => s.totalXP, need: 9000, unit: 'XP',
  },
  {
    id: 'star-of-david', name: 'Thirteen Thousand',
    caption: 'More than the lessons alone can pay.',
    glyph: 'hexagram', family: 'xp', tier: 5,
    goal: (s) => s.totalXP, need: 13000, unit: 'XP',
  },
  {
    id: 'the-gate', name: 'Sixteen Thousand',
    caption: 'The figure the top rank is set at.',
    glyph: 'gate', family: 'xp', tier: 5,
    goal: (s) => s.totalXP, need: 16000, unit: 'XP',
  },
  {
    id: 'the-shield', name: 'Twenty-One Thousand',
    caption: 'Within sight of everything the app contains.',
    glyph: 'shieldcross', family: 'xp', tier: 5,
    goal: (s) => s.totalXP, need: 21000, unit: 'XP',
  },

  // ── QUIZZES ACED ────────────────────────────────────────────────────────────
  {
    id: 'balance', name: 'First Perfect Quiz',
    caption: 'Every question about one thinker, right.',
    glyph: 'scales', family: 'xp', tier: 1,
    goal: (s) => s.quizAces, need: 1, unit: 'quizzes',
  },
  {
    id: 'delta-rise', name: 'Ten Aced',
    caption: 'Ten thinkers you can be examined on.',
    glyph: 'pyramid', family: 'xp', tier: 2,
    goal: (s) => s.quizAces, need: 10, unit: 'quizzes',
  },
  {
    id: 'dottarget-forty', name: 'Forty Aced',
    caption: 'The quiz has stopped being a coin toss.',
    glyph: 'dottarget', family: 'xp', tier: 3,
    goal: (s) => s.quizAces, need: 40, unit: 'quizzes',
  },
  {
    id: 'target-hundred', name: 'A Hundred Aced',
    caption: 'A hundred perfect scores.',
    glyph: 'target', family: 'xp', tier: 4,
    goal: (s) => s.quizAces, need: 100, unit: 'quizzes',
  },
  {
    id: 'the-anvil', name: 'Two Hundred Aced',
    caption: 'Beaten out one at a time.',
    glyph: 'anvil', family: 'xp', tier: 5,
    goal: (s) => s.quizAces, need: 200, unit: 'quizzes',
  },

  // ── BRANCHES OPENED ─────────────────────────────────────────────────────────
  {
    id: 'crossroads', name: 'Three Branches Opened',
    caption: 'You have looked down three of the six roads.',
    glyph: 'signpost', family: 'mastery', tier: 1,
    goal: (s) => s.branchesTouched, need: 3, unit: 'branches',
  },
  {
    id: 'the-arch', name: 'All Six Opened',
    caption: 'Every branch of the tree has been started.',
    glyph: 'bridge', family: 'mastery', tier: 2,
    goal: (s) => s.branchesTouched, need: 6, unit: 'branches',
  },

  // ── UNITS FINISHED ──────────────────────────────────────────────────────────
  {
    id: 'the-fountain', name: 'First Unit Finished',
    caption: 'One unit, end to end.',
    glyph: 'fountain', family: 'mastery', tier: 1,
    goal: (s) => s.unitsComplete, need: 1, unit: 'units',
  },
  {
    id: 'peak-climber', name: 'Four Units',
    caption: 'Four finished end to end.',
    glyph: 'ladder', family: 'mastery', tier: 2,
    goal: (s) => s.unitsComplete, need: 4, unit: 'units',
  },
  {
    id: 'marble-pillar', name: 'Ten Units',
    caption: 'A third of the curriculum, finished properly.',
    glyph: 'obelisk', family: 'mastery', tier: 3,
    goal: (s) => s.unitsComplete, need: 10, unit: 'units',
  },
  {
    id: 'the-obelisk-ii', name: 'Eighteen Units',
    caption: 'Two thirds, and the hard ones are what is left.',
    glyph: 'sundial', family: 'mastery', tier: 4,
    goal: (s) => s.unitsComplete, need: 18, unit: 'units',
  },
  {
    id: 'the-keystone', name: 'Every Unit',
    caption: 'All twenty-eight, finished end to end.',
    glyph: 'cube', family: 'mastery', tier: 5,
    goal: (s) => s.unitsComplete, need: 28, unit: 'units',
  },

  // ── BRANCHES HALF DONE ──────────────────────────────────────────────────────
  {
    id: 'tender-heart', name: 'Half of One Branch',
    caption: 'Halfway down a single road.',
    glyph: 'heart', family: 'mastery', tier: 2,
    goal: (s) => s.branchesHalf, need: 1, unit: 'branches',
  },
  {
    id: 'lotus-bloom', name: 'Half of Three',
    caption: 'Three subjects at the halfway mark.',
    glyph: 'lotus', family: 'mastery', tier: 3,
    goal: (s) => s.branchesHalf, need: 3, unit: 'branches',
  },
  {
    id: 'deep-well', name: 'Half of Everything',
    caption: 'All six branches at fifty percent or better.',
    glyph: 'drop', family: 'mastery', tier: 4,
    goal: (s) => s.branchesHalf, need: 6, unit: 'branches',
  },

  // ── BRANCHES COMPLETED ──────────────────────────────────────────────────────
  {
    id: 'the-first-whole', name: 'One Branch Complete',
    caption: 'A hundred percent of one subject.',
    glyph: 'wave', family: 'mastery', tier: 3,
    goal: (s) => s.branchesComplete, need: 1, unit: 'branches',
  },
  {
    id: 'three-whole', name: 'Three Branches Complete',
    caption: 'Half the tree, finished.',
    glyph: 'tree', family: 'mastery', tier: 4,
    goal: (s) => s.branchesComplete, need: 3, unit: 'branches',
  },
  {
    id: 'the-whole-tree', name: 'The Whole Tree',
    caption: 'Every branch at a hundred percent.',
    glyph: 'bell', family: 'mastery', tier: 5,
    goal: (s) => s.branchesComplete, need: 6, unit: 'branches',
  },

  // ── ERAS MET ────────────────────────────────────────────────────────────────
  {
    id: 'moonrise', name: 'Three Eras',
    caption: 'Thinkers from three different ages of the world.',
    glyph: 'spiral', family: 'thinkers', tier: 2,
    goal: (s) => s.eras, need: 3, unit: 'eras',
  },
  {
    id: 'the-ages', name: 'Every Era',
    caption: 'Ancient, medieval, modern, contemporary and eastern.',
    glyph: 'cap', family: 'thinkers', tier: 4,
    goal: (s) => s.eras, need: 5, unit: 'eras',
  },

  // ── THE ORDERS · what your own pin is struck in ─────────────────────────────
  {
    id: 'order-bronze', name: 'The Bronze Circle',
    caption: 'Your pin is struck in bronze now.',
    glyph: 'feather', family: 'mastery', tier: 2,
    goal: (s) => s.rank + 1, need: 11, unit: 'ranks',
  },
  {
    id: 'order-jade', name: 'The Jade Circle',
    caption: 'Where the ladder turns precious.',
    glyph: 'question', family: 'mastery', tier: 3,
    goal: (s) => s.rank + 1, need: 16, unit: 'ranks',
  },
  {
    id: 'order-lapis', name: 'The Lapis Circle',
    caption: 'The most expensive blue in the world, for four thousand years.',
    glyph: 'cycle', family: 'mastery', tier: 3,
    goal: (s) => s.rank + 1, need: 21, unit: 'ranks',
  },
  {
    id: 'order-crimson', name: 'The Crimson Circle',
    caption: 'The dye a city went bankrupt over.',
    glyph: 'mask', family: 'mastery', tier: 4,
    goal: (s) => s.rank + 1, need: 26, unit: 'ranks',
  },
  {
    id: 'order-amethyst', name: 'The Amethyst Circle',
    caption: 'The imperial colour, and the last stone before metal.',
    glyph: 'eye', family: 'mastery', tier: 4,
    goal: (s) => s.rank + 1, need: 31, unit: 'ranks',
  },
  {
    id: 'order-aurum', name: 'The Aurum Circle',
    caption: 'There is nothing above it. That is the point.',
    glyph: 'key', family: 'mastery', tier: 5,
    goal: (s) => s.rank + 1, need: 36, unit: 'ranks',
  },
];


export const BADGE_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);
