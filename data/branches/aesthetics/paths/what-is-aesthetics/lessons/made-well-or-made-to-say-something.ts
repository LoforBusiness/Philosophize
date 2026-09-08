import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-39',
  slug: 'made-well-or-made-to-say-something',
  title: 'Made Well, Or Made to Say Something?',
  description: 'A chair and a sculpture can be the same wood, the same hands and the same skill. What divides them is not in the object at all.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Same wood. Same hands. Same skill.',
      subtext: 'One of them is craft and one is art. Which, and why?',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'Craft and Art',
      body: 'Craft knows its end before it starts: a plan, then the work of reaching it. The old claim about art is that it has no such plan — the maker finds out what the thing is by making it, and could not have written it down first.',
      visual: '🧭',
      highlight: 'the maker finds out what the thing is by making it',
    },
    {
      type: 'example',
      title: 'The Route, Not the Result',
      scenario: 'Set a chair beside a sculpture and you cannot always tell which is which. Follow the making instead. The chair had a drawing, and every hour was spent closing the gap between the drawing and the wood. The sculpture had a start and no drawing, and what it turned out to be was settled somewhere in the middle.',
      source: 'the craft theory of art, and its critics',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-39',
      quote: 'Art is distinguished from handicraft: the first is called free, the second may be called mercenary.',
      author: 'Immanuel Kant',
      era: '1790',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'question',
      prompt: 'On this account, what makes something art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The maker did not know what it would be', isCorrect: true },
          { id: 'b', text: 'It was made with more skill', isCorrect: false },
          { id: 'c', text: 'It is not useful for anything', isCorrect: false },
          { id: 'd', text: 'It hangs in a gallery', isCorrect: false },
        ],
        explanation: 'The route decides it, not the result. Skill will not do the job: a chair can be made better than a sculpture. Uselessness will not either, since a cathedral holds a congregation. And the gallery answer moves the question to whoever runs the gallery.',
      },
    },
    {
      type: 'question',
      prompt: 'What is the strongest objection to this line?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Plenty of great art was made exactly to a commission', isCorrect: true },
          { id: 'b', text: 'Nobody can see how a thing was made', isCorrect: false },
          { id: 'c', text: 'Craft is more valuable anyway', isCorrect: false },
          { id: 'd', text: 'All making is planned to some degree', isCorrect: false },
        ],
        explanation: 'The commissions are the hard cases. Ceiling frescoes, requiems and altarpieces were ordered by the metre with the subject fixed in advance, and dropping them from the category is a cost no theory can quietly pay.',
      },
    },
    {
      type: 'summary',
      title: 'Two Routes',
      keyPoints: [
        'Craft closes a gap between a plan and a thing',
        'Art is said to have no plan to close',
        'The difference is in the making, not the object',
        'Commissioned masterpieces are the standing objection',
      ],
      closingThought: 'Most real making is a bit of both, and that is not a failure of the distinction. It is what makes asking about a particular thing worth doing.',
    },
  ],
};

export default lesson;
