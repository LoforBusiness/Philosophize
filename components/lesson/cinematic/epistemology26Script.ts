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
  /** 1 = a dashed tie under the bill, joining both columns — she is named a peer. */ peerTie?: number;
  /** 1 = a plate reading EQUALLY LIKELY, between the columns — neither is assumed wrong. */ equalOdds?: number;
  /** 1 = a peg pins the YOURS column to the floor — a well-reasoned belief may stand. */ steadfastPeg?: number;
}

export const BEATS: Epistemology26Beat[] = [
  {
    p: 424, x: 28, bill: 1,
    text: 'Suppose you and a friend each work out your share of a restaurant bill. You get forty-three.',
    dur: 4.4,
  },
  {
    p: 159, x: 28, bill: 1, pair: 1,
    text: 'Your friend gets forty-five. Both of you are careful, and both are good at arithmetic.',
    dur: 4.4,
  },
  {
    p: 438, x: 28, bill: 1, pair: 1, peerTie: 1,
    text: 'Your friend is therefore an epistemic peer: someone with the same evidence and the same competence as you.',
    dur: 4.6,
  },
  {
    p: 258, x: 28, bill: 1, pair: 1, equalOdds: 1,
    text: 'So you can’t assume that she made the mistake. As your peer, she’s as likely to be right as you are.',
    dur: 4.8,
  },
  {
    p: 168, x: 28, bill: 1, pair: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Why can’t your own confidence settle the disagreement?',
      explain: 'She is sure too. If confidence settled it, each of you would win by your own lights, so nothing would be decided. Feelings do bear on belief, but here the two feelings are equal. Who spoke last is irrelevant.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 445, x: 88, bill: 1, pair: 1,
    text: 'The disagreement is itself a piece of evidence. Conciliationists like David Christensen say you should become less sure.',
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
    p: 446, x: 88, bill: 1, pair: 1, steadfastPeg: 1,
    text: 'The steadfast view, defended by Thomas Kelly, holds that a well-reasoned belief may stand. Otherwise anyone who disagrees could force a retreat.',
    dur: 5.0,
  },
  {
    p: 176, x: 88, bill: 1, pair: 1,
    interact: {
      prompt: 'How far should you move toward your peer’s answer?',
      drag: {
        lo: 'MEET IN THE MIDDLE',
        hi: 'HOLD YOUR VIEW',
        start: 0.95,
        zones: [
          { id: 'split', upto: 0.38, reads: 'split the difference, in every case' },
          { id: 'some', upto: 0.72, reads: 'become much less confident, and recheck', correct: true },
          { id: 'hold', upto: 1, reads: 'hold firm, and assume she made the error' },
        ],
      },
      explain: 'Become much less confident, and recheck. Holding firm treats your own confidence as proof that she erred. Always splitting the difference gives a veto to anyone who disagrees. It also ignores whether the two of you are peers.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bill: 1, pair: 1,
    summary: {
      title: 'Peer Disagreement',
      points: [
        'A peer matches your evidence and your competence',
        'Their disagreement is itself a piece of evidence',
        'Conciliationists lower confidence when a peer differs',
        'The steadfast view permits holding a well-weighed belief',
      ],
      closing: 'Peer disagreement is hardest with people you respect, who reason from the same evidence and reach another answer.',
    },
    dur: 5.0,
  },
];
