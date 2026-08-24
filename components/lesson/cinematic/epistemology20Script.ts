import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-20, "Knowing Together In A Noisy World"
// Theme: FOUR SOURCES AGREEING, AND ONE WIRE BEHIND THREE OF THEM.
//
// The reason an echo chamber fools clever people is arithmetic, not stupidity:
// four independent confirmations really are strong evidence, and the mind counts
// confirmations without asking where each came from. So the scene lets the count
// do its honest work first — the confidence bar climbs, correctly, as each
// source reports — and only then draws what is behind them.
//
// Nothing is retracted when the wires appear. Every source still says what it
// said. What collapses is the COUNT, which was never four.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — four sources, tap the one that adds something. The
//     decoys all reported the claim and all look exactly as credible; the only
//     difference on the stage is where their wire goes (H66).
//   · beat 7  two CARDS — what actually makes a second report worth anything.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the four sources have reported, 0…1. */ voices?: number;
  /** How full the confidence bar is, 0…1. */ agree?: number;
  /** The wires behind the sources, drawn, 0…1. */ wires?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epi20Beat[] = [
  {
    p: 25, x: 200, voices: 0.25, agree: 0.22,
    text: 'You read something surprising. One source, and you hold it loosely.',
    dur: 3.6,
  },
  {
    p: 2, x: 200, voices: 1, agree: 0.9,
    text: 'Then three more say it. A paper, a friend, a podcast. The bar climbs, and it is right to climb.',
    cite: 'Four confirmations',
    dur: 4.6,
  },
  {
    p: 45, x: 132, voices: 1, agree: 0.9, wires: 1,
    text: 'Now the wiring. Three of those four are repeating the same original post.',
    dur: 3.8,
  },
  {
    p: 13, x: 132, voices: 1, agree: 0.32, wires: 1,
    text: 'Nobody retracted anything. They all still say it. The count was never four.',
    cite: 'One source, echoed',
    dur: 4.0,
  },
  {
    p: 4, x: 132, voices: 1, agree: 0.32, wires: 1, live: 1,
    interact: {
      prompt: 'Tap the source that actually adds something.',
      explain: 'The one whose wire goes somewhere else. The other three are equally sincere and equally confident, and between them they carry exactly one report. Agreement is only evidence when the people agreeing could have found out separately.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, voices: 1, agree: 0.32, wires: 1,
    quote: {
      id: 'lq-epistemology-knowledge-20-1',
      text: 'He who knows only his own side of the case knows little of that.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      philosopherId: 'john-stuart-mill',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 21, x: 268, voices: 1, agree: 0.32, wires: 1,
    text: 'A feed is built to show you what people like you already share. It manufactures this picture by default.',
    dur: 4.4,
  },
  {
    p: 41, x: 268, voices: 1, agree: 0.32, wires: 1,
    interact: {
      prompt: 'What makes a second report worth anything?',
      cards: [
        { text: 'It could have come out differently', correct: true },
        { text: 'It comes from a big name', correct: false },
      ],
      explain: 'That it could have come out differently. A second source counts when it had its own way of checking and might have said no. A big name repeating what somebody else posted adds reach, not evidence, and reach is what feels like confirmation.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Counting Sources, Not Voices',
      points: [
        'Independent agreement is strong evidence, and rare',
        'Repetition raises how often you hear it, not how likely it is',
        'Ask where each source got it before adding them up',
        'A feed selects for people who already agree with you',
      ],
      closing: 'Four voices, one wire. The bar had been measuring volume.',
    },
    dur: 3.4,
  },
];
