import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-7, "Where Rights Come From" — natural rights vs.
// rights we invent, staged as TWO SOURCES facing each other: a stone tablet
// half-buried in the ground stage left, and a paper charter pinned up stage right.
// The figure walks between them, and the payoff is physical — a law tears the
// paper in half and the stone does not move.
//
// Q1 is answered in the scene (tap the source that survives a repeal); Q2 is
// A/B/C/D. The term "natural rights" is withheld until AFTER the reader has
// already used the idea to answer Q1.

export interface Political7Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 190 = by the stone · 262 = mid · 330 = under the charter. */ x?: number;
  /** The half-buried stone tablet, 0..1. */ stone?: number;
  /** The pinned-up paper charter, 0..1. */ charter?: number;
  /** The charter ripped in two, 0..1. */ tear?: number;
  /** 1 = the two sources are tappable this beat (Q1). */ pick?: number;
}

export const BEATS: Political7Beat[] = [
  {
    p: 8, x: 264,
    text: 'You’re free to say what you think. Where does that right come from?',
    dur: 2,
  },
  {
    p: 8, x: 264,
    text: 'Does a government grant it, or a written constitution?',
    dur: 1.8,
  },
  {
    p: 8, x: 264,
    text: 'Or was the right yours before anyone voted on anything?',
    dur: 1.8,
  },
  {
    p: 38, x: 190, stone: 1,
    text: 'John Locke’s answer is nature. Before any government exists, he argues, each person has a right to life, liberty and property.',
    cite: 'The first answer',
    dur: 3,
  },
  {
    p: 38, x: 190, stone: 1,
    text: 'On this view, no one grants your rights. Government exists to protect rights you already have, not to create them.',
    dur: 2,
  },
  {
    p: 41, x: 330, stone: 1, charter: 1,
    text: 'Another tradition locates rights in agreement. A right exists only where people have written down a rule, signed it and agreed to enforce it.',
    cite: 'The second answer',
    dur: 2.8,
  },
  {
    p: 41, x: 330, stone: 1, charter: 1,
    text: 'On this view, a right that no law secures is only a wish that there were such a right.',
    dur: 1.8,
  },
  {
    p: 128, x: 262, stone: 1, charter: 1,
    quote: {
      id: 'lq-political-political-7-1',
      text: 'Natural rights is simple nonsense: natural and imprescriptible rights, rhetorical nonsense — nonsense upon stilts.',
      author: 'Jeremy Bentham',
      work: 'Anarchical Fallacies',
      era: '1796',
      philosopherId: 'jeremy-bentham',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 467, x: 190, stone: 1, charter: 1,
    text: 'A thought experiment separates the two views. Suppose a government passes a law forbidding you to say what you think.',
    cite: 'The test',
    dur: 3.5,
  },
  {
    p: 467, x: 190, stone: 1, charter: 1,
    text: 'The law is properly enacted, and the state enforces it.',
    dur: 1.8,
  },
  {
    p: 162, x: 190, stone: 1, charter: 1, pick: 1,
    interact: {
      prompt: 'Once that law is passed, which source still gives you the right to speak?',
      explain: 'Nature. A right that exists only by agreement disappears when a law repeals it. If rights come from nature, you still have the right, and the law violates it. The two views divide on that difference.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 24, x: 330, stone: 1, charter: 1, tear: 1,
    text: 'A law can destroy a right that exists on paper. It can’t remove a right that exists by nature.',
    cite: 'Natural rights',
    dur: 2.7,
  },
  {
    p: 24, x: 330, stone: 1, charter: 1, tear: 1,
    text: 'These are natural rights: rights you have just for being human. A government can violate one.',
    dur: 2.2,
  },
  {
    p: 24, x: 330, stone: 1, charter: 1, tear: 1,
    text: 'What a government never granted, it cannot take away.',
    dur: 1.8,
  },
  {
    p: 165, x: 262, stone: 1, charter: 1, tear: 1,
    interact: {
      prompt: 'If every right comes from law, what follows?',
      sort: {
        chip: 'rights come only from law',
        bins: [
          { id: 'clean', label: 'nothing troubling', reads: 'nothing troubling follows, since law settles every right' },
          { id: 'custom', label: 'custom corrects it', reads: 'custom can still correct the law from outside' },
          { id: 'nothing', label: 'no right violated', reads: 'then no law could ever violate a right', correct: true },
        ],
      },
      explain: 'No right violated. If a right is only what the law grants, a law that removes one violates nothing above it. Bentham accepted that premise, because he held that only legal rights are real. Natural-rights theorists reply that some laws do violate rights.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 39, x: 190, stone: 1, charter: 1, tear: 1,
    text: 'The claim has consequences. Eighteenth-century thinkers proclaimed the rights of man, but most denied those rights to women.',
    cite: 'Who has rights',
    dur: 2.4,
  },
  {
    p: 39, x: 190, stone: 1, charter: 1, tear: 1,
    text: 'In 1792, Mary Wollstonecraft argued from reason. If reason grounds rights, women share them, because women reason too.',
    dur: 2.6,
  },
  {
    p: 462, x: 190,
    summary: {
      title: 'Two Accounts of Where Rights Come From',
      points: [
        'Locke: rights come before any government',
        'Bentham: a real right is written into law',
        'A law can violate a natural right, not remove it',
        'Wollstonecraft: rights grounded in reason belong to women too',
      ],
      closing: 'Where you think rights come from decides which ones can be taken away.',
    },
    dur: 3,
  },
];
