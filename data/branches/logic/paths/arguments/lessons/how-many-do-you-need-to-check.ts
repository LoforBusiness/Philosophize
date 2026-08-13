import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-34',
  slug: 'how-many-do-you-need-to-check',
  title: 'How Many Do You Need to Check?',
  description: 'The first hundred buy you a lot. The next nine hundred buy you very little.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'How many people do you have to ask?',
      subtext: 'Fewer than you would guess — and more than one.',
      emoji: '🫙',
    },
    {
      type: 'concept',
      title: 'Error Shrinks Slowly',
      body: 'Take a sample and your estimate carries an error. Take four times as many and the error halves, not quarters. It falls with the square root, which is why the first handful of checks are worth so much and the thousandth is worth almost nothing.',
      visual: '📉',
      highlight: 'Four times the work, half the error',
    },
    {
      type: 'example',
      title: 'Two Million Wrong Answers',
      scenario: 'In 1936 a magazine polled over two million people and predicted a landslide for the wrong man. It had asked its own subscribers, and car and telephone owners. A rival asked a few thousand chosen to look like the country, and got it right.',
      source: 'The Literary Digest poll',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-34',
      quote: 'The more observations have been made, the less danger there is of wandering from one\'s goal.',
      author: 'Jacob Bernoulli',
      era: '1713',
    },
    {
      type: 'question',
      prompt: 'You quadruple your sample. What happens to the error?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It halves — error falls with the square root of the count', isCorrect: true },
          { id: 'b', text: 'It quarters, in proportion to the extra data', isCorrect: false },
          { id: 'c', text: 'It stays the same; only confidence rises', isCorrect: false },
          { id: 'd', text: 'It falls to nearly nothing, because large samples are exact', isCorrect: false },
        ],
        explanation: 'Square root, not proportion. That single fact is why a national poll of a thousand people is respectable and why going to ten thousand is rarely worth the money — you have paid ten times over to cut the error by about two thirds.',
      },
    },
    {
      type: 'question',
      prompt: 'Does a bigger sample fix a biased one?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — size shrinks random error and leaves bias exactly where it was', isCorrect: true },
          { id: 'b', text: 'Yes, a large enough sample washes any bias out', isCorrect: false },
          { id: 'c', text: 'Yes, provided the sample is at least a thousand', isCorrect: false },
          { id: 'd', text: 'No, because bias and random error are the same thing', isCorrect: false },
        ],
        explanation: 'This is what two million wrong answers bought. Asking more of the wrong people measures the wrong people more precisely. Size is a cure for noise and no cure at all for asking a question of the wrong room.',
      },
    },
    {
      type: 'summary',
      title: 'Enough Is Sooner Than You Think',
      keyPoints: [
        'Error falls with the square root of the count',
        'So the early checks are worth far more than the late ones',
        'Diminishing returns arrive quickly',
        'Size shrinks noise and never touches bias',
      ],
      closingThought: 'Before asking how many, ask who. No amount of the second question answers the first.',
    },
  ],
};

export default lesson;
