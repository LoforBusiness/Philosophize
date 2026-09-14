import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-2, "Three Lenses on a Small Choice".
// A found wallet on the pavement; a guide walks in and tries each of the three
// ethical lenses on it — Mill (weigh the outcome), Kant (point to a universal
// law), Aristotle (a hand to the heart) — while the finder deliberates. Every
// beat uses a DIFFERENT gesture so the figures never loop.
//
// Both graded questions come from data/.../everyday-moral-choices.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics2Beat extends BaseBeat {
  /** Finder gesture (emote code). */ p?: number;
  /** Guide gesture (emote code), -1 = off stage. */ g?: number;
  /** Guide x (walks between beats). */ gx?: number;
  /** Verdict-board rows carry their lens name + question yet (0/1). */ named?: number;
  /** How many of the three lenses have stamped their verdict, 0→3. */ lens?: number;
}

export const BEATS: Ethics2Beat[] = [
  {
    p: 12, x: 258, g: -1,
    text: 'Suppose you find a wallet on the pavement. What should you do with it?',
    dur: 1.8,
  },
  {
    p: 12, x: 258, g: -1,
    text: 'Three ethical theories will each deliver a verdict on this one small choice.',
    dur: 1.8,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'Moral philosophy offers three main approaches, here called lenses. The first asks what consequences an act will have.',
    cite: 'Three lenses',
    dur: 1.9,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'The second asks what your duty requires. The third asks what the act makes of your character.',
    dur: 2.1,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'Ordinary moral thinking mixes the three. Most people use all three without noticing which one they’re using.',
    dur: 1.8,
  },
  {
    p: 160, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'John Stuart Mill’s utilitarianism judges acts by consequences. Returning the wallet is right if it produces the most happiness.',
    cite: 'J.S. Mill, Utilitarianism, 1863',
    dur: 2.7,
  },
  {
    p: 416, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'For Mill, consequences alone determine whether an act is right, and each person’s happiness counts equally.',
    dur: 2.1,
  },
  {
    p: 0, x: 262, g: 1, gx: 108, named: 1, lens: 1,
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
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Immanuel Kant sets consequences aside. He holds that you should act only on a rule you could will everyone to follow.',
    cite: 'Kant, Groundwork, 1785',
    dur: 2.3,
  },
  {
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Apply Kant’s test to the rule “keep any wallet you find”. Willed for everyone, it would let others keep your lost wallet, so you couldn’t consistently will it.',
    dur: 2.5,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Aristotle’s virtue ethics asks a third question. It asks not what to do, but what character you’re developing.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 1.8,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Aristotle holds that virtue is acquired by practice. Each honest act makes the next easier, until honesty is part of your character.',
    dur: 3.3,
  },
  {
    p: 21, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      // The table on stage calls this lens OUTCOMES, not "consequentialist".
      prompt: 'Which question does the outcomes lens ask about the wallet?',
      cards: [
        { text: 'Which act brings most happiness', correct: true },
        { text: 'Could everyone follow this rule', correct: false },
      ],
      explain: 'Which act brings most happiness. The outcomes lens judges a choice by its results alone: whose life goes better and whose goes worse. “Could everyone follow this rule” is Kant’s question, which sets results aside.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      prompt: 'Does an act’s being common or legal establish that it’s right?',
      sort: {
        chip: 'common and legal',
        bins: [
          { id: 'common', label: 'common suffices', reads: 'it’s common, so it’s right' },
          { id: 'legal', label: 'legal suffices', reads: 'it’s legal, so it’s right' },
          { id: 'neither', label: 'neither suffices', reads: 'neither fact shows that it’s right', correct: true },
        ],
      },
      explain: 'Neither suffices. David Hume argued in 1740 that facts about what is can’t, alone, establish what ought to be. A common or legal act can still be wrong. The other two answers draw an ought from an is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
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
