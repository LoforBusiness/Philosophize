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
    p: 172, x: 200, voices: 0.25, agree: 0.22,
    text: 'Suppose one source reports a surprising claim. With only one source, it’s reasonable to believe it tentatively.',
    dur: 3.6,
  },
  {
    p: 2, x: 200, voices: 1, agree: 0.9,
    text: 'Then three more sources report the same claim: a paper, a friend and a podcast.',
    cite: 'Four confirmations',
    dur: 2.5,
  },
  {
    p: 266, x: 200, voices: 1, agree: 0.9,
    text: 'Your confidence rises, and rightly so: four independent confirmations would be strong evidence.',
    dur: 2.1,
  },
  {
    p: 45, x: 132, voices: 1, agree: 0.9, wires: 1,
    text: 'But three of the four sources are repeating the same original post.',
    dur: 3.8,
  },
  {
    p: 13, x: 132, voices: 1, agree: 0.32, wires: 1,
    text: 'No source has retracted its claim, and all four still agree.',
    cite: 'One source, echoed',
    dur: 2.5,
  },
  {
    p: 266, x: 132, voices: 1, agree: 0.32, wires: 1,
    text: 'Yet there were never four independent sources, only two: one post and one reporter’s own legwork.',
    dur: 1.8,
  },
  {
    p: 165, x: 132, voices: 1, agree: 0.32, wires: 1, live: 1,
    interact: {
      prompt: 'Which source adds evidence of its own?',
      explain: 'A reporter. The reporter’s wire runs to their own legwork, while the other three repeat one post. Agreement adds evidence only when each source could have found out independently.',
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
    p: 380, x: 268, voices: 1, agree: 0.32, wires: 1,
    text: 'A social media feed favours posts shared by people like you. So the agreement in a feed often looks independent when it isn’t.',
    dur: 4.4,
  },
  {
    p: 383, x: 268, voices: 1, agree: 0.32, wires: 1,
    interact: {
      prompt: 'When does a report, or agreement among reports, count as evidence for a claim?',
      poll: {
        options: [
          { id: 'real', reads: 'only independent agreement counts', holders: ['Alvin Goldman'], correct: true },
          { id: 'reach', reads: 'when reports have matched the facts before', holders: ['David Hume'] },
          { id: 'both', reads: 'by default, absent a specific reason to doubt it', holders: ['Thomas Reid', 'C.A.J. Coady'] },
          { id: 'noise', reads: 'when you have good reason to trust an expert', holders: ['John Hardwig'] },
        ],
      },
      explain: 'Only independent agreement counts. A source that repeats another adds no evidence. Reid’s default trust doesn’t ask where a report came from.',
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
