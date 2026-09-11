import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-38, "You Know How It Ends"
// Theme: TWO BARS A SCENE — WHAT YOU KNOW, AND WHAT YOU FEEL.
//
// The paradox is a disagreement between two quantities, so it is drawn as two
// bars in each of five scenes. WHAT YOU KNOW is full height from the opening
// frame, because you have seen the film. WHAT YOU FEEL climbs anyway. A reader
// who looks at the chart has the problem before a word of it is explained.
//
// Under the chart stand the three claims themselves, because a paradox is not a
// puzzle about the world, it is a list that cannot all be true — and the work is
// deciding which entry to lose.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — the three claims, and the reader taps the one that
//     has to go. On the stage because they have to be read side by side, which is
//     what makes it obvious that two of them are observations.
//   · beat 7  a POLL — what suspense runs on, with the people who said each. The
//     chart is the readout: say you set your knowledge aside and the KNOW bars sag
//     in the middle, say you forget outright and they drop away.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the chart's baseline, scene numbers and legend are drawn. */ chart?: number;
  /** How many of the five scenes have their two bars, 0…1. */ bars?: number;
  /** 1 = the three claims stand under the chart. */ claims?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics38Beat[] = [
  {
    p: 172, x: 52, chart: 1,
    text: 'You’ve seen this one. You know he gets out of the building.',
    dur: 3.4,
  },
  {
    p: 2, x: 52, chart: 1, bars: 1,
    text: 'Two bars a scene. What you know runs flat and full from the opening frame, and what you feel climbs anyway.',
    dur: 4.6,
  },
  {
    p: 47, x: 52, chart: 1, bars: 1, claims: 1,
    text: 'Three claims, and they cannot all stand.',
    dur: 2.6,
  },
  {
    p: 165, x: 52, chart: 1, bars: 1, claims: 1, live: 1,
    interact: {
      prompt: 'Tap the claim that has to go.',
      explain: 'The theory goes, because the other two are things you can check tonight. You know the ending, and you can feel your own shoulders. When a list holds two observations and one assumption, the assumption is what gives.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 52, chart: 1, bars: 1, claims: 1,
    text: 'Greek crowds knew the myths by heart. Nobody in the seats sat wondering how it would end.',
    dur: 4.4,
  },
  {
    p: 35, x: 98, chart: 1, bars: 1, claims: 1,
    text: 'Coleridge had a phrase for what an audience does instead, and it is not forgetting.',
    dur: 3.6,
  },
  {
    p: 433, x: 98, chart: 1, bars: 1, claims: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-38-1',
      text: 'That willing suspension of disbelief for the moment, which constitutes poetic faith.',
      author: 'Samuel Taylor Coleridge',
      work: 'Biographia Literaria',
      era: '1817',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.2,
  },
  {
    p: 176, x: 98, chart: 1, bars: 1, claims: 1,
    interact: {
      prompt: 'What is the suspense running on?',
      poll: {
        options: [
          { id: 'setaside', reads: 'you set what you know aside while it runs', holders: ['Samuel Taylor Coleridge'] },
          { id: 'stake', reads: 'something at stake, watched as it arrives', holders: ['Aristotle'], correct: true },
          { id: 'forget', reads: 'you genuinely forget the ending each time' },
        ],
      },
      explain: 'Something at stake, held in front of you moment by moment. Forgetting fails a simple test: recite the ending during the scene and the feeling is still there. Setting knowledge aside is closer, and it still owes an account of what’s left to be tense about.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Knowing and Feeling',
      points: [
        'Suspense survives knowing exactly what happens',
        'Two of the three claims can simply be checked',
        'So the theory of suspense is what gives way',
        'Stakes and attention do the work doubt was credited with',
      ],
      closing: 'That’s why a story you love holds up on a fifth reading, and a spoiler costs less than people fear. What you lose is surprise, and surprise was never the same thing.',
    },
    dur: 3.6,
  },
];
