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

/** How the medal's EDGE is drawn: hairline, double rule, hatched band. */
export type BadgeTier = 1 | 2 | 3;

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
  streak: 'DAYS RUNNING',
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
export const BADGES: BadgeDef[] = [
  // ── LESSONS FINISHED · the stele ──────────────────────────────────────────
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
    goal: (s) => s.lessons, need: 3, unit: 'lessons',
  },
  {
    id: 'arch-of-wisdom', name: "Beginner's Mind",
    caption: 'Zen calls it shoshin. The expert has fewer options.',
    glyph: 'ring', family: 'lessons', tier: 1,
    goal: (s) => s.lessons, need: 5, unit: 'lessons',
  },
  {
    id: 'lamp-bearer', name: "Diogenes' Lantern",
    caption: 'He carried one at noon, hunting an honest man.',
    glyph: 'lamp', family: 'lessons', tier: 1,
    goal: (s) => s.lessons, need: 10, unit: 'lessons',
  },
  {
    id: 'crowned-star', name: 'The Peripatetic',
    caption: 'Aristotle taught while walking. Fifteen lessons of pacing.',
    glyph: 'arch', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 15, unit: 'lessons',
  },
  {
    id: 'radiant-mind', name: 'Sapere Aude',
    caption: "Kant's motto: dare to know. You keep daring.",
    glyph: 'sun', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 20, unit: 'lessons',
  },
  {
    id: 'the-arch', name: "Wittgenstein's Ladder",
    caption: 'Climb it, then throw it away. Twenty-five rungs.',
    glyph: 'ladder', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 25, unit: 'lessons',
  },
  {
    id: 'deep-roots', name: 'The Rhizome',
    caption: 'Deleuze: no trunk, no top. It spreads underground.',
    glyph: 'tree', family: 'lessons', tier: 2,
    goal: (s) => s.lessons, need: 30, unit: 'lessons',
  },
  {
    id: 'the-amphora', name: 'The Ship of Theseus',
    caption: 'Forty lessons in. Is this the same reader?',
    glyph: 'ship', family: 'lessons', tier: 3,
    goal: (s) => s.lessons, need: 40, unit: 'lessons',
  },
  {
    id: 'the-lens', name: 'The View From Nowhere',
    caption: "Nagel's name for seeing past your own position.",
    glyph: 'eye', family: 'lessons', tier: 3,
    goal: (s) => s.lessons, need: 50, unit: 'lessons',
  },

  // ── DAYS RUNNING · the pennant ────────────────────────────────────────────
  {
    id: 'turning-point', name: 'We Are What We Repeat',
    caption: 'Aristotle. Excellence is a habit, not an act.',
    glyph: 'cycle', family: 'streak', tier: 1,
    goal: (s) => s.streak, need: 3, unit: 'days',
  },
  {
    id: 'moonlit-path', name: 'The Eternal Return',
    caption: "Nietzsche's test: live so you'd gladly live it again.",
    glyph: 'infinity', family: 'streak', tier: 1,
    goal: (s) => s.streak, need: 7, unit: 'days',
  },
  {
    id: 'flourish', name: 'Eudaimonia',
    caption: "Aristotle's word for flourishing. It takes practice, not luck.",
    glyph: 'sunface', family: 'streak', tier: 2,
    goal: (s) => s.streak, need: 14, unit: 'days',
  },
  {
    id: 'the-willow', name: 'Creature of Habit',
    caption: 'Hume: we are bundles of habit wearing a name.',
    glyph: 'willow', family: 'streak', tier: 3,
    goal: (s) => s.streak, need: 30, unit: 'days',
  },
  {
    id: 'the-hourglass', name: 'The Clock of Königsberg',
    caption: 'Kant walked so punctually the neighbours set their clocks.',
    glyph: 'hourglass', family: 'streak', tier: 3,
    goal: (s) => s.streak, need: 60, unit: 'days',
  },

  // ── THINKERS MET · the roundel ────────────────────────────────────────────
  {
    id: 'true-north', name: 'The Dinner Guest',
    caption: 'One thinker met. The conversation has started.',
    glyph: 'bust', family: 'thinkers', tier: 1,
    goal: (s) => s.philosophers, need: 1, unit: 'thinkers',
  },
  {
    id: 'the-pillars', name: 'The Agora',
    caption: "Athens' marketplace, where the arguing happened in public.",
    glyph: 'gate', family: 'thinkers', tier: 1,
    goal: (s) => s.philosophers, need: 3, unit: 'thinkers',
  },
  {
    id: 'diamond-eye', name: 'The Republic of Letters',
    caption: 'Scattered thinkers, writing to each other for centuries.',
    glyph: 'quill', family: 'thinkers', tier: 1,
    goal: (s) => s.philosophers, need: 5, unit: 'thinkers',
  },
  {
    id: 'oval-seeker', name: 'Standing on Shoulders',
    caption: 'Newton said it — and he was quoting someone older.',
    glyph: 'mountain', family: 'thinkers', tier: 2,
    goal: (s) => s.philosophers, need: 8, unit: 'thinkers',
  },
  {
    id: 'compass-rose', name: 'The Lyceum',
    caption: "Aristotle's school. Twelve heads is a decent faculty.",
    glyph: 'cap', family: 'thinkers', tier: 2,
    goal: (s) => s.philosophers, need: 12, unit: 'thinkers',
  },
  {
    id: 'the-rings', name: 'The Invisible College',
    caption: 'Scholars who met in secret before the Royal Society existed.',
    glyph: 'ripple', family: 'thinkers', tier: 2,
    goal: (s) => s.philosophers, need: 16, unit: 'thinkers',
  },
  {
    id: 'circle-of-stars', name: 'The Symposium',
    caption: 'Twenty guests at the table, and nobody has left yet.',
    glyph: 'amphora', family: 'thinkers', tier: 3,
    goal: (s) => s.philosophers, need: 20, unit: 'thinkers',
  },
  // Three quiz badges, replacing three of the fourteen bare XP thresholds.
  {
    id: 'summit', name: 'Elenchus',
    caption: "Socrates' cross-examination. You have survived one.",
    glyph: 'question', family: 'thinkers', tier: 1,
    goal: (s) => s.quizAces, need: 1, unit: 'quizzes aced',
  },
  {
    id: 'solar-mind', name: "The Devil's Advocate",
    caption: 'A real Vatican post: argue the other side, properly.',
    glyph: 'xcross', family: 'thinkers', tier: 2,
    goal: (s) => s.quizAces, need: 5, unit: 'quizzes aced',
  },
  {
    id: 'the-shield', name: 'Viva Voce',
    caption: 'The oral exam, in the living voice. Fifteen passed.',
    glyph: 'scroll', family: 'thinkers', tier: 3,
    goal: (s) => s.quizAces, need: 15, unit: 'quizzes aced',
  },
  {
    id: 'bright-star', name: 'The Long Conversation',
    caption: 'Ancient to now: philosophy is one argument, continued.',
    glyph: 'starcompass', family: 'thinkers', tier: 3,
    goal: (s) => s.eras, need: 5, unit: 'eras met',
  },

  // ── QUOTES KEPT · the ex-libris label ─────────────────────────────────────
  {
    id: 'grid-thinker', name: 'The Commonplace Book',
    caption: 'Renaissance readers copied out the lines worth keeping.',
    glyph: 'book', family: 'quotes', tier: 1,
    goal: (s) => s.quotes, need: 1, unit: 'quotes',
  },
  {
    id: 'the-great-question', name: 'Marginalia',
    caption: 'The best of a book is often written in its margins.',
    glyph: 'page', family: 'quotes', tier: 1,
    goal: (s) => s.quotes, need: 3, unit: 'quotes',
  },
  {
    id: 'half-circle', name: 'Florilegium',
    caption: 'Medieval for a gathering of flowers: a book of quotations.',
    glyph: 'flower', family: 'quotes', tier: 2,
    goal: (s) => s.quotes, need: 8, unit: 'quotes',
  },
  {
    id: 'open-page', name: 'Pensées',
    caption: "Pascal's scraps of paper, found in bundles after he died.",
    glyph: 'candle', family: 'quotes', tier: 2,
    goal: (s) => s.quotes, need: 12, unit: 'quotes',
  },
  {
    id: 'the-vessel', name: 'The Zettelkasten',
    caption: "Luhmann's slip-box: 90,000 notes, and a theory fell out.",
    glyph: 'grid', family: 'quotes', tier: 3,
    goal: (s) => s.quotes, need: 20, unit: 'quotes',
  },
  {
    id: 'the-vessel-ii', name: 'The Library of Babel',
    caption: 'Borges imagined every possible book. You kept thirty lines.',
    glyph: 'bookrays', family: 'quotes', tier: 3,
    goal: (s) => s.quotes, need: 30, unit: 'quotes',
  },
  {
    id: 'delta-rise', name: 'Omnivore',
    caption: 'Lines pulled from four different corners of the subject.',
    glyph: 'wheel', family: 'quotes', tier: 2,
    goal: (s) => s.quoteBranches, need: 4, unit: 'branches quoted',
  },

  // ── MASTERY · the shield ──────────────────────────────────────────────────
  {
    id: 'tender-heart', name: 'The Golden Mean',
    caption: 'Aristotle: courage sits between cowardice and recklessness.',
    glyph: 'scales', family: 'mastery', tier: 1,
    goal: mastery('ethics'), need: 25, unit: '%',
  },
  {
    id: 'marble-pillar', name: 'First Philosophy',
    caption: "Aristotle's name for it, before anyone said metaphysics.",
    glyph: 'column', family: 'mastery', tier: 1,
    goal: mastery('metaphysics'), need: 25, unit: '%',
  },
  {
    id: 'lotus-bloom', name: 'Disinterested Pleasure',
    caption: "Kant's test for beauty: wanting nothing at all from it.",
    glyph: 'lotus', family: 'mastery', tier: 1,
    goal: mastery('aesthetics'), need: 25, unit: '%',
  },
  {
    id: 'balance', name: 'Modus Ponens',
    caption: 'If P then Q. P. Therefore Q. The oldest move there is.',
    glyph: 'target', family: 'mastery', tier: 1,
    goal: mastery('logic'), need: 25, unit: '%',
  },
  {
    id: 'crossroads', name: 'The Fox',
    caption: "Berlin's fox knows many things; the hedgehog one big thing.",
    glyph: 'signpost', family: 'mastery', tier: 1,
    goal: (s) => s.branchesTouched, need: 3, unit: 'branches started',
  },
  {
    id: 'crossed-paths', name: 'The Polymath',
    caption: 'Five fields at once used to be the normal ambition.',
    glyph: 'star', family: 'mastery', tier: 2,
    goal: (s) => s.branchesTouched, need: 5, unit: 'branches started',
  },
  {
    id: 'the-keep', name: 'QED',
    caption: 'Quod erat demonstrandum: which was the thing to be shown.',
    glyph: 'dottarget', family: 'mastery', tier: 1,
    goal: (s) => s.unitsComplete, need: 1, unit: 'units finished',
  },
  {
    id: 'the-colosseum', name: 'Scholastic',
    caption: 'The medieval method: argue every step of the syllabus.',
    glyph: 'shieldcross', family: 'mastery', tier: 2,
    goal: (s) => s.unitsComplete, need: 5, unit: 'units finished',
  },
  {
    id: 'facets', name: 'Trivium',
    caption: 'The medieval core three. You are half a degree in.',
    glyph: 'gem', family: 'mastery', tier: 2,
    goal: (s) => s.branchesHalf, need: 3, unit: 'branches half-done',
  },
  {
    id: 'star-of-david', name: 'Summa',
    caption: "Aquinas' word for the whole of it, gathered in one place.",
    glyph: 'crown', family: 'mastery', tier: 3,
    goal: (s) => s.unitsComplete, need: 12, unit: 'units finished',
  },
  {
    id: 'mandala', name: 'The Encyclopédie',
    caption: 'Diderot tried to hold all of human knowledge in one work.',
    glyph: 'hexagram', family: 'mastery', tier: 3,
    goal: (s) => s.branchesHalf, need: 6, unit: 'branches half-done',
  },

  // ── THE LONG ROAD · the struck coin ───────────────────────────────────────
  // Six XP milestones, down from fourteen. The other eight became deeds above.
  {
    id: 'peak-climber', name: 'Sisyphus, Happy',
    caption: 'Camus told us to imagine him so. A thousand up the hill.',
    glyph: 'pyramid', family: 'xp', tier: 1,
    goal: (s) => s.totalXP, need: 1000, unit: 'XP',
  },
  {
    id: 'the-crown', name: 'The Tortoise',
    caption: 'Zeno proved it could never be caught. Keep going anyway.',
    glyph: 'dome', family: 'xp', tier: 1,
    goal: (s) => s.totalXP, need: 3000, unit: 'XP',
  },
  {
    id: 'ascent', name: 'Terra Incognita',
    caption: 'The part of the old maps nobody had walked yet.',
    glyph: 'flag', family: 'xp', tier: 2,
    goal: (s) => s.totalXP, need: 5000, unit: 'XP',
  },
  {
    id: 'the-gate', name: 'The Long Now',
    caption: 'Thinking in centuries rather than in afternoons.',
    glyph: 'crescent', family: 'xp', tier: 2,
    goal: (s) => s.totalXP, need: 7000, unit: 'XP',
  },
  {
    id: 'the-fortress', name: 'The Great Chain',
    caption: 'The medieval picture of everything, linked, top to bottom.',
    glyph: 'chain', family: 'xp', tier: 3,
    goal: (s) => s.totalXP, need: 13000, unit: 'XP',
  },
  {
    id: 'the-infinite', name: 'Owl of Minerva',
    caption: "Hegel's owl flies at dusk. You have earned the dark.",
    glyph: 'owl', family: 'xp', tier: 3,
    goal: (s) => s.totalXP, need: 20000, unit: 'XP',
  },
];

export const BADGE_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);
