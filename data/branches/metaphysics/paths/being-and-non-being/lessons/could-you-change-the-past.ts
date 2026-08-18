import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-35',
  slug: 'could-you-change-the-past',
  title: 'Could You Change the Past?',
  description: 'Go back far enough and you meet the one thing you cannot do.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You go back and stop your own grandfather.',
      subtext: 'Then who went back?',
      emoji: '⏳',
    },
    {
      type: 'concept',
      title: 'The Grandfather Problem',
      body: 'Travel back and stop your grandparents meeting. Then you are never born. Then nobody goes back. Then they meet after all, and you are born, and you go back. The story eats itself.',
      visual: '🔁',
      highlight: 'the story eats itself',
    },
    {
      type: 'example',
      title: 'Two Ways Out',
      scenario: 'One answer says the past is fixed: you were always there, and whatever you did is already part of how things went. The other says your trip starts a second history, running beside the first. Both keep the logic. They disagree about what a trip is.',
      source: 'Lewis, "The Paradoxes of Time Travel" (1976)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-35',
      quote: 'Time travel, I maintain, is possible. The paradoxes are oddities, not impossibilities.',
      author: 'David Lewis',
      era: '1976',
    },
    {
      type: 'question',
      prompt: 'What exactly does the grandfather story prove?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That you cannot change the past — not that you cannot visit it', isCorrect: true },
          { id: 'b', text: 'That travelling backwards in time is logically impossible', isCorrect: false },
          { id: 'c', text: 'That the past does not really exist any more', isCorrect: false },
          { id: 'd', text: 'That any trip backwards destroys the traveller', isCorrect: false },
        ],
        explanation: 'The contradiction only appears when the trip is supposed to make the past come out differently. A visit that was always part of the story contradicts nothing at all.',
      },
    },
    {
      type: 'question',
      prompt: 'On the fixed-past answer, why does the gun jam?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'For some ordinary reason — but something always stops it, because it never happened', isCorrect: true },
          { id: 'b', text: 'Because time itself pushes back to protect the timeline', isCorrect: false },
          { id: 'c', text: 'Because the traveller loses the will to fire', isCorrect: false },
          { id: 'd', text: 'Because the past is only an illusion and there is nothing to shoot', isCorrect: false },
        ],
        explanation: 'No force is needed. The past already happened one way, so every attempt to make it happen otherwise fails — and each failure has its own dull local cause. A jam. A slip. A wrong street.',
      },
    },
    {
      type: 'summary',
      title: 'The One Thing You Cannot Do',
      keyPoints: [
        'Changing the past is a contradiction, not a difficulty',
        'Visiting the past contradicts nothing',
        'A fixed past means you were always there',
        'A branching past means a second history, not a changed one',
      ],
      closingThought: 'You can go back. You just cannot go back and make it different — because "different from what actually happened" has nothing to be different from.',
    },
  ],
};

export default lesson;
