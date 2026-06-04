import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-1',
  slug: 'why-does-anything-exist',
  title: 'Why Does Anything Exist?',
  description: 'Start with the oldest question in philosophy: why is there something rather than nothing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something rather than nothing?',
      subtext: 'It\'s one of the oldest questions in philosophy, and still one of the hardest.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Leibniz\'s Question',
      body: 'In 1714, the philosopher Gottfried Leibniz asked a simple question: "Why is there something rather than nothing?" We usually take it for granted that the world exists. But there\'s no obvious reason it had to. An empty universe seems just as possible as a full one. So why is there anything at all?',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'example',
      title: 'Imagine Absolute Nothingness',
      scenario: 'Try to picture nothing at all. Not just empty space, but no objects, no space, no time, no energy, not even the laws of physics. Notice how hard this is: a dark void is still something. Now ask why there isn\'t just nothing. That question is the starting point of metaphysics.',
      emoji: '🕳️',
    },
    {
      type: 'concept',
      title: 'Why the Question Sticks Around',
      body: 'This isn\'t just a fun puzzle. It forces us to ask what we mean by "existence." Science always starts with things that already exist: particles, energy, the laws of nature. It explains how those things work, but not why there is anything for the laws to apply to. That gap is where philosophy steps in.',
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
        explanation: 'Leibniz raised it in his 1714 essay "Principles of Nature and Grace." It has stayed one of philosophy\'s central questions ever since.',
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
        explanation: 'Science always starts with things that already exist, like particles, energy, and laws. It can explain how those things behave, but not why there is anything to begin with.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Puzzle',
      keyPoints: [
        'Leibniz asked: why something rather than nothing?',
        'Nothing seems just as possible as something',
        'Science explains how, not why anything exists',
        'This question is where metaphysics begins',
      ],
      closingThought: 'Existence is something we usually take for granted, until we ask why it\'s here at all.',
    },
  ],
};

export default lesson;
