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
    text: 'You are allowed to say what you think. So who actually handed you that? A government? A piece of paper? Or was it yours before anyone voted on anything?',
    dur: 4.2,
  },
  {
    p: 38, x: 190, stone: 1,
    text: 'John Locke pointed at the ground. Some things are yours the moment you exist — your life, your freedom, your stuff. Nobody grants them. A government exists to guard them, not to hand them out.',
    cite: 'The first answer',
    dur: 5.0,
  },
  {
    p: 41, x: 330, stone: 1, charter: 1,
    text: 'Others pointed up here instead. A right is something people wrote down, signed, and agreed to enforce. No signature, no right — just a wish said loudly.',
    cite: 'The second answer',
    dur: 4.4,
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
    p: 21, x: 190, stone: 1, charter: 1,
    text: 'Here is how to tell the two apart. Tomorrow a government passes a law: from now on, you may not say what you think. The law is real, and it is enforced.',
    cite: 'The test',
    dur: 4.6,
  },
  {
    p: 44, x: 190, stone: 1, charter: 1, pick: 1,
    interact: {
      prompt: 'That law wipes the right off the books. Tap the source where the right is still standing.',
      explain: 'Wipe the paper and the paper’s right goes with it — that is what made it the paper’s in the first place. The stone’s answer is different: you kept the right, and the law simply broke it. The whole argument turns on that gap.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 24, x: 330, stone: 1, charter: 1, tear: 1,
    text: 'Watch what the law can actually reach. It tears the paper in half — and the stone does not move. That is the claim: rights you have just for being human. A government can break one. It cannot un-give it.',
    cite: 'Natural rights',
    dur: 5.4,
  },
  {
    p: 4, x: 262, stone: 1, charter: 1, tear: 1,
    interact: {
      prompt: '"If it is not written into law, it is not a right." What do natural-rights thinkers answer?',
      cards: [
        { text: 'Then no law could be unjust', correct: true },
        { text: 'Correct, rights need writing', correct: false },
      ],
      explain: 'The trap: "no law, no right" sounds hard-headed, and it is what Bentham argued. But if a right is only whatever the law says, then a law that strips one is unjust by no standard at all — which is exactly what a natural right supplies.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 39, x: 190, stone: 1, charter: 1, tear: 1,
    text: 'And the claim has teeth. Thinkers announced the rights of man, then quietly stopped at men. Mary Wollstonecraft pressed the logic: if rights come from being a reasoning human, women are that too.',
    cite: 'Who counts',
    dur: 5.0,
  },
  {
    p: 0, x: 190,
    summary: {
      title: 'Two Stories About Rights',
      points: [
        'Locke: rights come before any government',
        'Bentham: a real right is written into law',
        'A law can break a right, not erase it',
        'Wollstonecraft: same logic, no exceptions',
      ],
      closing: 'Where you think rights come from decides which ones can be taken away.',
    },
    dur: 3,
  },
];
