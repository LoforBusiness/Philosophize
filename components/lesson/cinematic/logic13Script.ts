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
}

export const BEATS: Log13Beat[] = [
  {
    g: 25, steps: 1,
    dur: 4.2,
    text: 'Let one student retake one quiz. That is the whole proposal, and nobody in the room objects to it.',
  },
  {
    g: 45, steps: 4,
    dur: 2.6,
    text: 'Then it arrives with company. They will want to retake every test.',
    cite: 'And then, and then',
  },
  {
    g: 45, steps: 4,
    dur: 2.4,
    text: 'Grades will stop meaning anything. So we cannot allow the retake.',
  },
  {
    g: 13, steps: 4, joins: 1,
    dur: 4.8,
    text: 'Look at the gaps instead of the steps. Every step is a claim and every gap is a reason that never turned up.',
    cite: 'The joins',
  },
  {
    g: 137, steps: 4, joins: 1,
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
    g: 5, steps: 4, joins: 1, honest: 1,
    dur: 5.0,
    text: 'A slope can be honest. One drink slows your reactions, slower reactions raise crash risk, and both of those have been measured.',
    cite: 'A slope that holds',
  },
  {
    g: 4, steps: 4, joins: 1, honest: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the first step that has not been earned.',
      explain: 'The second one, and that it comes FIRST is the whole lesson. A slope does not fail at the alarming end. It fails at the first join nobody argued for. Nothing says why one retake produces a demand for all of them. After that, every step is free.',
      xp: 5,
    },
  },
  {
    g: 41, steps: 4, joins: 1, honest: 1,
    dur: 1.0,
    interact: {
      prompt: 'Set the lever to what makes a slope a fallacy.',
      lever: {
        start: 0,
        stops: [
          { id: 'ending', reads: 'the ending is too far-fetched to take seriously' },
          { id: 'length', reads: 'the chain simply has too many steps in it' },
          { id: 'joins', reads: 'a step is asserted with no reason given', correct: true },
        ],
      },
      explain: 'The far setting. The first is the one most people pick, and it is why the fallacy keeps working. An alarming ending is fine if every step to it is argued, and a modest ending is still a slope if they are not. The fault lives in the joins.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Missing Middle',
      points: [
        'A slippery slope asserts a chain it never argues',
        'It fails at the first unearned link, not at the end',
        'Dread of the bottom hides the missing middle',
        'A real slope shows evidence for every step',
      ],
      closing: 'Ask which step is proven and which is just dread. Usually the answer is the second one.',
    },
    dur: 3.0,
  },
];
