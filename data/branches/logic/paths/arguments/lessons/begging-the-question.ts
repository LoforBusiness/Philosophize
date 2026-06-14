import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-11',
  slug: 'begging-the-question',
  title: 'The Argument That Eats Its Tail',
  description: 'Begging the question smuggles the conclusion in as a premise, so it proves nothing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Some arguments only prove what they already assumed.',
      subtext: 'The conclusion hides inside the premise — so nothing new is ever shown.',
      emoji: '🐍',
    },
    {
      type: 'concept',
      title: 'Begging the Question',
      body: 'Begging the question — petitio principii — is circular reasoning. The conclusion is already assumed inside a premise, so the argument only "proves" what it presupposed. It can be perfectly valid yet tell you absolutely nothing new.',
      visual: '🔄',
      highlight: 'circular reasoning',
    },
    {
      type: 'example',
      title: 'The Closed Loop',
      scenario: '"Opium puts you to sleep because it has a dormitive power." But "dormitive power" just means "the power to cause sleep." The premise restates the conclusion in fancy words. It feels like an explanation, yet it explains nothing.',
      source: 'Molière, The Imaginary Invalid, 1673',
      emoji: '😴',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-11',
      quote: 'Begging or assuming the point at issue consists in failing to demonstrate the required proposition.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Prior Analytics',
      philosopherId: 'aristotle',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw valid arguments can still prove nothing.',
      body: 'In Valid vs Sound, a flawless form reached a false conclusion. Here is the twin trap: a flawless form whose premise already contains the conclusion. Valid, yes — but it adds zero new evidence.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: '"The Bible is true because it\'s God\'s word, and we know God exists because the Bible says so." What\'s wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It begs the question — each claim assumes the other', isCorrect: true },
          { id: 'b', text: 'Nothing — the two statements support each other', isCorrect: false },
          { id: 'c', text: 'It attacks the person instead of the claim', isCorrect: false },
          { id: 'd', text: 'It uses a premise that is simply false', isCorrect: false },
        ],
        explanation: 'This begs the question (circular reasoning). "Each supports the other" is tempting, but mutual support is still a closed loop: each claim presupposes the other, so no independent evidence ever enters.',
      },
    },
    {
      type: 'question',
      prompt: 'A circular argument is logically VALID. Does that mean it proves its conclusion?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — assuming the conclusion adds no new support', isCorrect: true },
          { id: 'b', text: 'Yes — valid arguments always prove their conclusion', isCorrect: false },
          { id: 'c', text: 'Yes — if it\'s valid, the premises must be true', isCorrect: false },
          { id: 'd', text: 'Only if the conclusion happens to be true', isCorrect: false },
        ],
        explanation: 'Validity only blocks true premises with a false conclusion. A circular argument clears that bar trivially by hiding the conclusion in the premise — informative is a separate test it fails.',
      },
    },
    {
      type: 'summary',
      title: 'The Argument That Eats Its Tail',
      keyPoints: [
        'Begging the question assumes the conclusion as a premise',
        'It can be valid yet completely uninformative',
        'Mutual support between two claims is still circular',
        'Ask: does a premise smuggle in the conclusion?',
      ],
      closingThought: 'You now spot the loop — when an argument only proves what it already took for granted.',
    },
  ],
};

export default lesson;
