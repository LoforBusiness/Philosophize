import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-36',
  slug: 'the-hotel-that-is-always-full',
  title: 'The Hotel That Is Always Full',
  description: 'Every room taken, and still room for you. Infinity breaks arithmetic.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Infinite rooms. Every one occupied. "Any vacancies?"',
      subtext: 'The clerk says yes without checking.',
      emoji: '🏨',
    },
    {
      type: 'concept',
      title: 'The Same Size as Its Own Half',
      body: 'Move the guest in room 1 to room 2, room 2 to room 3, and so on forever. Everyone still has a room and room 1 is empty. A full infinite hotel can always take one more, which no finite hotel can do.',
      visual: '➡️',
      highlight: 'a full hotel with a free room',
    },
    {
      type: 'example',
      title: 'Then a Coach Arrives',
      scenario: 'An infinite coach pulls up. Move every guest to double their room number and all the odd rooms empty at once — infinitely many free rooms, in one instruction. Hilbert used this to show that "how many" stops behaving once the answer is endless.',
      source: 'Hilbert, lecture "Über das Unendliche" (1925)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-36',
      quote: 'The infinite is nowhere to be found in reality. It is an idea of reason.',
      author: 'David Hilbert',
      era: '1925',
    },
    {
      type: 'question',
      prompt: 'What does the hotel actually show?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'An infinite collection can match a proper part of itself one-to-one', isCorrect: true },
          { id: 'b', text: 'That infinity is simply a very large number', isCorrect: false },
          { id: 'c', text: 'That the hotel was never really full', isCorrect: false },
          { id: 'd', text: 'That arithmetic contains a hidden contradiction', isCorrect: false },
        ],
        explanation: 'Full means every room has a guest, and it was. The result is that a part can be paired off exactly with the whole — which is the definition of infinite, not a paradox inside it.',
      },
    },
    {
      type: 'question',
      prompt: 'Some philosophers use this against actual infinities. How?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They argue that anything so strange cannot be built out of real objects', isCorrect: true },
          { id: 'b', text: 'They show the shifting takes infinite time, so it cannot be done', isCorrect: false },
          { id: 'c', text: 'They prove that infinite sets are self-contradictory', isCorrect: false },
          { id: 'd', text: 'They deny that mathematics applies to physical things', isCorrect: false },
        ],
        explanation: 'The maths is not in dispute — it is consistent and a century old. The argument is that a consistent idea need not describe anything buildable, and a hotel behaving like this is offered as the reason to doubt it could exist.',
      },
    },
    {
      type: 'summary',
      title: 'When Counting Stops Working',
      keyPoints: [
        'A full infinite hotel can still take a guest',
        'Doubling every room number frees infinitely many',
        'A part can be matched one-to-one with the whole',
        'Consistent in maths is not the same as buildable',
      ],
      closingThought: 'Nothing here is a trick or an error. It is what "endless" means, and the discomfort you feel is arithmetic built for finite things complaining.',
    },
  ],
};

export default lesson;
