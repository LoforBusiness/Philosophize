import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-13, "One Step to the Bottom of the Hill"
//
// THE PICTURE: four steps going down a hill, and the JOINS between them. The steps
// are the claims and everybody looks at those; the joins are where the reasons
// should be, and all three of them are empty (H64).
//
// A slippery slope is almost always taught by mocking the ending, which teaches the
// wrong lesson — that the fallacy is being far-fetched. Drawing the joins puts the
// fault where it is: at the first place a step was asserted instead of earned, and
// that is usually the very first one, long before anything sounds silly.
//
// STAGING: the four steps ARE the Q1 targets, so the reader answers by pointing at
// the argument rather than at a description of it (E33). The deck question then
// names the misdiagnosis the picture has just ruled out (H66).

export interface Log13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many steps are down, 0…4. */ steps?: number;
  /** The empty joins between them, 0…1. */ joins?: number;
  /** The honest slope shown alongside, 0…1. */ honest?: number;
  /** 1 = the four steps are live targets (Q1). */ pick?: number;
  /** 1 = a highlight ring lands on step three, then step four, following the sentence as it names each in turn. */ trace?: number;
}

export const BEATS: Log13Beat[] = [
  {
    g: 25, steps: 1,
    dur: 4.2,
    text: 'Consider a modest proposal: one student may retake one quiz. On its own, the proposal is uncontroversial.',
  },
  {
    g: 465, steps: 4,
    dur: 2.6,
    text: 'A slippery-slope argument claims that this step will set off a chain of worse ones. First, students will demand to retake every test.',
    cite: 'A chain of predictions',
  },
  {
    g: 465, steps: 4, trace: 1,
    dur: 2.4,
    text: 'Next, grades will lose their meaning. So, the argument concludes, no retakes at all should be allowed.',
  },
  {
    g: 383, steps: 4, joins: 1,
    dur: 4.8,
    text: 'Each step in the chain is a claim. Between the steps there should be reasons, and this argument gives none.',
    cite: 'The missing links',
  },
  {
    g: 128, steps: 4, joins: 1,
    dur: 3.8,
    quote: {
      id: 'lq-logic-arguments-13',
      text: 'The slippery slope argument claims that a particular act, seemingly innocuous when taken in isolation, may yet lead to a future host of increasingly pernicious events.',
      author: 'Frederick Schauer',
      work: 'Slippery Slopes',
      era: '1985',
      branchSlugs: ['logic'],
    },
  },
  {
    g: 419, steps: 4, joins: 1, honest: 1,
    dur: 5.0,
    text: 'A slope argument is legitimate when each step has evidence. Alcohol slows reactions, and slower reactions raise crash risk.',
    cite: 'A slope argument that holds',
  },
  {
    g: 467, steps: 4, joins: 1, honest: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which is the first step asserted without a supporting reason?',
      explain: 'The second step. Nothing explains why one retake would lead students to demand a retake of every test. The argument fails at this first unsupported step, not at its alarming conclusion. Every later step depends on it.',
      xp: 5,
    },
  },
  {
    g: 41, steps: 4, joins: 1, honest: 1,
    dur: 1.0,
    interact: {
      prompt: 'Where does a fallacious slippery-slope argument go wrong?',
      sort: {
        chip: 'the slippery slope',
        bins: [
          { id: 'ending', label: 'an extreme conclusion', reads: 'the conclusion is too extreme to be credible' },
          { id: 'length', label: 'too many steps', reads: 'the chain contains too many steps' },
          { id: 'joins', label: 'unsupported step', reads: 'a step is asserted with no reason given', correct: true },
        ],
      },
      explain: 'An unsupported step. An extreme conclusion can be justified if each step leading there is supported. A modest conclusion is still fallacious if a step is only asserted. The number of steps isn’t the fault either. The fault lies in the links between the steps.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Where Slippery Slopes Fail',
      points: [
        'A slippery slope asserts a chain it never argues',
        'It fails at the first unsupported link, not at the end',
        'Fear of the conclusion distracts from the missing reasons',
        'A legitimate slope argument gives evidence for every step',
      ],
      closing: 'To assess a slope argument, ask which steps are supported by evidence and which are only asserted.',
    },
    dur: 3.0,
  },
];
