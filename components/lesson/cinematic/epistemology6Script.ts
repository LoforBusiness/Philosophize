import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-6, "Can We Know Anything at All?" — the skeptics.
// A great balance holds two equal, opposing arguments — it never tips. The figure,
// done fighting over claims, settles into calm (ataraxia). Then the boast "NOTHING
// IS KNOWN" cracks under its own weight. Questions A/B/C/D.

export interface Epi6Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The balance of arguments present 0..1. */ bal?: number;
  /** The self-refuting claim block, cracking 0..1. */ crack?: number;
  /**
   * Boxes drawn into the route across the top of the stage, 0..3:
   * EQUAL REASONS → EPOCHE → ATARAXIA. It is the skeptic's whole method as a flow,
   * written one box at a time as the narration reaches each step.
   */
  route?: number;
}

export const BEATS: Epi6Beat[] = [
  {
    p: 444, bal: 1, crack: 0, route: 0,
    text: 'Could every belief be doubted? The ancient Pyrrhonian sceptics pressed doubt further than Descartes, who used doubt only as a method.',
    dur: 3.4,
  },
  {
    p: 176, bal: 1, route: 1,
    text: 'Scepticism asks whether anything can be known. For each reason to believe a claim, the sceptic finds an equal reason against it.',
    cite: 'The sceptic’s challenge',
    dur: 3.5,
  },
  {
    p: 176, bal: 1, route: 1,
    text: 'Equipollence is a balance of opposing reasons on both sides. Neither belief is then better supported than the other.',
    dur: 1.8,
  },
  {
    p: 158, bal: 1, route: 3,
    text: 'Pyrrhonian sceptics, named after Pyrrho of Elis, respond by suspending judgement. The Greek term for this suspension is epoche.',
    cite: 'Suspending judgement',
    dur: 3.1,
  },
  {
    p: 158, bal: 1, route: 3,
    text: 'Sextus Empiricus holds that suspending judgement brings not despair but tranquillity, or ataraxia.',
    dur: 1.9,
  },
  {
    p: 139, bal: 1, route: 3,
    quote: {
      id: 'lq-epistemology-knowledge-6-1',
      text: 'To every argument an equal argument is opposed.',
      author: 'Sextus Empiricus',
      philosopherId: 'sextus-empiricus',
      work: 'Outlines of Pyrrhonism',
      era: 'c. 200 CE',
      branchSlugs: ['epistemology'],
    },
    dur: 3.2,
  },
  {
    p: 22, bal: 1, route: 3,
    interact: {
      prompt: 'What do Pyrrhonian sceptics claim that suspending judgement brings?',
      cards: [
        { text: 'Peace of mind', correct: true },
        { text: 'Certain knowledge', correct: false },
      ],
      explain: 'Peace of mind. The sceptic neither affirms nor denies, so suspending judgement gives no certainty. Sextus says calm follows it as a shadow follows a body.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, bal: 0.3, crack: 1, route: 3,
    text: 'However, the claim that nothing can be known refutes itself. To know that claim would be to know something.',
    cite: 'A self-refuting claim',
    dur: 2,
  },
  {
    p: 12, bal: 0.3, crack: 1, route: 3,
    text: 'Sextus Empiricus avoids the objection by not asserting it. His sceptical phrases, he says, report only how things seem to him.',
    dur: 3,
  },
  {
    p: 165, crack: 1, route: 3,
    interact: {
      prompt: 'What is the problem with asserting that nothing can be known?',
      sort: {
        chip: '“nothing can be known”',
        bins: [
          { id: 'fine', label: 'no problem', reads: 'no problem: the claim is coherent' },
          { id: 'bold', label: 'too strong', reads: 'too sweeping to be true' },
          { id: 'eats', label: 'self-refuting', reads: 'to assert it is to claim knowledge', correct: true },
        ],
      },
      explain: 'Self-refuting. To know that nothing can be known would be to know something, so the claim can’t be known. Sextus avoids it: Pyrrhonian sceptics assert no doctrine and go on searching.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Value of Doubt',
      points: [
        'Sceptics oppose every argument with an equal one',
        'Pyrrhonists suspend judgement to reach tranquillity',
        'Total doubt is self-refuting',
        'Doubt can test beliefs without denying all knowledge',
      ],
      closing: 'Scepticism doesn’t have to end in paralysis. It can become a habit of asking what justifies each belief.',
    },
    dur: 2.8,
  },
];
