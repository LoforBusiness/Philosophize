import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-28',
  slug: 'aesthetics-of-the-everyday',
  title: 'Beauty Beyond the Gallery',
  description: 'A perfect cup of coffee, a clean tackle, a city at dusk — is that aesthetics too?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You haven\'t been to a museum in months. You\'ve had aesthetic experiences all week.',
      subtext: 'The smell of rain. A well-organised desk. The arc of a perfect pass. Is that beauty too?',
      emoji: '☕',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier: everyday and environmental aesthetics (Lesson 19).',
      body: 'You saw that aesthetic appreciation reaches beyond art into nature and ordinary surroundings. Now we push further — into food, sport, and city life — and ask whether these "low" pleasures deserve the same serious attention philosophers gave to paintings.',
      emoji: '🔄',
    },
    {
      type: 'concept',
      title: 'The Everyday Turn',
      body: 'For centuries aesthetics meant fine art: paintings, symphonies, poems. Recent philosophers — Yuriko Saito, among others — argue that most of our aesthetic life happens elsewhere: in cooking, dressing, tidying, commuting. These everyday experiences aren\'t lesser. They shape how we feel far more than the rare gallery visit does.',
      visual: '🏙️',
      highlight: 'everyday aesthetics',
    },
    {
      type: 'example',
      title: 'The Aesthetics of Sport',
      scenario: 'A footballer threads a pass no one expected, and the stadium gasps. We call it "beautiful" — and we mean it. There\'s grace, timing, the satisfaction of form perfectly fitting purpose. Sport offers genuine aesthetic experience: not the depicting of beauty, but beauty enacted live, in real bodies, with real stakes.',
      emoji: '⚽',
    },
    {
      type: 'concept',
      title: 'The Worry: Does "Everything" Cheapen It?',
      body: 'A critic objects: if a tidy drawer and a Rembrandt are both "aesthetic," the word means nothing. Defenders reply: noticing beauty everywhere doesn\'t flatten art down — it enriches daily life up. The depth of a Rembrandt remains; we\'ve simply stopped ignoring the beauty already woven through ordinary hours.',
      visual: '🍳',
      highlight: 'aesthetic experience',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-28-1',
      quote: 'The aesthetic quality of our everyday life has a direct and lasting impact on our quality of life.',
      author: 'Yuriko Saito',
      era: '2007',
      work: 'Everyday Aesthetics',
    },
    {
      type: 'question',
      prompt: 'A friend insists, "Only real art can be beautiful — a great meal is just tasty, not aesthetic." What is the best reply?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Agreed — beauty is reserved for galleries and concert halls', isCorrect: false },
          { id: 'b', text: 'No — everyday things like food and sport can offer genuine aesthetic experience, not just sensation', isCorrect: true },
          { id: 'c', text: 'No — and this proves a sandwich is exactly as profound as a Rembrandt', isCorrect: false },
          { id: 'd', text: 'Agreed — if it isn\'t in a frame, it can\'t be appreciated', isCorrect: false },
        ],
        explanation: 'The trap is an unargued snobbery that fences "beauty" inside the artworld. But we attend to a dish\'s balance and presentation, not mere taste — that is aesthetic. Extending appreciation to the everyday needn\'t claim a sandwich rivals Rembrandt; option (c) overreaches the other way.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty Off the Wall',
      keyPoints: [
        'Most aesthetic experience happens outside art',
        'Food, sport, and cities invite real appreciation',
        'Everyday aesthetics enriches life, doesn\'t cheapen art',
        'Saito: daily beauty shapes our quality of life',
      ],
      closingThought: 'The next perfect cup of coffee is an aesthetic experience — if you let yourself notice.',
    },
  ],
};

export default lesson;
