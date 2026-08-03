import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-32',
  slug: 'the-loaded-question',
  title: 'The Question With a Trap Inside',
  description: 'A question that convicts you whichever way you answer it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Have you stopped cheating at cards?',
      subtext: 'Yes or no. Notice that both answers cost you something.',
      emoji: '🃏',
    },
    {
      type: 'concept',
      title: 'The Smuggled Premise',
      body: 'A loaded question hides a claim inside itself and then asks you about something else. Answer either way and you have let the hidden claim through unchallenged, because the question never offered it up for debate.',
      visual: '🎣',
      highlight: 'Answering concedes it',
    },
    {
      type: 'example',
      title: 'Two Bad Doors',
      scenario: 'Say yes and you were cheating and stopped. Say no and you are cheating still. There is no third box to tick, and the one thing never discussed is whether you ever cheated at all.',
      source: 'The fallacy of many questions',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-32',
      quote: 'Judge a man by his questions rather than by his answers.',
      author: 'Voltaire',
      era: 'c. 1770',
    },
    {
      type: 'question',
      prompt: 'Which word in "Have you stopped cheating?" carries the hidden claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '"Stopped" — it presupposes you were doing it before', isCorrect: true },
          { id: 'b', text: '"Cheating" — the accusation is right there in the open', isCorrect: false },
          { id: 'c', text: '"Have" — it makes the question about the past', isCorrect: false },
          { id: 'd', text: '"You" — it aims the charge at a person', isCorrect: false },
        ],
        explanation: 'The trap is B. "Cheating" is out in the open, which is exactly why it is not the problem — you can see it and dispute it. "Stopped" is the one doing the smuggling: it can only be true if you started.',
      },
    },
    {
      type: 'question',
      prompt: 'What is the right move when a question is loaded?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Refuse the question and challenge the hidden claim first', isCorrect: true },
          { id: 'b', text: 'Answer no, since that denies the most', isCorrect: false },
          { id: 'c', text: 'Answer with a loaded question of your own', isCorrect: false },
          { id: 'd', text: 'Say nothing, since anything you say can be used', isCorrect: false },
        ],
        explanation: 'The trap is B, and it feels like the safe answer. It is not: "no" to "have you stopped" means you have not stopped, which grants everything. Splitting the question is the only reply that does not concede.',
      },
    },
    {
      type: 'summary',
      title: 'Split the Question',
      keyPoints: [
        'A loaded question hides a claim inside itself',
        'Both answers concede what was smuggled in',
        'The giveaway word presupposes rather than asserts',
        'Refuse the frame, then answer the real question',
      ],
      closingThought: 'Some questions are not requests for information. They are arguments wearing a question mark.',
    },
  ],
};

export default lesson;
