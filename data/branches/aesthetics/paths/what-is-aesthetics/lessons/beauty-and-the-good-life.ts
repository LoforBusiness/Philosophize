import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-30',
  slug: 'beauty-and-the-good-life',
  title: 'What Is Beauty For?',
  description: 'The capstone. After all the theories — what role should beauty actually play in a life?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You could live without beauty. Should you?',
      subtext: 'Food keeps you alive. Shelter keeps you safe. What does beauty keep?',
      emoji: '🌅',
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve travelled the whole map of aesthetics.',
      body: 'Taste and the sublime, what counts as art, music\'s sadness, the aura, class and kitsch, the avant-garde, the everyday, and truth in fiction. The capstone question gathers them: granting all of it, what place should beauty hold in a human life well lived?',
      emoji: '🗺️',
    },
    {
      type: 'concept',
      title: 'Beauty as Luxury or Necessity?',
      body: 'One view: beauty is decoration — pleasant, optional, the first thing cut when life gets hard. The rival view: beauty is a basic human need. We don\'t merely want to survive; we want lives worth surviving for. On this view, the aesthetic isn\'t the icing — it\'s part of what makes the cake worth eating.',
      visual: '🍰',
      highlight: 'beauty as a need',
    },
    {
      type: 'example',
      title: 'Stendhal in Florence',
      scenario: 'Some travellers, overwhelmed by a city dense with art and beauty, report dizziness, racing hearts, even fainting — a reaction nicknamed "Stendhal syndrome," after the writer who described his own near-swoon in Florence. Whatever the science, the story captures a truth: beauty can strike with the force of an event, not a luxury.',
      source: 'After Stendhal, Naples and Florence (1817)',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Beauty as a Call to Attention',
      body: 'Iris Murdoch offered a striking answer. Beauty — a kestrel hovering, a great painting — pulls us out of the anxious, self-obsessed ego and fixes us on something real outside ourselves. This "unselfing" is moral training. Learning to truly attend to beauty, she argued, is practice for truly attending to other people.',
      visual: '🦅',
      highlight: 'unselfing',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-30-1',
      quote: 'The appreciation of beauty in art or nature is... a completely adequate entry into the good life. It is the checking of selfishness.',
      author: 'Iris Murdoch',
      era: '1970',
      work: 'The Sovereignty of Good',
    },
    {
      type: 'dilemma',
      scenario: 'You have one free evening and a little money. You could donate it to a hunger charity, or spend it on a concert that will move you deeply. A friend says spending on beauty while others go hungry is indulgent. You wonder whether a life with no room for beauty is a life worth defending at all.',
      prompt: 'What place should beauty hold against other goods?',
      choices: [
        { id: 'luxury', label: 'A luxury — duty and need come first' },
        { id: 'need', label: 'A genuine need — part of a life worth living' },
        { id: 'balance', label: 'Neither rules: a good life balances both' },
      ],
      views: [
        { thinker: 'Iris Murdoch', stance: 'Attending to beauty is moral practice', why: 'Beauty unselfs us, drawing attention away from the ego toward reality. Far from a distraction from goodness, learning to truly attend to beauty trains the very attention that ethics demands.' },
        { thinker: 'A utilitarian', stance: 'Relieve suffering first', why: 'When a fixed sum could ease real hunger, spending it on personal pleasure is hard to justify. Beauty is good, but acute suffering has the stronger claim. Maximise the welfare you can.' },
        { thinker: 'Aristotle', stance: 'A flourishing life needs both', why: 'Eudaimonia is not bare survival but a complete life of virtuous activity — which includes contemplation and the enjoyment of fine things. A life with no room for beauty falls short of flourishing.' },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What Beauty Is For',
      keyPoints: [
        'Is beauty a luxury, or a basic human need?',
        'Beauty can strike with the force of an event',
        'Murdoch: beauty "unselfs" us — moral training',
        'A flourishing life may need room for the beautiful',
      ],
      closingThought: 'You\'ve learned what beauty is. The last lesson is to let it stop you in your tracks.',
    },
  ],
};

export default lesson;
