import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-1',
  slug: 'why-does-anything-exist',
  title: 'Why Does Anything Exist?',
  description: 'Meet the deepest question in metaphysics: why is there something rather than nothing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something rather than nothing?',
      subtext: 'Metaphysics\' most famous question. Brace yourself.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Leibniz\'s Question',
      body: 'In 1714, Gottfried Leibniz reasoned that nothing is true without a sufficient reason. Apply that to the whole world and the first question you may ask is: "Why is there something rather than nothing?" Nothing, he said, is simpler than something. So why this crowded universe instead of an empty one?',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'example',
      title: 'Can Nothing Even Exist?',
      scenario: 'Long before Leibniz, Parmenides of Elea argued that "what is not" can be neither thought nor spoken. The moment you think of nothing, you make it a something. Try it. Strip away objects, space, time, the laws of physics. A dark void is still something. Pure nothing slips through your fingers.',
      emoji: '🕳️',
      source: 'Parmenides, fragments (the poem traditionally titled On Nature), early 5th c. BCE',
    },
    {
      type: 'concept',
      title: 'Where Science Runs Out',
      body: 'This is no idle puzzle. Science always starts mid-game, explaining one state of the universe by an earlier one, under the laws of nature. It does this with stunning precision. But it presumes there are laws and states at all. Why there is anything for the laws to grip is metaphysics\' home turf.',
      visual: '🔭',
      highlight: 'existence',
    },
    {
      type: 'question',
      prompt: 'Who gave this question its famous modern formulation: "Why is there something rather than nothing?"',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Gottfried Leibniz', isCorrect: true },
          { id: 'b', text: 'Socrates', isCorrect: false },
          { id: 'c', text: 'Immanuel Kant', isCorrect: false },
          { id: 'd', text: 'René Descartes', isCorrect: false },
        ],
        explanation: 'Leibniz posed it in section 7 of his Principles of Nature and Grace, Based on Reason (1714). It follows from his Principle of Sufficient Reason: nothing is so without a reason why.',
      },
    },
    {
      type: 'question',
      prompt: 'Why can\'t science fully answer why anything exists at all?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The Big Bang has already settled the matter', isCorrect: false },
          { id: 'b', text: 'Science presumes things exist; it cannot account for existence itself', isCorrect: true },
          { id: 'c', text: 'Scientists simply aren\'t clever enough yet', isCorrect: false },
          { id: 'd', text: 'The question is too brief to be scientific', isCorrect: false },
        ],
        explanation: 'Science explains each state of the universe by a prior state and the laws. It presupposes that there are laws and states at all, so it never reaches why there is anything to begin with.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Puzzle',
      keyPoints: [
        'Leibniz: nothing exists without a sufficient reason',
        'So why something rather than nothing?',
        'Parmenides: pure nothing can\'t even be thought',
        'Science explains how, not why anything is',
      ],
      closingThought: 'For Leibniz the reason lay outside the world, in a necessary being. You can disagree. But notice: even the ground beneath you now demands an explanation.',
    },
  ],
};

export default lesson;
