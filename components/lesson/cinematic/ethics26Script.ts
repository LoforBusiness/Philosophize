import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-26, "Who Counts, And Why?"
// Theme: A ROW OF BEINGS AND A GATE THAT DECIDES WHERE THE CIRCLE STOPS.
//
// Drawing moral status as a CIRCLE is the usual picture and it hides the thing
// that matters: circles have no order, so nothing shows which beings are near the
// line. A rail does. Rock, plant, fish, chimpanzee, person, in the order the
// candidate criteria actually rank them — and one gate, which is the criterion.
//
// The gate is a single object at every setting. Sentience, personhood and species
// are not three different kinds of line, they are one line in three places, and a
// picture with three gates would lose that.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the
//     species-only answer is charged with. On the stage because the gate is
//     already standing at that setting, with almost everything outside it.
//   · beat 8  a SORT — the criterion itself, dropped into a bin. The gate walks to
//     wherever the reader's answer puts it, so choosing a criterion is watching
//     the circle change size.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the five beings stand on the rail, 0…1. */ rail?: number;
  /** 1 = the line is drawn, at the species setting. */ line?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics26Beat[] = [
  {
    p: 355, x: 28, rail: 0.4,
    text: 'Kicking a rock is nothing, and kicking a dog is something. Where is the line?',
    dur: 4.6,
  },
  {
    p: 170, x: 28, rail: 1,
    text: 'Moral status means mattering in your own right, rather than mattering as a tool for somebody.',
    dur: 4.8,
  },
  {
    p: 435, x: 28, rail: 1,
    text: 'Three answers compete. Being able to suffer, being able to plan a life, and being human.',
    dur: 5.0,
  },
  {
    p: 258, x: 28, rail: 1, line: 1,
    text: 'Here is the last of them, drawn. Everything but the person falls outside.',
    dur: 4.6,
  },
  {
    p: 163, x: 28, rail: 1, line: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what that last answer is accused of.',
      explain: 'Speciesism. Being human is a biological label rather than a capacity, so on its own it is not the kind of thing that can ground a duty. You may resist the charge — but then you have to name what humanity tracks that matters.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 88, rail: 1, line: 1,
    text: 'Person and human come apart. A person plans, reflects and knows it has a future.',
    dur: 4.8,
  },
  {
    p: 430, x: 88, rail: 1, line: 1,
    quote: {
      id: 'lq-ethics-ethics-26-1',
      text: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      philosopherId: 'jeremy-bentham',
      work: 'An Introduction to the Principles of Morals and Legislation',
      era: '1789',
      branchSlugs: ['ethics'],
    },
    dur: 4.8,
  },
  {
    p: 439, x: 88, rail: 1, line: 1,
    text: 'Each criterion moves the gate, and each one lets a different crowd through.',
    dur: 4.6,
  },
  {
    p: 176, x: 88, rail: 1, line: 1,
    interact: {
      prompt: 'What should the gate be set to?',
      sort: {
        chip: 'the line that decides',
        bins: [
          { id: 'suffer', label: 'can suffer', reads: 'anything with something at stake is in', correct: true },
          { id: 'plan', label: 'can plan', reads: 'only beings who know they have a future' },
          { id: 'human', label: 'is human', reads: 'the human species, and nothing else' },
        ],
      },
      explain: 'Suffering. It is the one criterion that names a stake rather than a category, which is what a duty needs something to be about. Planning is the serious rival and it has a cost: it puts some humans outside the gate. Species alone names no stake at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 343, x: 88, rail: 1, line: 1,
    summary: {
      title: 'Where the Circle Stops',
      points: [
        'Moral status is mattering for your own sake',
        'Suffering, planning and species are the candidates',
        'Person and human are not the same category',
        'Species on its own names a label, not a stake',
      ],
      closing: 'Drawing this line is one of the oldest acts in ethics, and one of the few where moving it has changed how whole populations are treated.',
    },
    dur: 5.0,
  },
];
