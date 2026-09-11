import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-40, "When the Prediction Fails, What Gives?"
// Theme: FOUR DEFENDANTS ROPED TOGETHER, AND ONE VERDICT WIDE ENOUGH FOR ALL.
//
// Quine's own word is a TRIBUNAL, so the scene builds one and lets the geometry
// carry the argument. The law, the orbit, the lens and the sums stand side by
// side under one bench; a rope runs behind all four, which is the whole of "not
// individually but as a corporate body"; and the verdict is a bar that comes
// down the full width of the dock.
//
// The lesson is then one movement of that bar. A reader who blames a part is
// narrowing a verdict the evidence handed down against everybody, and the picture
// shows them doing it rather than telling them they did.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps who the failed
//     prediction convicts. On the stage because the wide bar is already lying
//     across all four defendants while the question is asked.
//   · beat 8  a SORT — Mercury's wobble dropped into the part that was actually
//     at fault. The reader's own chip drives the verdict bar onto one plate, so
//     narrowing the charge is something they do with their thumb.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the four defendants are standing, 0…1. */ dock?: number;
  /** 1 = the rope running behind all four is drawn. */ rope?: number;
  /** 1 = the verdict bar is down, across the whole dock. */ verdict?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology40Beat[] = [
  {
    p: 423, x: 44,
    text: 'You test an idea and the test comes back wrong. Something in there is false.',
    dur: 4.2,
  },
  {
    p: 264, x: 44, dock: 0.5,
    text: 'But an idea never reaches the evidence on its own.',
    dur: 3.4,
  },
  {
    p: 168, x: 44, dock: 1,
    text: 'It brings the lens, the sums, and a hundred unspoken assumptions about the setup.',
    dur: 4.6,
  },
  {
    p: 436, x: 44, dock: 1, rope: 1, verdict: 1,
    text: 'So the failed prediction convicts all of them at once. Pierre Duhem saw it first.',
    dur: 4.4,
  },
  {
    p: 163, x: 44, dock: 1, rope: 1, verdict: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the failed test has refuted.',
      explain: 'All of it. The bar came down across the whole dock, and that’s what the logic gives you. The theory only reached the evidence with help. Blaming the law alone is the tidy story, and saying nothing was refuted goes too far the other way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 108, dock: 1, rope: 1,
    text: 'Uranus once moved wrongly. Le Verrier kept Newton and blamed a planet nobody had seen.',
    dur: 4.8,
  },
  {
    p: 424, x: 108, dock: 1, rope: 1,
    quote: {
      id: 'lq-epistemology-knowledge-40-1',
      text: 'Our statements about the external world face the tribunal of sense experience not individually but as a corporate body.',
      author: 'W. V. O. Quine',
      philosopherId: 'willard-van-orman-quine',
      work: 'Two Dogmas of Empiricism',
      era: '1951',
      branchSlugs: ['epistemology'],
    },
    dur: 4.6,
  },
  {
    p: 382, x: 108, dock: 1, rope: 1,
    text: 'Neptune turned up where he pointed. Then Mercury wobbled, and the same move found nothing.',
    dur: 4.8,
  },
  {
    p: 265, x: 108, dock: 1, rope: 1, verdict: 1,
    interact: {
      prompt: 'Mercury kept wobbling. Which part was at fault?',
      sort: {
        chip: 'Mercury\'s wobble',
        bins: [
          { id: 'law', label: 'the law', reads: 'gravity itself is wrong, and must be replaced', correct: true },
          { id: 'orbit', label: 'the orbit', reads: 'a planet nobody has spotted is tugging on it' },
          { id: 'lens', label: 'the lens', reads: 'the telescopes are out of true' },
        ],
      },
      explain: 'The law. Einstein got Mercury right by replacing Newton, not by adding a planet. The trap is that the hidden-planet move had just worked brilliantly. Same reasoning, same confidence, opposite answer. Nothing in the evidence says which case you’re in.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 452, x: 108, dock: 1, rope: 1,
    summary: {
      title: 'On Trial Together',
      points: [
        'A theory reaches the evidence with help',
        'A failed test convicts the whole bundle',
        'You can always save a theory by blaming the help',
        'Which repair is honest is judgement, not proof',
      ],
      closing: 'Nothing here licenses rescuing any theory you please. Evidence never names the culprit for you.',
    },
    dur: 4.2,
  },
];
