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
    text: 'Suppose a plant dies because no one waters it. The cause appears to be an absence, an omission.',
    dur: 4.4,
  },
  {
    p: 384, x: 52, plant: 1, wilt: 1, folk: 1,
    text: 'Consider four people who could have watered it. None of them did so all week.',
    dur: 3.6,
  },
  {
    p: 36, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'For each person, ask what would have happened had they watered it. In every case, the plant would have lived.',
    dur: 4.2,
  },
  {
    p: 159, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1, live: 1,
    interact: {
      prompt: 'Whose failure to water the plant would people ordinarily blame?',
      explain: 'The gardener. No fact about the plant singles the gardener out. A neighbour may have stood nearer, and a stranger may have seen the dry soil. What separates the gardener is a job, not a physical feature.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'The counterfactual test counts the gardener as a cause, but it counts the king and the stranger too.',
    dur: 3.8,
  },
  {
    p: 6, x: 98, plant: 1, wilt: 1, folk: 1, arrows: 1,
    text: 'The test comes from David Hume. One thing causes another if, without the first, the second wouldn’t have happened.',
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
      prompt: 'Of everything the fire needed, why name the gardener?',
      sort: {
        chip: 'THE GARDENER',
        bins: [
          { id: 'phys', label: 'PHYSICS PICKS IT', reads: 'the physics alone picks it out' },
          { id: 'half', label: 'HALF AND HALF', reads: 'half a fact, half a judgement' },
          { id: 'norms', label: 'WHAT WAS EXPECTED', reads: 'the duty they had picks the cause', correct: true },
        ],
      },
      explain: 'What was expected of them. The oxygen was as necessary as the missed watering, and physics can\'t separate the two. What singles out the gardener is a duty they had and didn\'t discharge, which is why causal selection looks like a question about norms.',
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
