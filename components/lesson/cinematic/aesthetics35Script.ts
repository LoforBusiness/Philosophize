import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-35, "Why Is Anything Funny?"
// Theme: ONE SETUP, TWO TRACKS, AND THE MOMENT THE POINTS SWITCH.
//
// A joke is drawn as railway track. One line runs in from the setup; at the
// punchline it splits, and the reader watches the train take the branch nobody
// was looking at. Both branches are drawn solid, because the second reading has
// to fit as well as the first — a joke where it does not is just a mistake.
//
// The lesson's own best evidence is played rather than stated: on beat 6 the
// second branch is drawn in BEFORE the split arrives, and the swap plays with
// the surprise pre-empted. That is an explained joke, shown.
//
// GAMIFIED SHAPE:
//   · beat 3  a SCENE TARGET — three endings on three branches; tap the one that
//     lands. The two wrong ones fail for different reasons (one does not fit at
//     all, one fits too obviously), which is the actual teaching.
//   · beat 7  two CARDS — the case against superiority.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the incoming setup track is drawn. */ track?: number;
  /** 1 = the three branches are drawn. */ split?: number;
  /** How far the train has run along the chosen branch, 0…1. */ run?: number;
  /** 1 = the second reading is drawn IN ADVANCE — the explained joke. */ spoil?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics35Beat[] = [
  {
    p: 25, x: 56, track: 1,
    text: 'A joke is a piece of track. The setup runs you along it, and you already know where you are going.',
    dur: 3.8,
  },
  {
    p: 2, x: 56, track: 1, split: 1,
    text: 'Here is the setup. I told my doctor I broke my arm in two places. You are in a surgery now, waiting for the diagnosis.',
    dur: 4.4,
  },
  {
    p: 4, x: 56, track: 1, split: 1, live: 1,
    interact: {
      prompt: 'Three endings sit on three branches. Tap the one that lands.',
      explain: 'He told me to stop going to those places. It fits perfectly and it is not the line you were on. That gap is the joke. The hospital ending fits and surprises nobody. The umbrella surprises and fits nothing, which is a mistake.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 56, track: 1, split: 1, run: 1,
    text: 'Both readings had to fit. That is the part people miss. A punchline that does not fit the setup is not surprising, it is wrong.',
    dur: 4.6,
  },
  {
    p: 47, x: 56, track: 1, split: 1, run: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-35-1',
      text: 'Laughter is an affection arising from a strained expectation being suddenly reduced to nothing.',
      author: 'Immanuel Kant',
      work: 'Critique of the Power of Judgment',
      era: '1790',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 12, x: 56, track: 1, split: 1, run: 1, spoil: 1,
    text: 'Now watch it with the second line drawn in first. Same words, same swap, and nothing happens. That is what explaining a joke does to it.',
    dur: 4.8,
  },
  {
    p: 35, x: 128, track: 1, split: 1, spoil: 1,
    text: 'Which is why the old theories only half work. Hobbes said we laugh at someone beneath us. Freud said we let out pressure.',
    dur: 4.4,
  },
  {
    p: 45, x: 128, track: 1, split: 1, spoil: 1,
    interact: {
      prompt: 'What sinks the idea that laughing needs a victim?',
      cards: [
        { text: 'A pun humiliates nobody', correct: true },
        { text: 'People laugh when alone', correct: false },
      ],
      explain: 'Laughing alone is fine for the theory — you can feel superior with nobody watching. The pun is the problem. It is funny with nobody beneath anybody, and a theory of humour has to cover the whole range or it is a theory of mockery.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Swap',
      points: [
        'A joke builds one reading and delivers a second',
        'Both readings have to genuinely fit',
        'Explaining hands over the second in advance',
        'Superiority and relief cover only some cases',
      ],
      closing: 'It is the one art whose success is measured by an involuntary noise. No wonder it resists being explained by people writing carefully.',
    },
    dur: 3.0,
  },
];
