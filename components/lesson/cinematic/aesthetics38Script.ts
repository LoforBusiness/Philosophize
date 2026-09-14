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
    text: 'Suppose you watch a thriller for the second time. You already know that the hero escapes the building.',
    dur: 3.4,
  },
  {
    p: 2, x: 52, chart: 1, bars: 1,
    text: 'In every scene, what you know is complete from the first frame. Yet what you feel still rises.',
    dur: 4.6,
  },
  {
    p: 47, x: 52, chart: 1, bars: 1, claims: 1,
    text: 'The paradox of suspense sets out three claims that can’t all be true. You know the ending, you’re still tense, and suspense requires doubt.',
    dur: 2.6,
  },
  {
    p: 165, x: 52, chart: 1, bars: 1, claims: 1, live: 1,
    interact: {
      prompt: 'Which claim should be given up to resolve the paradox of suspense?',
      explain: 'Suspense needs doubt. The other two claims are things any viewer can check: you know the ending, and you feel tense. So the theory is the one to drop. Robert Yanal disagrees. He holds that repeat viewers feel only anticipation.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 52, chart: 1, bars: 1, claims: 1,
    text: 'The puzzle is old. Greek tragedies usually retold traditional myths, whose outcomes were fixed before the play began.',
    dur: 4.4,
  },
  {
    p: 35, x: 98, chart: 1, bars: 1, claims: 1,
    text: 'Samuel Taylor Coleridge described engagement with fiction as a willing act, not a lapse of memory.',
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
      prompt: 'When you already know the ending, what produces your suspense?',
      poll: {
        options: [
          { id: 'setaside', reads: 'imagining that it might end otherwise', holders: ['Noël Carroll'] },
          { id: 'stake', reads: 'a frustrated wish to affect the outcome', holders: ['Aaron Smuts'], correct: true },
          { id: 'forget', reads: 'failing to use what you know of the ending', holders: ['Richard Gerrig'] },
        ],
      },
      explain: 'A frustrated wish to affect the outcome. On this view, suspense needs no doubt, so a known ending doesn’t end it. Imagining another ending still makes suspense need doubt, if only imagined doubt.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Knowing and Feeling',
      points: [
        'Suspense survives knowing exactly what happens',
        'Two of the three claims are observations',
        'So the claim that suspense needs doubt gives way',
        'Caring about an outcome can produce suspense without doubt',
      ],
      closing: 'If suspense doesn’t need doubt, a favourite story can stay gripping on rereading. A spoiler removes surprise, but surprise and suspense are different things.',
    },
    dur: 3.6,
  },
];
