import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-3',
  slug: 'why-humans-love-music-and-stories',
  title: 'Why Humans Love Music and Stories',
  description: 'Aristotle, Plato, and Schopenhauer on the strange pull of art.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'No culture has ever lived without song or story.',
      subtext: 'Not coincidence. A puzzle. Philosophers have chased its answer for millennia.',
      emoji: '🎵',
    },
    {
      type: 'concept',
      title: 'Catharsis: Why Sad Stories Feel Good',
      body: 'Strange fact: tragedy hurts, yet we crave it. Aristotle saw the paradox. Watching disaster unfold, audiences feel pity and fear, then leave lighter, not crushed. He named this release katharsis, a purging of emotion. Art lets us rehearse grief and terror that are not truly ours, then walk away whole.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle in the Theatre of Dionysus',
      scenario: 'Picture ancient Athens. Thousands pack the stone seats to watch Oedipus discover he murdered his father and married his mother. They weep, though they chose to come. This is the scene Aristotle studied: crowds leaving not shattered but cleansed. The dread had been summoned, felt, and discharged. Pity and fear, raised on purpose, then released.',
      source: 'Aristotle, Poetics (c. 335 BCE)',
      emoji: '🏟️',
    },
    {
      type: 'question',
      prompt: 'What did Aristotle call the emotional release audiences feel after a tragic story?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Catharsis', isCorrect: true },
          { id: 'b', text: 'Mimesis', isCorrect: false },
          { id: 'c', text: 'Logos', isCorrect: false },
          { id: 'd', text: 'Eudaimonia', isCorrect: false },
        ],
        explanation: 'Catharsis is Aristotle\'s word for tragedy\'s release. Mimesis means imitation, logos means reason or argument, and eudaimonia means flourishing. Only catharsis names the purging of pity and fear the audience feels.',
      },
    },
    {
      type: 'concept',
      title: 'Music Slips Past Reason',
      body: 'You cannot argue with a chord. A minor key floods you with sadness without offering a single reason for it. Music strikes the feelings before thought can stand guard. Schopenhauer went furthest, calling music the voice of the will itself, deeper than any image. Plato called this same power a danger.',
      visual: '🎸',
      highlight: 'pre-rational emotion',
    },
    {
      type: 'question',
      prompt: 'Why did Plato worry about music\'s power in a just society?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It stirs emotions before reason can judge them', isCorrect: true },
          { id: 'b', text: 'It lured workers away from their duties', isCorrect: false },
          { id: 'c', text: 'It cost too much to produce', isCorrect: false },
          { id: 'd', text: 'It required training most citizens could not afford', isCorrect: false },
        ],
        explanation: 'In the Republic, Plato argued that music bypasses reason and shapes character directly. Fearing the wrong modes could corrupt citizens without their noticing, he proposed regulating which music the city allowed. His worry was the soul, not labour or cost.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Art moves us through time itself.',
      body: 'Aristotle and Plato spotted the same engine: art seizes emotion directly. Music and stories do it best because they unfold. A melody resolves in seconds, a tragedy over hours. Each carries you somewhere and returns you changed. That is the human need every culture keeps answering.',
      emoji: '🌍',
    },
    {
      type: 'summary',
      title: 'We Love Songs and Stories',
      keyPoints: [
        'Aristotle: tragedy purges pity and fear through catharsis',
        'Schopenhauer: music speaks straight to the will',
        'Plato feared music shapes character past reason',
      ],
      closingThought: 'The next song that moves you echoes a question 2,400 years old.',
    },
  ],
};

export default lesson;
