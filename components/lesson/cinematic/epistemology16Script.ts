import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-16, "What Makes A Claim Scientific?"
//
// THE PICTURE: a row of every result the 1919 eclipse could have returned, and
// underneath it the theories, drawn as bars covering the results each one PERMITS.
// A real theory is a narrow bar. The theory that explains everything is a bar the
// whole width of the row, and there is nothing left for it to be wrong about (H64).
//
// Falsifiability is normally taught as a definition and immediately forgotten,
// because "forbids something" is an abstraction. As a width it is not: the reader
// can see that one theory has staked almost the entire row on being right, and that
// the other has staked nothing at all.
//
// STAGING: the three bars are the Q1 targets. The decoys are the two real rival
// predictions of 1919 — Einstein's deflection and Newton's half of it — so both
// wrong answers are theories that were genuinely on the table (H66).

export interface Epi16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many possible results are laid out, 0…5. */ results?: number;
  /** How many theory bars are drawn, 0…3. */ bars?: number;
  /** The result the eclipse actually returned, ringed, 0…1. */ found?: number;
  /** 1 = the three bars are live targets (Q1). */ pick?: number;
}

export const BEATS: Epi16Beat[] = [
  {
    g: 25, results: 5,
    dur: 4.6,
    text: 'Here is every answer the 1919 eclipse could have come back with. Starlight bends by this much, or that much, or not at all.',
  },
  {
    g: 45, results: 5, bars: 3,
    dur: 5.0,
    text: 'Now three theories, each drawn as wide as the answers it allows. Two of them have bet almost the whole row on being right.',
    cite: 'What each one permits',
  },
  {
    g: 13, results: 5, bars: 3,
    dur: 4.8,
    text: 'The third allows everything. Whatever came back, it would have fitted. That is usually said as a boast.',
    cite: 'And one that allows everything',
  },
  {
    g: 137, results: 5, bars: 3,
    dur: 3.8,
    quote: {
      id: 'lq-epistemology-knowledge-16-1',
      text: 'A theory which is not refutable by any conceivable event is non-scientific.',
      author: 'Karl Popper',
      work: 'Conjectures and Refutations',
      era: '1963',
      philosopherId: 'karl-popper',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 21, results: 5, bars: 3, found: 1,
    dur: 4.8,
    text: 'The eclipse came back at one and three-quarter seconds of arc. One narrow bar survived and one narrow bar died.',
    cite: 'May 1919',
  },
  {
    g: 4, results: 5, bars: 3, found: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the theory that nothing could ever have refuted.',
      explain: 'The wide one. It permits every result on the row, so no result can count against it — and it learned nothing from the eclipse either way. The two narrow bars each risked almost everything on a single reading, which is exactly what made the measurement worth taking.',
      xp: 5,
    },
  },
  {
    g: 41, results: 5, bars: 3, found: 1,
    dur: 1.0,
    interact: {
      prompt: 'A theory that fits every possible outcome. Strength or flaw?',
      drag: {
        lo: 'FORBIDS NOTHING',
        hi: 'FORBIDS ALMOST ALL',
        start: 0,
        zones: [
          { id: 'safe', upto: 0.3, reads: 'fits every outcome, so it risks nothing' },
          { id: 'good', upto: 0.72, reads: 'rules out a great deal, and could be caught', correct: true },
          { id: 'wild', upto: 1, reads: 'rules out so much it is already refuted' },
        ],
      },
      explain: 'The other card is what almost everyone says first, and it is why bad theories survive so long. A claim nothing could ever prove wrong sounds unbeaten. It is closer to never having entered: a claim that rules out no result tells you nothing about which result you will get.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Theory Must Risk Something',
      points: [
        'Science advances by trying to refute, not to confirm',
        'A scientific claim forbids some observable result',
        'Fitting every outcome is emptiness, not strength',
        'Einstein named the result that would have killed his theory',
      ],
      closing: 'A real theory is strong because it can be broken. The theory dares the world to prove it wrong.',
    },
    dur: 3.0,
  },
];
