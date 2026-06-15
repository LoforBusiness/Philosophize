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
      type: 'dilemma',
      scenario: 'A reader says a war novel taught her more about courage and fear than any history book — she understands those soldiers now. A skeptic counters: she learned nothing; the soldiers are invented, the "lessons" are just feelings she projected onto a fiction. No actual knowledge changed hands.',
      prompt: 'Did the novel genuinely teach her something?',
      choices: [
        { id: 'yes', label: 'Yes — it gave real understanding of courage and fear' },
        { id: 'no', label: 'No — invented stories cannot supply knowledge' },
        { id: 'feeling', label: 'It moved her, but moving isn\'t teaching' },
      ],
      views: [
        { thinker: 'Aristotle', stance: 'Poetry is more philosophical than history', why: 'History records what happened; poetry shows what would happen — the universal patterns of human action. By dramatising what is typical and probable, fiction teaches truths a list of mere facts cannot.' },
        { thinker: 'Martha Nussbaum', stance: 'Novels cultivate moral understanding', why: 'By making us imaginatively inhabit other lives, fiction trains the perception and empathy ethical life requires. The novel does real cognitive and moral work no argument or data set can replace.' },
        { thinker: 'Plato', stance: 'Imitation misleads, it doesn\'t teach', why: 'Art is twice removed from truth and inflames feeling over reason. What feels like insight is emotional manipulation. The skeptic is right: she gained sensation, not knowledge.' },
      ],
      xpValue: 5,
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
