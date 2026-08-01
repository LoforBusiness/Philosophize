import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-13',
  slug: 'the-ticket-that-loses',
  title: 'The Ticket You Know Will Lose',
  description: 'The lottery paradox: a million reasonable verdicts that add up to nonsense.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A million tickets. Yours will lose. You would bet on it.',
      subtext: 'Say that about every ticket and you have said nobody wins.',
      emoji: '🎟️',
    },
    {
      type: 'concept',
      title: 'One Ticket At A Time',
      body: 'You are 99.9999% sure ticket one loses — that is better odds than most things you claim to know. The same holds for ticket two, and three, and every ticket in the draw. Each verdict is impeccable on its own.',
      visual: '🔢',
      highlight: 'Each one is reasonable',
    },
    {
      type: 'example',
      title: 'Adding Them Up',
      scenario: 'Collect all million verdicts and read them together. Ticket one loses. Ticket two loses. Every ticket loses. But you also know, with certainty, that the draw has a winner. You have just contradicted yourself using nothing but reasonable steps.',
      source: 'Henry Kyburg, 1961',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-13',
      quote: 'A wise man proportions his belief to the evidence.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: 'Every single verdict is reasonable, yet together they are false. What gives?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Knowing each thing separately does not mean knowing them all at once', isCorrect: true },
          { id: 'b', text: 'One of the individual verdicts must secretly be false', isCorrect: false },
          { id: 'c', text: 'High probability is never enough for knowledge, ever', isCorrect: false },
          { id: 'd', text: 'A million is simply too large a number to reason about', isCorrect: false },
        ],
        explanation: 'The trap: options B and C both look decisive. B cannot say which verdict fails, and C throws out almost everything you know, since nearly all of it rests on probability rather than proof.',
      },
    },
    {
      type: 'question',
      prompt: 'You are sure each ticket loses. Which one, then, do you say wins?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'None of them — you cannot point at one, and that is the puzzle', isCorrect: true },
          { id: 'b', text: 'The first ticket, since something has to win', isCorrect: false },
          { id: 'c', text: 'Whichever ticket you did not buy', isCorrect: false },
          { id: 'd', text: 'The last one drawn, by elimination', isCorrect: false },
        ],
        explanation: 'You cannot name a winner, and you also cannot deny there is one. That gap between what you can say about each and what you can say about all of them is the whole paradox.',
      },
    },
    {
      type: 'summary',
      title: 'Reasonable Steps, Absurd Total',
      keyPoints: [
        'Each ticket verdict is individually justified',
        'Together they deny the draw has a winner',
        'Knowledge may not survive being added up',
        'Demanding certainty would erase most knowledge',
      ],
      closingThought: 'Almost everything you know is a very good bet. This is the puzzle that comes with that.',
    },
  ],
};

export default lesson;
