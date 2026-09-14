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
    text: 'The setup of a joke leads you along one reading, like a train on a single track. You come to expect a particular ending.',
    dur: 3.8,
  },
  {
    p: 466, x: 56, track: 1, split: 1,
    text: 'The setup line reads, “I told my doctor I broke my arm in two places.”',
    dur: 2.6,
  },
  {
    p: 394, x: 56, track: 1, split: 1,
    text: 'On the natural reading, the two places are points on the arm, and you’re waiting for a diagnosis.',
    dur: 1.8,
  },
  {
    p: 380, x: 56, track: 1, split: 1, live: 1,
    interact: {
      prompt: 'Which of the three endings turns the setup into a joke?',
      explain: 'The ending “stop going there” fits a second reading, on which the places are locations you visit. The switch between readings is the joke. The hospital ending fits but surprises no one. The umbrella surprises but fits nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 56, track: 1, split: 1, run: 1,
    text: 'The incongruity theory says a joke is funny because it breaks what you expect. But both readings must still fit the same words.',
    dur: 2,
  },
  {
    p: 467, x: 56, track: 1, split: 1, run: 1,
    text: 'A punchline that fits no reading of the setup is an error, not a surprise.',
    dur: 2.6,
  },
  {
    p: 440, x: 56, track: 1, split: 1, run: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-35-1',
      text: 'Laughter is an affection arising from a strained expectation being suddenly reduced to nothing.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Critique of the Power of Judgment',
      era: '1790',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 12, x: 56, track: 1, split: 1, run: 1, spoil: 1,
    text: 'Suppose the second reading is shown before the punchline arrives. The words and the switch are the same, but the joke is no longer funny.',
    dur: 3.1,
  },
  {
    p: 12, x: 56, track: 1, split: 1, run: 1, spoil: 1,
    text: 'Explaining a joke reveals the second reading in advance, and so removes the surprise.',
    dur: 1.8,
  },
  {
    p: 167, x: 128, track: 1, split: 1, spoil: 1,
    text: 'Thomas Hobbes held that you laugh when you suddenly feel above someone. His superiority theory explains only some jokes.',
    dur: 3.3,
  },
  {
    p: 167, x: 128, track: 1, split: 1, spoil: 1,
    text: 'Sigmund Freud’s relief theory holds that a joke releases energy normally used to repress the feelings it expresses.',
    dur: 1.8,
  },
  {
    p: 379, x: 128, track: 1, split: 1, spoil: 1,
    interact: {
      prompt: 'Which case refutes the superiority theory’s claim that laughter needs a victim?',
      sort: {
        chip: 'laughter needs a victim',
        bins: [
          { id: 'alone', label: 'laughing alone', reads: 'laughter with no one present to look down on' },
          { id: 'kind', label: 'mocking nobody', reads: 'people who laugh but never mock anyone' },
          { id: 'pun', label: 'a pun', reads: 'a pun amuses without humiliating anyone', correct: true },
        ],
      },
      explain: 'A pun. Laughing alone fits the superiority theory, since Hobbes allows pride in one’s own sudden act. People who never mock may still feel superior. A pun, however, amuses without placing anyone beneath anyone. Francis Hutcheson raised this objection against Hobbes.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Switch in a Joke',
      points: [
        'A joke builds one reading and delivers a second',
        'Both readings must fit the setup',
        'Explaining a joke reveals the second reading early',
        'Superiority and relief theories explain only some humour',
      ],
      closing: 'The incongruity theory explains why a joke needs surprise. It also explains why an explained joke stops being funny.',
    },
    dur: 3.0,
  },
];
