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
      subtext: 'The oldest question in metaphysics. Brace yourself.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Leibniz\'s Question',
      body: 'In 1714, Gottfried Leibniz dropped a bomb: "Why is there something rather than nothing?" We treat the world\'s existence as obvious. But nothing forced it. An empty universe seems just as possible as this crowded one. So why is there anything at all? Welcome to metaphysics, the study of being itself.',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'example',
      title: 'Can Nothing Even Exist?',
      scenario: 'The ancient Greeks fought over this. Parmenides argued nothingness is impossible: "being is, non-being is not." You can\'t even think nothing without making it a thing. Try it. Strip away objects, space, time, the laws of physics. A dark void is still something. Pure nothing slips through your fingers.',
      emoji: '🕳️',
    },
    {
      type: 'concept',
      title: 'Where Science Runs Out',
      body: 'This is no idle puzzle. It interrogates what "existence" even means. Science always starts mid-game, with things that already are: particles, energy, the laws of nature. It maps how they behave with stunning precision. But it cannot say why there is anything for those laws to grip. That gap is metaphysics\' home turf.',
      visual: '🔭',
      highlight: 'existence',
    },
    {
      type: 'question',
      prompt: 'Who first famously posed the question "Why is there something rather than nothing?"',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Gottfried Leibniz', isCorrect: true },
          { id: 'b', text: 'Socrates', isCorrect: false },
          { id: 'c', text: 'Immanuel Kant', isCorrect: false },
          { id: 'd', text: 'René Descartes', isCorrect: false },
        ],
        explanation: 'Leibniz raised it in his 1714 essay "Principles of Nature and Grace." It has anchored metaphysics ever since.',
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
        explanation: 'Science begins with things that already exist, like particles, energy, and laws. It explains how they behave, never why there is anything to begin with.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Puzzle',
      keyPoints: [
        'Leibniz asked: why something rather than nothing?',
        'Parmenides: pure nothing can\'t even be thought',
        'Science explains how, not why anything is',
        'This question is where metaphysics begins',
      ],
      closingThought: 'You walk past existence every day. Stop, look down, and the ground itself becomes astonishing.',
    },
  ],
};

export default lesson;
