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
    g: 379, results: 5,
    dur: 4.6,
    text: 'During the total eclipse of 1919, astronomers measured how much starlight bends near the sun. The result could have been none, or any amount.',
  },
  {
    g: 45, results: 5, bars: 3,
    dur: 5.0,
    text: 'Each of three theories is drawn as wide as the results it permits. Two permit only a narrow range, so they forbid almost every result.',
    cite: 'What each one permits',
  },
  {
    g: 13, results: 5, bars: 3,
    dur: 2.9,
    text: 'The third permits every possible result, so any measurement would have fitted it.',
    cite: 'One that permits everything',
  },
  {
    g: 266, results: 5, bars: 3,
    dur: 1.9,
    text: 'Karl Popper argued that this apparent strength is in fact a weakness.',
  },
  {
    g: 456, results: 5, bars: 3,
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
    g: 380, results: 5, bars: 3, found: 1,
    dur: 4.8,
    text: 'The results matched Einstein’s prediction of about one and three-quarter seconds of arc. His theory survived, and the prediction of half that bend was refuted.',
    cite: 'May 1919',
  },
  {
    g: 165, results: 5, bars: 3, found: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which theory could no possible result have refuted?',
      explain: 'Fits any result. The theory permits every result on the row, so no measurement could count against it. The two narrow theories each risked refutation on one reading, which is what made the eclipse a genuine test.',
      xp: 5,
    },
  },
  {
    g: 442, results: 5, bars: 3, found: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Popper’s view, how much should a scientific theory rule out?',
      drag: {
        lo: 'FORBIDS NOTHING',
        hi: 'FORBIDS ALMOST ALL',
        start: 0,
        zones: [
          { id: 'safe', upto: 0.3, reads: 'fits every outcome, so it risks nothing' },
          { id: 'good', upto: 0.72, reads: 'rules out a great deal, and could be refuted', correct: true },
          { id: 'wild', upto: 1, reads: 'rules out so much that it’s already refuted' },
        ],
      },
      explain: 'Rules out a great deal, and could be refuted. A theory that forbids nothing can’t be refuted, but it tells you nothing about what to expect. One that forbids the result that occurs is already refuted.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Theory Must Risk Something',
      points: [
        'Popper: science advances by attempted refutation, not confirmation',
        'A scientific claim forbids some observable result',
        'Fitting every possible outcome is a flaw, not a strength',
        'Einstein’s theory risked refutation by the 1919 eclipse',
      ],
      closing: 'For Popper, a scientific theory earns its value by ruling out results that could refute it.',
    },
    dur: 3.0,
  },
];
