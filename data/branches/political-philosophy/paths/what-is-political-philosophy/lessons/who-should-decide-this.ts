import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-34',
  slug: 'who-should-decide-this',
  title: 'Who Should Decide This?',
  description: 'Not what the answer is. What size of room the answer should be decided in.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Before asking what to do, ask who decides.',
      subtext: 'Most political arguments are secretly about this.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Subsidiarity',
      body: 'Decisions belong at the smallest level that can actually handle them. Push a decision up and you gain reach and lose local knowledge. Push it down and you gain fit and lose the ability to solve anything that crosses a border.',
      visual: '🪜',
      highlight: 'The smallest level that can',
    },
    {
      type: 'example',
      title: 'Two Failures, Opposite Directions',
      scenario: 'Nobody wants a distant office choosing their school\'s timetable. Nobody wants a single village setting policy on a river that runs through forty of them. The question is never "local or central" — it is which level matches the problem.',
      source: 'The principle of subsidiarity',
    },
    {
      type: 'quote',
      id: 'lq-political-political-34',
      quote: 'It is an injustice to assign to a greater and higher association what lesser and subordinate organizations can do.',
      author: 'Pius XI',
      era: '1931',
    },
    {
      type: 'question',
      prompt: 'What decides the right level for a decision?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'How far the effects of the decision reach', isCorrect: true },
          { id: 'b', text: 'Which level has the most expertise available', isCorrect: false },
          { id: 'c', text: 'Which level is cheapest to administer', isCorrect: false },
          { id: 'd', text: 'The smallest possible level, always', isCorrect: false },
        ],
        explanation: 'Match the level to the reach of the consequences. A decision whose effects stop at the town belongs in the town; one whose effects cross forty towns cannot be made by any one of them without imposing on the other thirty-nine.',
      },
    },
    {
      type: 'question',
      prompt: 'Someone argues everything should be decided as locally as possible. What is wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It lets a locality impose costs on outsiders who had no say', isCorrect: true },
          { id: 'b', text: 'Nothing — local decisions are always better informed', isCorrect: false },
          { id: 'c', text: 'Local government is too inefficient to be trusted', isCorrect: false },
          { id: 'd', text: 'Local majorities are always more tolerant', isCorrect: false },
        ],
        explanation: 'Subsidiarity has two halves and this drops one. A village deciding to dump waste in the river is deciding very locally about something whose effects are not local at all — and everybody downstream is governed by a vote they were not in.',
      },
    },
    {
      type: 'summary',
      title: 'Match The Room To The Problem',
      keyPoints: [
        'Every question has a right size of room to be decided in',
        'Too high loses local knowledge and consent',
        'Too low imposes on people with no vote',
        'The test is how far the effects reach',
      ],
      closingThought: 'Next time a political argument stalls, check whether the two sides are really arguing about who gets to answer.',
    },
  ],
};

export default lesson;
