import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-40',
  slug: 'green-or-grue',
  title: 'Green, or Grue?',
  description: 'Every emerald ever checked was green. Every emerald ever checked also fits a stranger rule, exactly as well.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every emerald checked so far was green.',
      subtext: 'Every one also fits a rule you have never heard of.',
      emoji: '💎',
    },
    {
      type: 'concept',
      title: 'A New Word',
      body: 'Call a stone grue if it is green when somebody checks it before tonight, and blue otherwise. Nobody has ever checked a stone after tonight. So every stone on record is green, and every stone on record is grue, and the pile of evidence is the same pile.',
      visual: '🔎',
      highlight: 'the pile of evidence is the same pile',
    },
    {
      type: 'example',
      title: 'Where They Part',
      scenario: 'Nelson Goodman built the word to make one point. Two rules can agree about every case anyone has looked at and disagree flatly about the next one. Pull a fresh stone out tomorrow and green says it is green while grue says it is blue.',
      source: 'Nelson Goodman, Fact, Fiction, and Forecast',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-40',
      quote: 'Regularities are where you find them, and you can find them anywhere.',
      author: 'Nelson Goodman',
      era: '1955',
    },
    {
      type: 'question',
      prompt: 'Which stone do the two rules disagree about?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one nobody has checked yet', isCorrect: true },
          { id: 'b', text: 'The first stone in the tray', isCorrect: false },
          { id: 'c', text: 'The stone checked most recently', isCorrect: false },
          { id: 'd', text: 'They disagree about all of them', isCorrect: false },
        ],
        explanation: 'The unchecked one. Grue was built to match green on every case already in hand, so no checked stone can separate them. That is why the disagreement is invisible until you reach for the next one.',
      },
    },
    {
      type: 'question',
      prompt: 'How does the evidence in the tray divide between the two rules?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Evenly — it supports both exactly alike', isCorrect: true },
          { id: 'b', text: 'Mostly green, because green is simpler', isCorrect: false },
          { id: 'c', text: 'Mostly grue, because grue says more', isCorrect: false },
          { id: 'd', text: 'Neither — the stones support no rule at all', isCorrect: false },
        ],
        explanation: 'Evenly, and that is the riddle. Simplicity feels like a tiebreaker, but simple depends on your words: to somebody whose language starts with grue, green is the fiddly one that mentions a time. Goodman answered that green is simply the older habit, which is a fact about speakers rather than about stones.',
      },
    },
    {
      type: 'summary',
      title: 'The Next Stone',
      keyPoints: [
        'Grue matches green on every case ever checked',
        'The two rules split only on cases still to come',
        'Evidence alone cannot pick between them',
        'Habit picks green, and habit is not a proof',
      ],
      closingThought: 'Induction was already hard when the worry was whether the future resembles the past. This asks a sharper question: resembles it in which respect?',
    },
  ],
};

export default lesson;
