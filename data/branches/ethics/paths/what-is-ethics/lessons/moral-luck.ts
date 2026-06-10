import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-7',
  slug: 'moral-luck',
  title: 'Moral Luck: Judged for What We Cannot Control',
  description: 'Two reckless drivers, one tragedy, one near-miss. Why blame them differently?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two drunk drivers. Only one hits a child.',
      subtext: 'Same choice, same recklessness. We blame one far more. Is that fair?',
      emoji: '🎲',
    },
    {
      type: 'concept',
      title: 'The Control Principle',
      body: 'A deep intuition says we should be judged only for what we control. Yet we praise and blame people constantly for outcomes that luck, not their will, decided.',
      visual: '🧭',
      highlight: 'the control principle',
    },
    {
      type: 'example',
      title: 'Williams and Nagel Name It',
      scenario: 'In a 1976 exchange, Bernard Williams and Thomas Nagel coined moral luck. Williams pointed to Gauguin, who abandoned his family to paint; only later success seems to vindicate the gamble. Nagel showed luck infecting nearly every judgment.',
      source: 'Williams and Nagel, Moral Luck (1976)',
      emoji: '🖼️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-7-1',
      quote: 'The things we are called upon to do, the moral tests we face, are importantly determined by factors beyond our control.',
      author: 'Thomas Nagel',
      era: '1979',
      work: 'Moral Luck',
    },
    {
      type: 'reinforcement',
      callout: 'Luck slips in four ways.',
      body: 'Nagel mapped four kinds: luck in how things turn out, in the tests we meet, in who we become, and in our very makeup. Control shrinks at every turn.',
      emoji: '🍀',
    },
    {
      type: 'question',
      prompt: 'What tension does moral luck expose in how we assign blame?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We judge people for outcomes shaped by luck, not just their will', isCorrect: true },
          { id: 'b', text: 'People are never responsible for anything they do', isCorrect: false },
          { id: 'c', text: 'Luck always makes wrong actions turn out right', isCorrect: false },
          { id: 'd', text: 'Only intentions, never results, affect our judgments', isCorrect: false },
        ],
        explanation: 'Moral luck names the clash: we say blame tracks control, yet we blame the driver who happened to hit a child far more than the one who got home.',
      },
    },
    {
      type: 'question',
      prompt: 'Since the reckless driver who hits no one is just as guilty inside, moral luck must be an illusion. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Tempting, but that just restates the control principle. Williams and Nagel show our actual practice does blame the unlucky driver more, so the puzzle is real, not dissolved.',
      },
    },
    {
      type: 'summary',
      title: 'When Fortune Judges Us',
      keyPoints: [
        'We feel blame should track control',
        'Yet outcomes we cannot control sway judgment',
        'Williams and Nagel named this moral luck',
        'Luck shapes results, circumstances, even character',
      ],
      closingThought: 'You may be a better or worse person partly by luck, and that should unsettle you.',
    },
  ],
};

export default lesson;
