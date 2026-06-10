import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-6',
  slug: 'can-we-know-anything-at-all',
  title: 'Can We Know Anything at All?',
  description: 'Meet the skeptics who doubt every claim — and find calm in it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if every belief can be doubted?',
      subtext: 'The ancient skeptics took that idea further than Descartes ever did.',
      emoji: '🤔',
    },
    {
      type: 'concept',
      title: 'The Skeptic\'s Challenge',
      body: 'Skepticism asks whether knowledge is possible at all. For every reason to believe something, the skeptic finds a reason to doubt it. If reasons cancel out, how can any belief be secure?',
      visual: '⚖️',
      highlight: 'skepticism',
    },
    {
      type: 'example',
      title: 'Pyrrho Suspends Judgment',
      scenario: 'Pyrrho of Elis met a claim with its opposite, found them equally strong, and refused to decide. Sextus Empiricus called this epoche — suspension. Surprisingly, the result was not despair but ataraxia: peace of mind.',
      source: 'Sextus Empiricus, Outlines of Pyrrhonism (c. 200 CE)',
      emoji: '🧘',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-6-1',
      quote: 'To every argument an equal argument is opposed.',
      author: 'Sextus Empiricus',
      era: 'c. 200 CE',
      work: 'Outlines of Pyrrhonism',
    },
    {
      type: 'reinforcement',
      callout: 'But total doubt eats itself.',
      body: 'If you claim "nothing can be known," is that itself known? The boast seems to refute itself. So most skeptics doubt softly — they question confidence, not the very possibility of inquiry.',
      emoji: '🌀',
    },
    {
      type: 'question',
      prompt: 'What did the Pyrrhonist skeptics say suspending judgment leads to?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Peace of mind — ataraxia — from ceasing to fight over claims', isCorrect: true },
          { id: 'b', text: 'Proof that the external world does not exist', isCorrect: false },
          { id: 'c', text: 'Certainty that all our beliefs are false', isCorrect: false },
          { id: 'd', text: 'A faster, surer path to scientific knowledge', isCorrect: false },
        ],
        explanation: 'For Pyrrho, suspending judgment quieted the mind. Tranquility, not certainty or denial, was the skeptic\'s real prize.',
      },
    },
    {
      type: 'question',
      prompt: 'A skeptic insists: "I know for certain that nobody can know anything." What is wrong here?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nothing — it is the strongest possible skeptical claim', isCorrect: false },
          { id: 'b', text: 'The statement undercuts itself: it claims to know that nothing is known', isCorrect: true },
          { id: 'c', text: 'It is wrong only because science has disproven it', isCorrect: false },
          { id: 'd', text: 'It proves the skeptic actually believes in certainty', isCorrect: false },
        ],
        explanation: 'Claiming certain knowledge that knowledge is impossible is self-defeating — it asserts the very thing it denies.',
      },
    },
    {
      type: 'summary',
      title: 'The Value of Doubt',
      keyPoints: [
        'Skeptics oppose every claim with a rival',
        'Pyrrho suspended judgment to find peace',
        'Total doubt is self-refuting',
        'Healthy doubt sharpens belief, not destroys it',
      ],
      closingThought: 'The skeptic\'s gift is not paralysis. It is the habit of asking, every time, "But how do I really know?"',
    },
  ],
};

export default lesson;
