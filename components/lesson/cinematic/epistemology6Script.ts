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
    text: 'Pyrrho of Elis met each claim with its opposite, found them equally strong, and refused to decide — epoche, suspension. The result was not despair but ataraxia: peace of mind.',
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
    mc: {
      prompt: 'What did the Pyrrhonist skeptics say suspending judgment leads to?',
      options: [
        { id: 'a', text: 'Peace of mind — ataraxia — from ceasing to fight over claims', correct: true },
        { id: 'b', text: 'Proof that the external world does not exist', correct: false },
        { id: 'c', text: 'Certainty that all our beliefs are false', correct: false },
        { id: 'd', text: 'A faster, surer path to scientific knowledge', correct: false },
      ],
      explain: 'For Pyrrho, suspending judgment quieted the mind. Tranquility — not certainty or denial — was the skeptic’s real prize.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, bal: 0.3, crack: 1, route: 3,
    text: 'But total doubt eats itself. If you claim "nothing can be known," is THAT known? The boast seems to refute itself. So most skeptics doubt softly — questioning confidence, not the very possibility of inquiry.',
    cite: 'Doubt that eats itself',
    dur: 5.0,
  },
  {
    p: 4, crack: 1, route: 3,
    mc: {
      prompt: 'A skeptic insists: "I know for certain that nobody can know anything." What’s wrong?',
      options: [
        { id: 'a', text: 'Nothing — it is the strongest possible skeptical claim', correct: false },
        { id: 'b', text: 'It undercuts itself: it claims to know that nothing is known', correct: true },
        { id: 'c', text: 'It is wrong only because science has disproven it', correct: false },
        { id: 'd', text: 'It proves the skeptic actually believes in certainty', correct: false },
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
