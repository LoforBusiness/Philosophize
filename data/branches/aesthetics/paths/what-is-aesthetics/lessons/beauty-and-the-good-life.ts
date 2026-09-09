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
      type: 'question',
      prompt: 'Murdoch calls the appreciation of beauty an unselfing. What does she mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Attention moves onto something real outside you', isCorrect: true },
          { id: 'b', text: 'You forget who you are for a while', isCorrect: false },
          { id: 'c', text: 'You decide that you do not matter', isCorrect: false },
          { id: 'd', text: 'Beauty replaces the need for morality', isCorrect: false },
        ],
        explanation: 'Attention moves outward. The anxious ego steps back because the kestrel has taken the room, which is not amnesia and not self-abasement. Murdoch calls the shift moral training: learning to attend to a bird is practice for attending to a person.',
      },
    },
    {
      type: 'question',
      prompt: 'While beauty is doing its work, where does the attention sit?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Almost entirely on the thing being looked at', isCorrect: true },
          { id: 'b', text: 'Half on the thing, half on yourself', isCorrect: false },
          { id: 'c', text: 'Entirely on your own reaction to it', isCorrect: false },
          { id: 'd', text: 'Nowhere in particular, which is the point', isCorrect: false },
        ],
        explanation: 'Almost all of it outward. Murdoch calls beauty the checking of selfishness, so a viewer still monitoring their own reaction has not been unselfed. The object does the work, and it can only do the work while it is what somebody is looking at.',
      },
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
