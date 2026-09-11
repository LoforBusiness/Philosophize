import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-27, "Do the Laws of Nature Compel?"
// Theme: TWO BAGS OF BLUE MARBLES, AND A MACHINE OVER ONLY ONE OF THEM.
//
// The disagreement is invisible in the evidence, so the scene draws the evidence
// twice and puts the difference somewhere the evidence cannot reach. Both bags
// hold nothing but blue; only one has a thing above it making them blue. Every
// observation either side can cite is identical, which is the whole difficulty.
//
// The marbles are drawn from one style in both bags. A picture that made the
// accidental bag look shakier would be settling the question by decoration, and
// the Humean's point is precisely that nothing in the marbles tells you.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the objection to
//     laws-as-patterns. On the stage because the accidental bag is standing
//     beside the forced one and looks exactly as lawful.
//   · beat 8  a POLL — what makes the stone fall. The reader's answer either
//     leaves the bags bare, hangs a machine over them, or puts the power inside
//     each marble, so a position is a place for the necessity to live.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the two bags are drawn, 0…1. */ bags?: number;
  /** 1 = the painting machine stands over the right-hand bag. */ machine?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics27Beat[] = [
  {
    p: 349, x: 28, bags: 0.5,
    text: 'Gravity has never once failed. Never failing is different from having to hold.',
    dur: 4.6,
  },
  {
    p: 159, x: 28, bags: 1,
    text: 'Here are two bags. Every marble in each of them is blue.',
    dur: 3.8,
  },
  {
    p: 435, x: 28, bags: 1, machine: 1,
    text: 'In the second, a machine paints each one on the way in. In the first it just happened.',
    dur: 5.0,
  },
  {
    p: 264, x: 28, bags: 1, machine: 1,
    text: 'David Hume saw only the pattern. For him, a law is the best short summary of what always happens.',
    dur: 5.0,
  },
  {
    p: 167, x: 28, bags: 1, machine: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the objection to laws as patterns.',
      explain: 'A fluke fits. If a law is only what always happens, the accidental bag counts as lawful too. Then nothing explains why the run keeps going. A pattern that changed was never exceptionless. And nobody sees a necessity either, which is the Humean point rather than a reply to it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 447, x: 88, bags: 1, machine: 1,
    text: 'David Armstrong answered that a law is a real relation. Being heated makes a metal expand.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, bags: 1, machine: 1,
    quote: {
      id: 'lq-metaphysics-being-27-1',
      text: 'Experience only teaches us how one event constantly follows another, without instructing us in the secret connexion which binds them together.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      branchSlugs: ['metaphysics'],
    },
    dur: 5.0,
  },
  {
    p: 448, x: 88, bags: 1, machine: 1,
    text: 'A third answer keeps the must and moves it inside. Heavy things pull by their nature.',
    dur: 5.0,
  },
  {
    p: 176, x: 88, bags: 1, machine: 1,
    interact: {
      prompt: 'What makes the stone fall every time?',
      poll: {
        options: [
          { id: 'pattern', reads: 'nothing does — the pattern simply repeats', holders: ['David Hume'] },
          { id: 'law', reads: 'a law above the stone, forcing the fall', holders: ['David Armstrong'], correct: true },
          { id: 'power', reads: 'a power the stone carries in itself' },
        ],
      },
      explain: 'A law above the stone, forcing the fall. Something has to separate the machine-fed bag from the accidental one, and a bare pattern can’t. The powers answer keeps the must and puts the force inside the stone rather than above the world.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bags: 1, machine: 1,
    summary: {
      title: 'Pattern or Power',
      points: [
        'Hume made a law an exceptionless pattern and no more',
        'A pattern alone cannot separate a law from a fluke',
        'Armstrong added a real relation between properties',
        'A third view puts the power inside the objects',
      ],
      closing: '“The sun rises every day” and “the sun must rise” are not the same claim. Working out what the second one adds is the whole of this argument.',
    },
    dur: 5.0,
  },
];
