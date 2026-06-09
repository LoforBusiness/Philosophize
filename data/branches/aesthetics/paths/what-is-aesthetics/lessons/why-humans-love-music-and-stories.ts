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
      headline: 'No culture has lived without song or story.',
      subtext: 'Not coincidence — a puzzle philosophers have chased for millennia.',
      emoji: '🎵',
    },
    {
      type: 'concept',
      title: 'Catharsis: Why Sad Stories Feel Good',
      body: 'Tragedy hurts, yet we crave it. In the Poetics, Aristotle says it raises pity and fear, then works a katharsis of them. He never defines the word.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle at the Theatre',
      scenario: 'Athens watches Oedipus learn he killed his father. Aristotle prized the plot: a reversal snapped tight by recognition. We even enjoy lifelike images of painful things — because seeing them, we learn.',
      source: 'Aristotle, Poetics (c. 335 BCE)',
      emoji: '🏟️',
    },
    {
      type: 'question',
      prompt: 'What did Aristotle call the emotional release felt after a tragic story?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Catharsis', isCorrect: true },
          { id: 'b', text: 'Mimesis', isCorrect: false },
          { id: 'c', text: 'Logos', isCorrect: false },
          { id: 'd', text: 'Eudaimonia', isCorrect: false },
        ],
        explanation: 'Catharsis names the contested release of pity and fear. Mimesis is imitation, logos is reason, eudaimonia is flourishing.',
      },
    },
    {
      type: 'concept',
      title: 'Music Slips Past Reason',
      body: 'A minor key floods you with sadness, no argument offered. Schopenhauer said music alone copies the will itself, our restless inner drive. Plato called that same direct power a danger.',
      visual: '🎸',
      highlight: 'pre-rational emotion',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-3-1',
      quote: 'Music is not, like the other arts, a copy of the Ideas, but a copy of the will itself.',
      author: 'Arthur Schopenhauer',
      era: '1818',
      work: 'The World as Will and Representation',
    },
    {
      type: 'question',
      prompt: 'In the Republic, why did Plato want to control music — and what did he actually do?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It shapes character before reason judges, so he banned all music', isCorrect: false },
          { id: 'b', text: 'It shapes the soul, so he regulated the modes — not a total ban', isCorrect: true },
          { id: 'c', text: 'It distracted workers, so he taxed it', isCorrect: false },
          { id: 'd', text: 'It was too costly, so only elites could hear it', isCorrect: false },
        ],
        explanation: 'The trap is "banned all music." Plato kept the steadfast modes and removed the soft ones — he regulated, not abolished. His worry was the soul, not cost.',
      },
    },
    {
      type: 'summary',
      title: 'We Love Songs and Stories',
      keyPoints: [
        'Aristotle: tragedy works a katharsis',
        'Schopenhauer: music copies the will',
        'Plato regulated the modes',
      ],
      closingThought: 'The next song that moves you echoes a question 2,400 years old.',
    },
  ],
};

export default lesson;
