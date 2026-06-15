import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-23',
  slug: 'virtue-epistemology',
  title: 'The Character Of A Good Thinker',
  description: 'Maybe knowledge is less about rules and more about who you are.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Stop asking what knowledge is. Ask who knows well.',
      subtext: 'What if good thinking is a character trait, like courage—not just a correct procedure?',
      emoji: '🧭',
    },
    {
      type: 'reinforcement',
      callout: 'So far the path has hunted for a recipe.',
      body: 'Lessons 8 and 11 chased the formula for knowledge: justification, truth, no luck. Lesson 22 looked at reliable processes. All of it treated knowing like a checklist. Virtue epistemology flips the lens from the belief to the believer.',
      emoji: '🔄',
    },
    {
      type: 'concept',
      title: 'Intellectual Virtues',
      body: 'Just as a good person has moral virtues like honesty, a good thinker has intellectual virtues: open-mindedness, curiosity, carefulness, intellectual courage, and humility. Knowledge, on this view, is true belief that arises from excellent intellectual character—from thinking well, not merely landing on the right answer.',
      visual: '🌱',
      highlight: 'intellectual virtues',
    },
    {
      type: 'example',
      title: 'Two Students, One Answer',
      scenario:
        'Two students hand in the same correct conclusion. One read three sources, weighed objections, and changed her first guess when the evidence pushed back. The other copied a confident post she happened to agree with. Both wrote the truth. Only one displayed the virtues—care, openness, courage—that make a thinker trustworthy over time.',
      emoji: '📚',
    },
    {
      type: 'concept',
      title: 'Intellectual Vices',
      body: 'Virtues have shadows. Closed-mindedness clings to a view despite evidence. Intellectual arrogance dismisses others by reflex. Gullibility swallows anything; wishful thinking believes what feels nice. These vices can lead you to truth by luck—but they corrode the character that lets you keep finding it.',
      visual: '🚫',
      highlight: 'intellectual vices',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-23-1',
      quote: 'Knowledge can be defined as a state of true belief arising out of acts of intellectual virtue.',
      author: 'Linda Zagzebski',
      era: '1996',
      work: 'Virtues of the Mind',
    },
    {
      type: 'question',
      prompt: 'A loud commentator is usually right about politics. Why might virtue epistemology still hesitate to call him a good knower?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'He reaches truth by closed-minded reflexes, not careful, open inquiry', isCorrect: true },
          { id: 'b', text: 'He is wrong, so his loudness does not matter at all', isCorrect: false },
          { id: 'c', text: 'Being usually right is all knowledge ever requires', isCorrect: false },
          { id: 'd', text: 'Politics is a topic no one can ever have knowledge about', isCorrect: false },
        ],
        explanation:
          'Option (c) is the tempting trap: it equates a good track record with good knowing. But a stopped clock and a stubborn pundit can both be "usually right" while modeling intellectual vice. Virtue epistemology judges the character behind the belief—openness, care, humility—not just the hit rate. A reliably-right closed mind is still a closed mind.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Virtue epistemology shifts focus to the knower',
        'Intellectual virtues: openness, humility, courage, care',
        'Intellectual vices corrode reliable inquiry',
        'Knowing well is a character, not just a checklist',
      ],
      closingThought: 'You cannot control every belief you will form. But you can cultivate the kind of mind that tends to form them well.',
    },
  ],
};

export default lesson;
