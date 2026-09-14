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
    text: 'Gravity has never failed. Yet never failing is different from having to hold.',
    dur: 4.6,
  },
  {
    p: 159, x: 28, bags: 1,
    text: 'Consider two bags of marbles. Every marble in both bags is blue.',
    dur: 3.8,
  },
  {
    p: 435, x: 28, bags: 1, machine: 1,
    text: 'In the second bag, a machine paints each marble blue before it enters. In the first, every marble is blue by accident.',
    dur: 5.0,
  },
  {
    p: 264, x: 28, bags: 1, machine: 1,
    text: 'David Hume found no necessary connection between events. For him, a law is only a pattern that always holds.',
    dur: 5.0,
  },
  {
    p: 167, x: 28, bags: 1, machine: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which objection counts against treating laws as mere patterns?',
      explain: 'A fluke fits. If a law is only what always happens, the accidental bag is as lawful as the machine-fed one. The claim that laws change misdescribes the view, since a pattern that changed was never exceptionless.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 447, x: 88, bags: 1, machine: 1,
    text: 'David Armstrong held that a law is a link of necessitation between properties, such as heat and volume.',
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
    text: 'Dispositional essentialism puts the necessity inside things. Mass attracts because attracting is part of what mass is.',
    dur: 5.0,
  },
  {
    p: 176, x: 88, bags: 1, machine: 1,
    interact: {
      prompt: 'Which account treats a law as governing objects, rather than flowing from their natures?',
      poll: {
        options: [
          { id: 'pattern', reads: 'nothing: a law only records a regularity', holders: ['David Hume', 'David Lewis'] },
          { id: 'law', reads: 'a relation between properties, forcing the fall', holders: ['David Armstrong', 'Fred Dretske'], correct: true },
          { id: 'power', reads: 'a power the stone has by its nature', holders: ['Alexander Bird', 'Brian Ellis'] },
        ],
      },
      explain: 'A relation between properties, forcing the fall. The law links two properties, so it holds in every case and a fluke has no such link. The powers view puts the force inside each thing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bags: 1, machine: 1,
    summary: {
      title: 'Three Accounts of Natural Law',
      points: [
        'The regularity view: a law is only an exceptionless pattern',
        'A pattern alone can’t separate a law from an accidental regularity',
        'Armstrong: a law is necessitation between properties',
        'Dispositional essentialism: the necessity lies in objects’ powers',
      ],
      closing: 'The claim “the sun rises every day” differs from the claim “the sun must rise”. These accounts disagree about what the second adds.',
    },
    dur: 5.0,
  },
];
