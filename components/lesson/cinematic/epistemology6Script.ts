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
    p: 8, bal: 1, crack: 0, route: 0,
    text: 'What if every belief can be doubted? The ancient skeptics took that idea further than Descartes ever did.',
    dur: 3.4,
  },
  {
    p: 21, bal: 1, route: 1,
    text: 'Skepticism asks whether knowledge is possible at all. For every reason to believe something, the skeptic finds an equal reason to doubt it. If the reasons cancel out, how can any belief be secure?',
    cite: 'The skeptic’s challenge',
    dur: 5.2,
  },
  {
    p: 0, bal: 1, route: 3,
    text: 'Pyrrho met each claim with its opposite, found them equally strong, and simply refused to decide. His word for that is epoche. What he got out of it was not despair but calm — ataraxia.',
    cite: 'Pyrrho suspends judgment',
    dur: 5.0,
  },
  {
    p: 137, bal: 1, route: 3,
    quote: {
      id: 'lq-epistemology-knowledge-6-1',
      text: 'To every argument an equal argument is opposed.',
      author: 'Sextus Empiricus',
      work: 'Outlines of Pyrrhonism',
      era: 'c. 200 CE',
      branchSlugs: ['epistemology'],
    },
    dur: 3.2,
  },
  {
    p: 22, bal: 1, route: 3,
    interact: {
      prompt: 'Refusing to decide anything sounds miserable. Tap what Pyrrho says it actually gets you.',
      cards: [
        { text: 'Peace of mind', correct: true },
        { text: 'Certainty at last', correct: false },
      ],
      explain: 'Calm. He is not claiming to have proved anything, and he is not denying anything either. Putting the question down is the thing that quiets the mind.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, bal: 0.3, crack: 1, route: 3,
    text: 'But total doubt eats itself. If nothing can be known, is THAT known? So most sceptics doubt softly. They go after your confidence, not after the possibility of ever finding anything out.',
    cite: 'Doubt that eats itself',
    dur: 5.0,
  },
  {
    p: 4, crack: 1, route: 3,
    interact: {
      prompt: 'A skeptic insists: "I know for certain that nobody can know anything." What’s wrong?',
      cards: [
        { text: 'It undercuts itself', correct: true },
        { text: 'Nothing, it is consistent', correct: false },
      ],
      explain: 'Claiming certain knowledge that knowledge is impossible is self-defeating — it asserts the very thing it denies.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Value of Doubt',
      points: [
        'Skeptics oppose every claim with a rival',
        'Pyrrho suspended judgment to find peace',
        'Total doubt is self-refuting',
        'Healthy doubt sharpens belief, not destroys it',
      ],
      closing: 'The skeptic’s gift is not paralysis. It is the habit of asking, every time, "But how do I really know?"',
    },
    dur: 2.8,
  },
];
