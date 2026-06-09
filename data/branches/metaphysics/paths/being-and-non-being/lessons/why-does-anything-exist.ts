import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-1',
  slug: 'why-does-anything-exist',
  title: 'Why Does Anything Exist?',
  description: 'Metaphysics\' deepest puzzle: why something rather than nothing?',
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
      body: 'In 1714, Leibniz argued nothing is true without a sufficient reason. Apply that to the whole world: why this crowded universe instead of an empty one? Nothing, he said, is simpler.',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-1-1',
      quote: 'Why is there something rather than nothing? For nothing is simpler and easier than something.',
      author: 'Gottfried Leibniz',
      era: '1714',
      work: 'Principles of Nature and Grace, §7',
    },
    {
      type: 'example',
      title: 'Can Nothing Even Exist?',
      scenario: 'Parmenides argued that "what is not" can be neither thought nor spoken. Try it: strip away objects, space, time, physics. A dark void is still something. Pure nothing slips your grip.',
      emoji: '🕳️',
      source: 'Parmenides, On Nature (early 5th c. BCE)',
    },
    {
      type: 'concept',
      title: 'Where Science Runs Out',
      body: 'Science always starts mid-game, explaining one state of the universe by an earlier one. But it presumes there are laws and states at all. Why anything exists is metaphysics\' turf.',
      visual: '🔭',
      highlight: 'existence',
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
        explanation: 'Science explains each state by a prior state and the laws. It presupposes there are laws and states at all, so it never reaches why there is anything to begin with.',
      },
    },
    {
      type: 'question',
      prompt: 'The Big Bang explains where the universe came from. Doesn\'t that answer Leibniz\'s question?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — the Big Bang is the reason there is something', isCorrect: false },
          { id: 'b', text: 'Yes, once we find what caused the Big Bang', isCorrect: false },
          { id: 'c', text: 'No — it describes an early state, still presupposing something existed', isCorrect: true },
          { id: 'd', text: 'No, because the Big Bang never actually happened', isCorrect: false },
        ],
        explanation: 'The Big Bang describes how an existing universe evolved from a dense early state. It assumes that state already was — so it cannot explain why there is anything rather than nothing.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Puzzle',
      keyPoints: [
        'Leibniz: nothing exists without a reason',
        'So why something rather than nothing?',
        'Parmenides: pure nothing can\'t be thought',
        'Science explains how, not why',
      ],
      closingThought: 'For Leibniz the reason lay outside the world, in a necessary being. You can disagree. But notice: even the ground beneath you now demands an explanation.',
    },
  ],
};

export default lesson;
