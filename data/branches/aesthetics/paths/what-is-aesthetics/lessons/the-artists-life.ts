import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-16',
  slug: 'the-artists-life',
  title: 'Does the Artist’s Life Change the Work?',
  description: 'What you learn about the maker, and whether the canvas hears any of it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You loved the painting. Then you read about the painter.',
      subtext: 'Nothing on the canvas moved. Something did.',
      emoji: '🪞',
    },
    {
      type: 'concept',
      title: 'Two Different Objects',
      body: 'There is the work — marks on a surface, finished and unchanging. And there is the story you carry to it. Learning something about the maker edits the second one. It cannot reach the first.',
      visual: '📖',
      highlight: 'The canvas is already finished',
    },
    {
      type: 'example',
      title: 'The Growing Label',
      scenario: 'A gallery keeps adding to the card beside a painting: who paid for it, what the painter did in the war, who they treated badly. The card grows until it is longer than the painting is wide. Visitors read the card.',
      source: 'The problem of the biographical label',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-16',
      quote: 'The design or intention of the author is neither available nor desirable as a standard for judging the success of a work of art.',
      author: 'Wimsatt and Beardsley',
      era: '1946',
      work: 'The Intentional Fallacy',
    },
    {
      type: 'question',
      prompt: 'You learn the painter was cruel. What changed about the painting?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nothing on the canvas — but what it is now for you did change', isCorrect: true },
          { id: 'b', text: 'Its beauty, which cruelty genuinely diminishes', isCorrect: false },
          { id: 'c', text: 'Nothing at all, and any discomfort you feel is a mistake', isCorrect: false },
          { id: 'd', text: 'Its meaning, which is fixed by whatever the artist intended', isCorrect: false },
        ],
        explanation: 'The trap is that both extremes feel principled. "It ruins the work" and "it is simply irrelevant" both dodge the honest answer: the object is untouched and your experience of it is not.',
      },
    },
    {
      type: 'question',
      prompt: 'What does the intentional fallacy actually warn against?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Settling what a work means by appealing to the maker’s biography', isCorrect: true },
          { id: 'b', text: 'Having any feelings at all about the artist as a person', isCorrect: false },
          { id: 'c', text: 'Studying history, which always distorts a reading', isCorrect: false },
          { id: 'd', text: 'Believing that artworks mean anything definite', isCorrect: false },
        ],
        explanation: 'The trap: it sounds like a ban on caring about artists. It is narrower — it says the maker’s private aim is not the court of appeal for what the finished work does.',
      },
    },
    {
      type: 'summary',
      title: 'The Canvas Does Not Hear You',
      keyPoints: [
        'What you learn cannot edit the marks',
        'It can still change what looking is like',
        'Intention is not the court of appeal',
        'Both "ruined" and "irrelevant" are dodges',
      ],
      closingThought: 'The work stopped changing the day it was finished. You did not.',
    },
  ],
};

export default lesson;
