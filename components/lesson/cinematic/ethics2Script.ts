import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-2, "One Choice, Three Lenses".
// Theme: A WALLET ON A CAFÉ PAVEMENT, AND THREE PAIRS OF GLASSES.
//
// He finds a wallet outside a café. Three pairs of glasses wait on the café table,
// one for each lens, and a pavement A-board is chalked with their three questions.
// Through Mill's, happiness meters rise over him and the wallet's owner as he hands
// it back; through Kant's, his own wallet slips from his pocket and she keeps it —
// the rule willed for everyone; through Aristotle's, he climbs the shop's front steps
// one honest act at a time towards HONESTY over the door.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts). The narration is unchanged, word for word and beat for beat;
// both questions are new and asked on the stage.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics2Beat extends BaseBeat {
  /** The finder's pose under his act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 200 at the wallet · 250 by the A-board · 296 with the owner · 114 on his way to the steps, 18 at their foot · 244 for the questions. */ x?: number;
  /** His act across this beat's line (the scene choreographs it). */
  act?: 'find' | 'cases' | 'lens1' | 'rows' | 'swap' | 'mill' | 'equal' | 'kant' | 'keep' | 'steps' | 'climb';
  /** Which lens he is wearing: 0 none · 1 outcomes · 2 duty · 3 character. */ lens?: number;
  /** How many of the A-board's three rows are chalked. */ rows?: number;
  /** The three rows are bracketed together: ordinary thinking mixes them. */ mixed?: boolean;
  /** The happiness meters are up over the two of them. */ meters?: boolean;
  /** The meters are marked equal: each person's happiness counts the same. */ equal?: boolean;
  /** The rule is posted: KEEP ANY WALLET YOU FIND. */ rule?: boolean;
  /** The rule is struck out: it can't be willed for everyone. */ struck?: boolean;
  /** How many of the three steps he has climbed. */ climbed?: number;
  /** Q1 on the stage: three thoughts through the outcomes lens. */ thoughts?: boolean;
  /** Q2 on the stage: three street signs. */ signs?: boolean;
}

export const BEATS: Ethics2Beat[] = [
  {
    p: 12, x: 200, act: 'find',
    text: 'Suppose you find a wallet on the pavement. What should you do with it?',
    dur: 1.8,
  },
  {
    p: 165, x: 250, act: 'cases',
    text: 'Three ethical theories will each deliver a verdict on this one small choice.',
    dur: 1.8,
  },
  {
    p: 7, x: 250, act: 'lens1', lens: 1, rows: 1,
    text: 'Moral philosophy offers three main approaches, here called lenses. The first asks what consequences an act will have.',
    cite: 'Three lenses',
    dur: 1.9,
  },
  {
    p: 260, x: 250, act: 'rows', lens: 1, rows: 3,
    text: 'The second asks what your duty requires. The third asks what the act makes of your character.',
    dur: 2.1,
  },
  {
    p: 260, x: 250, act: 'swap', lens: 1, rows: 3, mixed: true,
    text: 'Ordinary moral thinking mixes the three. Most people use all three without noticing which one they’re using.',
    dur: 1.8,
  },
  {
    p: 160, x: 296, act: 'mill', lens: 1, rows: 3, mixed: true, meters: true,
    text: 'John Stuart Mill’s utilitarianism judges acts by consequences. Returning the wallet is right if it produces the most happiness.',
    cite: 'J.S. Mill, Utilitarianism, 1863',
    dur: 2.7,
  },
  {
    p: 416, x: 296, act: 'equal', lens: 1, rows: 3, mixed: true, meters: true, equal: true,
    text: 'For Mill, consequences alone determine whether an act is right, and each person’s happiness counts equally.',
    dur: 2.1,
  },
  {
    p: 0, x: 296, lens: 1, rows: 3, mixed: true, meters: true, equal: true,
    quote: {
      id: 'lq-ethics-ethics-2-1',
      text: 'Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'Utilitarianism',
      era: '1863',
      branchSlugs: ['ethics'],
    },
    dur: 3.0,
  },
  {
    p: 14, x: 296, act: 'kant', lens: 2, rows: 3, mixed: true, rule: true,
    text: 'Immanuel Kant sets consequences aside. He holds that you should act only on a rule you could will everyone to follow.',
    cite: 'Kant, Groundwork, 1785',
    dur: 2.3,
  },
  {
    p: 266, x: 296, act: 'keep', lens: 2, rows: 3, mixed: true, rule: true, struck: true,
    text: 'Apply Kant’s test to the rule “keep any wallet you find”. Willed for everyone, it would let others keep your lost wallet, so you couldn’t consistently will it.',
    dur: 2.5,
  },
  {
    p: 13, x: 114, act: 'steps', lens: 3, rows: 3, mixed: true, rule: true, struck: true,
    text: 'Aristotle’s virtue ethics asks a third question. It asks not what to do, but what character you’re developing.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 1.8,
  },
  {
    p: 266, x: 18, act: 'climb', lens: 3, rows: 3, mixed: true, rule: true, struck: true, climbed: 3,
    text: 'Aristotle holds that virtue is acquired by practice. Each honest act makes the next easier, until honesty is part of your character.',
    dur: 3.3,
  },
  {
    p: 21, x: 244, lens: 1, rows: 3, mixed: true, rule: true, struck: true, climbed: 3, thoughts: true,
    interact: {
      prompt: 'Through the outcomes glasses, which question is he asking about the wallet?',
      explain: 'Which act makes most happiness. The outcomes lens judges a choice by its results alone: whose life goes better and whose goes worse. Whether everyone could follow the rule is Kant’s question, and what the act makes of him is Aristotle’s.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, x: 244, rows: 3, mixed: true, rule: true, struck: true, climbed: 3, signs: true,
    interact: {
      prompt: 'Everyone here keeps found wallets, and no law forbids it. Does that make it right?',
      explain: 'Neither shows it. David Hume argued in 1740 that facts about what is can’t, alone, establish what ought to be. A common or legal act can still be wrong; the other two answers draw an ought from an is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    rows: 3, mixed: true, rule: true, struck: true, climbed: 3,
    summary: {
      title: 'One Choice, Three Lenses',
      points: [
        'Outcomes: which act produces the most happiness (Mill)',
        'Duty: whether your rule could be universal law (Kant)',
        'Character: what the act makes of you (Aristotle)',
        'No “ought” follows from an “is” alone (Hume)',
      ],
      closing: 'Here all three lenses agree. In harder cases they diverge, and their reasons must be weighed against each other.',
    },
    dur: 2.8,
  },
];
