import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-39, "Can Nothing Cause Something?"
// Theme: FOUR PEOPLE WHO DID NOT WATER IT, AND ONE OF THEM GETS BLAMED.
//
// An absence has nothing to draw, so the scene draws the CANDIDATES instead: a
// wilting plant on the right, four named plates on the left, and a dashed run
// from each plate to the plant. Every one of those runs is exactly as real as the
// others, which is the difficulty stated as a picture.
//
// The dashes matter. A solid arrow would say a force travelled, and nothing did:
// what connects these plates to the plant is a question about what would have
// happened, not a push.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — four plates, and the reader taps the absence we
//     actually blame. It is a question about which of four identical lines is
//     special, and only the stage can ask that.
//   · beat 7  a SPLIT — what picks that one out. The lines are the readout: give
//     the bar to the physics and all four brighten together, give it to what was
//     expected and three of them fade out under the reader's thumb.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the plant is on stage. */ plant?: number;
  /** How far it has wilted, 0 (upright) … 1 (down). */ wilt?: number;
  /** 1 = the four named plates stand on the left. */ folk?: number;
  /** 1 = the dashed runs join each plate to the plant. */ arrows?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics39Beat[] = [
  {
    p: 25, x: 52, plant: 1, wilt: 1,
    text: 'The plant died because nobody watered it. That sentence is true, and nobody is a great many people.',
    dur: 4.4,
  },
  {
    p: 384, x: 52, plant: 1, wilt: 1, folk: 1,
    text: 'Here are four of them. Not one of them lifted a watering can all week.',
    dur: 3.6,
  },
  {
    p: 36, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'Ask what would have happened if each had watered it, and every answer is the same. The plant lives.',
    dur: 4.2,
  },
  {
    p: 159, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1, live: 1,
    interact: {
      prompt: 'Tap the absence anyone would actually blame.',
      explain: 'The gardener, and no fact about the plant says so. A neighbour may have stood nearer and a stranger may have seen it was dry. What separates the gardener from the other three is a job, which isn’t a feature of the soil.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'The test that finds the gardener finds the king too, and a stranger three streets away.',
    dur: 3.8,
  },
  {
    p: 6, x: 98, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'The test is old. David Hume wrote the line, and philosophers still reach for the same one.',
    dur: 4.2,
  },
  {
    p: 433, x: 98, plant: 1, wilt: 1, folk: 1, arrows: 1,
    quote: {
      id: 'lq-metaphysics-being-39-1',
      text: 'Where, if the first object had not been, the second never had existed.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.2,
  },
  {
    p: 21, x: 98, plant: 1, wilt: 1, folk: 1, arrows: 1,
    interact: {
      prompt: 'What picks the gardener out of the four?',
      split: {
        left: 'THE PHYSICS', right: 'WHAT WAS EXPECTED',
        start: 0.92,
        zones: [
          { id: 'norms', upto: 0.3, reads: 'the expectation picks it out, and physics cannot', correct: true },
          { id: 'both', upto: 0.62, reads: 'half a fact, half a judgement about who should have' },
          { id: 'physics', upto: 1, reads: 'the physics alone, so the king is a cause as well' },
        ],
      },
      explain: 'Almost all of it is the expectation. Hand the bar to the physics and watch all four runs come back. That’s what the world alone can tell you. The plant still died of thirst. Naming one absence is a further step, and it goes through a duty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Water That Never Came',
      points: [
        'Absences pass the usual test for causes',
        'So do far too many of them at once',
        'What was expected picks out the one we name',
        'The full account and the named cause differ',
      ],
      closing: 'Next time a report blames somebody for not acting, ask who else didn’t act. The list is always long, and what shortens it is never physics.',
    },
    dur: 3.4,
  },
];
