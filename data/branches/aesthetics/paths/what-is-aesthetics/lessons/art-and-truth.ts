import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-29',
  slug: 'art-and-truth',
  title: 'Can a Novel Teach You Something True?',
  description: 'A made-up story is, by definition, false. So how could it ever teach you anything real?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'It never happened. And yet it taught you something true.',
      subtext: 'A novel about people who never lived can leave you knowing the world better. How?',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'The Puzzle of Cognitive Value',
      body: 'Fiction is, on its face, false — the events never occurred. So how can it teach? This is the question of art\'s cognitive value: whether novels, films, and paintings give us genuine knowledge, or only entertainment dressed up as wisdom. Plato suspected the worst; others see art as a unique road to truth.',
      visual: '🧠',
      highlight: 'cognitive value',
    },
    {
      type: 'example',
      title: 'Plato Banishes the Poets',
      scenario: 'In the Republic, Plato wants poets exiled from the ideal city. Art, he argues, is mere imitation — a copy of a copy, twice removed from truth. Worse, it stirs the emotions over the reason, feeding our lowest appetites. The painter who copies a bed knows nothing real about beds. To Plato, art misleads.',
      source: 'Plato, Republic, Book X (c. 375 BCE)',
      emoji: '🛏️',
    },
    {
      type: 'concept',
      title: 'Knowing How, Not Just Knowing That',
      body: 'A reply: fiction gives knowledge of a different kind. A textbook tells you that grief exists. A great novel lets you inhabit grief from inside — its texture, its self-deceptions, what it is like. This is knowledge by acquaintance and empathy: not new facts, but deepened understanding of the ones we have.',
      visual: '💡',
      highlight: 'understanding',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-29-1',
      quote: 'The poet... is far removed from the truth... he is the maker of an image.',
      author: 'Plato',
      era: 'c. 375 BCE',
      work: 'Republic',
      philosopherId: 'plato',
    },
    {
      type: 'question',
      prompt: 'A war novel leaves a reader saying she understands those soldiers now. What did she get?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A deeper grasp of courage and fear', isCorrect: true },
          { id: 'b', text: 'Nothing at all, since the soldiers are invented', isCorrect: false },
          { id: 'c', text: 'New historical facts about the war', isCorrect: false },
          { id: 'd', text: 'A feeling she mistook for knowledge', isCorrect: false },
        ],
        explanation: 'A deeper grasp. The soldiers are invented, so no new fact changed hands, and what changed is knowing courage and fear from inside. Calling that a mere feeling assumes knowledge only ever means fresh information.',
      },
    },
    {
      type: 'question',
      prompt: 'How much does a novel hand over about the world?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No new facts, but a deeper grasp', isCorrect: true },
          { id: 'b', text: 'A pleasant lie, and nothing more', isCorrect: false },
          { id: 'c', text: 'A textbook with invented characters', isCorrect: false },
          { id: 'd', text: 'Exactly what a history book hands over', isCorrect: false },
        ],
        explanation: 'Understanding rather than information. Plato called the poet a maker of images, twice removed from the truth. The reply is that a false story can still show a real thing clearly, which is why the novel is not simply a worse history book.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Two kinds of "knowing" are in play.',
      body: 'The objection assumes knowledge means new facts. But fiction\'s gift may be understanding — seeing a familiar thing, like grief or courage, with fresh depth and from the inside. By that measure, a false story can carry a real truth about how things are.',
      emoji: '🔑',
    },
    {
      type: 'summary',
      title: 'Truth in Make-Believe',
      keyPoints: [
        'Fiction is literally false, yet seems to teach',
        'Plato: art imitates, misleads, and inflames feeling',
        'Aristotle: poetry shows universal, probable patterns',
        'Fiction may give understanding, not just facts',
      ],
      closingThought: 'The best fiction lies about everything except the things that matter.',
    },
  ],
};

export default lesson;
