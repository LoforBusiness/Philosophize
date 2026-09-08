import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-38, "Why Your Own Child Comes First"
// Theme: A BALANCE WITH ONE LIFE IN EACH PAN, AND A RACK OF REASONS ABOVE IT.
//
// The impartial rule is drawn as a balance that starts level: one disc in each
// pan, MY CHILD on the left and A STRANGER on the right, and nothing about the
// picture says which of them anybody knows. That is the whole of impartiality in
// one object, and it is why the object has to come first.
//
// Above it hangs a rack of three weights, each a reason somebody might give for
// leaning. Two of them an outsider could weigh as easily as you can. One of them
// only you can weigh, and that is the one the rule refuses.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — the three weights, and the reader picks the one an
//     impartial rule may not take. The weights are on the stage rather than in
//     the deck because the point is that they all LOOK like reasons.
//   · beat 7  a DRAG — how much a tie may weigh. The beam is the rail's readout:
//     the block on the left pan grows and the whole balance leans as the reader
//     moves, so the question is answered by tilting the picture rather than by
//     agreeing with a sentence.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the balance stands, level, with a disc in each pan. */ beam?: number;
  /** 1 = the rack of three reasons hangs above it. */ weights?: number;
  /** How far the beam leans toward the near pan, 0 (level) … 1 (hard over). */ tilt?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics38Beat[] = [
  {
    p: 164, x: 46, beam: 1,
    text: 'Two children are in the water and you can reach one. One of them is yours.',
    dur: 3.8,
  },
  {
    p: 2, x: 46, beam: 1,
    text: 'Every modern moral theory starts by refusing to look at that. A life is a life, and whose it is stays off the scale.',
    dur: 4.4,
  },
  {
    p: 36, x: 46, beam: 1, weights: 1,
    text: 'So the interesting work is in the reasons you may put on the pan.',
    dur: 3.2,
  },
  {
    p: 159, x: 46, beam: 1, weights: 1, live: 1,
    interact: {
      prompt: 'Tap the reason an impartial rule may not take.',
      explain: 'She is mine. The other two are facts a stranger could weigh exactly as you do: who is reachable, and what good follows. A relation to you cannot be read off from outside, which is precisely why an impartial rule will not have it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 46, beam: 1, weights: 1,
    text: 'William Godwin took that to the end. Save the archbishop over the chambermaid, he wrote, even if the chambermaid is your mother.',
    dur: 4.6,
  },
  {
    p: 35, x: 90, beam: 1, weights: 1, tilt: 0.35,
    text: 'Almost nobody believes him, and the reply is not sentiment. The tie was a reason all along.',
    dur: 4.0,
  },
  {
    p: 433, x: 90, beam: 1, tilt: 0.35,
    quote: {
      id: 'lq-ethics-ethics-38-1',
      text: 'This construction provides the agent with one thought too many.',
      author: 'Bernard Williams',
      philosopherId: 'bernard-williams',
      work: 'Moral Luck',
      era: '1981',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 21, x: 90, beam: 1, tilt: 0.35,
    interact: {
      prompt: 'How much may being yours weigh?',
      drag: {
        lo: 'nothing', hi: 'everything',
        start: 0.05,
        zones: [
          { id: 'none', upto: 0.22, reads: 'nothing at all, so you need a permission first' },
          { id: 'some', upto: 0.52, reads: 'a little, and you would still have to argue for it' },
          { id: 'lots', upto: 0.84, reads: 'a lot, and no further reason is wanted', correct: true },
          { id: 'all', upto: 1, reads: 'everything, and a stranger weighs nothing at all' },
        ],
      },
      explain: 'A lot, and no further reason is wanted. Set it at nothing and saving your own child becomes something you must first be licensed to do. Set it at everything and the far pan is empty, which no partialist has claimed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'A Thumb on the Scale',
      points: [
        'Impartial rules weigh a life without asking whose it is',
        'A tie to you is the reason they cannot take',
        'Most people act on it anyway, and defend it',
        'Needing a rule to permit it is the odd part',
      ],
      closing: 'The interesting question is not whether you would save your own. The question is what you take yourself to be doing.',
    },
    dur: 3.2,
  },
];
