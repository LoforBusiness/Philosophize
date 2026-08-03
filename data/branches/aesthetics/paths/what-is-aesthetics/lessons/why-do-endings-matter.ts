import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-32',
  slug: 'why-do-endings-matter',
  title: 'Why Do Endings Matter?',
  description: 'Three stories with exactly the same amount of good in them. One of them is better.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Same total. Different order. Is one of them better?',
      subtext: 'A bad last chapter can ruin a book you loved for four hundred pages.',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Shape Is Not Sum',
      body: 'If value were just a total, the order of events could not matter — the same goods rearranged would come to the same thing. But almost nobody believes a life that declined is as good as the identical life run the other way round.',
      visual: '📈',
      highlight: 'The order carries value',
    },
    {
      type: 'example',
      title: 'The Ruined Ending',
      scenario: 'A series you loved for years ends badly. You do not simply subtract the last hour — the whole thing feels different, including the parts you enjoyed. The ending reached backwards and changed what the earlier parts were.',
      source: 'Narrative value',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-32',
      quote: 'Count no man happy until he is dead.',
      author: 'Solon',
      era: 'c. 430 BC',
    },
    {
      type: 'question',
      prompt: 'Three lives, identical totals. Which one goes better?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one that improves — bad first, good later', isCorrect: true },
          { id: 'b', text: 'The one that declines — the good years came while they could be enjoyed', isCorrect: false },
          { id: 'c', text: 'The steady one, with no bad stretch at all', isCorrect: false },
          { id: 'd', text: 'None — the totals are equal, so the lives are equal', isCorrect: false },
        ],
        explanation: 'D is the position the example is built to test. If a life were only a total, all three would be exactly as good and equally good to hear about. Almost nobody believes that, which means shape is doing real work.',
      },
    },
    {
      type: 'question',
      prompt: 'So what does that show about endings?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The order of events carries value the total cannot see', isCorrect: true },
          { id: 'b', text: 'The ending matters most because it is what you remember', isCorrect: false },
          { id: 'c', text: 'Nothing — preferring improvement is a bias we should correct', isCorrect: false },
          { id: 'd', text: 'That later goods are simply worth more than earlier ones', isCorrect: false },
        ],
        explanation: 'B explains the feeling and leaves the question open — we are asking what makes a life go well, not what it is like to look back on one. C is the honest hard line, and it has to call the declining life exactly as good.',
      },
    },
    {
      type: 'summary',
      title: 'The Shape of the Thing',
      keyPoints: [
        'Rearranging the same goods can change how good a life is',
        'Endings reach backwards and recolour what came before',
        'A total is blind to order; we plainly are not',
        'This is why stories have shapes and not just contents',
      ],
      closingThought: 'You are not living a pile of moments. You are living a shape, and you are somewhere in the middle of it.',
    },
  ],
};

export default lesson;
