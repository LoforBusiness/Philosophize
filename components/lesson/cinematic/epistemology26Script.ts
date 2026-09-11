import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-26, "When Your Equal Disagrees"
// Theme: TWO COLUMNS OF CONFIDENCE STANDING OVER ONE SHARED BILL.
//
// The whole difficulty is a SYMMETRY, so the scene draws one: a single receipt
// above, and beneath it two columns that start at exactly the same height. There
// is nothing in the picture to break the tie, which is the argument — and the
// reader's own answer is the only thing that ever moves them apart.
//
// The receipt is drawn once and never changes. Both of them have all of it; the
// evidence is not what is in dispute, and a picture that quietly gave one of them
// more of it would be answering the question.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps why feeling sure
//     settles nothing. On the stage because the two equal columns are the reason.
//   · beat 8  a DRAG — how far to move toward the peer. The two columns are the
//     control's own picture: hold, and yours grows while theirs shrinks.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the shared bill is drawn. */ bill?: number;
  /** 1 = the two columns of confidence are standing. */ pair?: number;
  /** How far the reader has held their own view, 0…1. Both start level. */ hold?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology26Beat[] = [
  {
    p: 424, x: 28, bill: 1,
    text: 'You and a friend split a dinner bill in your heads. You get forty-three.',
    dur: 4.4,
  },
  {
    p: 159, x: 28, bill: 1, pair: 1,
    text: 'Your friend gets forty-five. You’re both careful, and both good at sums.',
    dur: 4.4,
  },
  {
    p: 438, x: 28, bill: 1, pair: 1,
    text: 'That makes her an epistemic peer. Same evidence, same competence, same care.',
    dur: 4.6,
  },
  {
    p: 258, x: 28, bill: 1, pair: 1,
    text: 'So you can’t assume she blundered. By definition she’s as likely to be right.',
    dur: 4.8,
  },
  {
    p: 168, x: 28, bill: 1, pair: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap why being sure settles nothing here.',
      explain: 'Because she’s just as sure. If a strong feeling decided it, each of you would win by your own lights, which settles nothing at all. Feelings do bear on belief, and who spoke last is no rule anybody has ever defended.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 445, x: 88, bill: 1, pair: 1,
    text: 'The disagreement is itself a piece of evidence. A mind as good as yours read the same bill.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, bill: 1, pair: 1,
    quote: {
      id: 'lq-epistemology-knowledge-26-1',
      text: 'When we are confronted with a disagreeing peer, we are required to give that disagreement weight, even if we cannot locate any error.',
      author: 'David Christensen',
      work: 'Epistemology of Disagreement',
      era: '2007',
      branchSlugs: ['epistemology'],
    },
    dur: 5.0,
  },
  {
    p: 446, x: 88, bill: 1, pair: 1,
    text: 'Steadfasters answer that a well-weighed view may stand. Otherwise any contrarian wins.',
    dur: 5.0,
  },
  {
    p: 176, x: 88, bill: 1, pair: 1,
    interact: {
      prompt: 'How far should you move toward her?',
      drag: {
        lo: 'MEET IN THE MIDDLE',
        hi: 'HOLD YOUR VIEW',
        start: 0.95,
        zones: [
          { id: 'split', upto: 0.38, reads: 'split the difference, in every case' },
          { id: 'some', upto: 0.72, reads: 'move a long way, and go on looking', correct: true },
          { id: 'hold', upto: 1, reads: 'hold, and treat her as the one who slipped' },
        ],
      },
      explain: 'A long way, and not all the way. Refusing to move treats your own certainty as evidence, which is the trap. Splitting automatically is the other extreme. It hands a veto to anyone willing to disagree. It also stops you weighing whether the two of you are equals here.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bill: 1, pair: 1,
    summary: {
      title: 'An Equal, Not a Fool',
      points: [
        'A peer matches your evidence and your competence',
        'Their disagreement is itself a piece of evidence',
        'Conciliationists lower confidence when a peer differs',
        'Steadfasters may hold a view they have really weighed',
      ],
      closing: 'The hardest disagreements are not with fools. They’re with the people you most respect, who looked at the same bill and read it differently.',
    },
    dur: 5.0,
  },
];
