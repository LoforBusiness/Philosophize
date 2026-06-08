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
      body: 'Strange fact: tragedy hurts, yet we crave it. In the Poetics, Aristotle says tragedy raises pity and fear, then works a katharsis of those emotions. But he never says what katharsis means. The favoured reading is a purging that leaves us lighter; others read it as clarity, or learning to feel rightly.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle in the Theatre of Dionysus',
      scenario: 'Picture ancient Athens. Crowds watch Oedipus discover he killed his father and married his mother. Aristotle prized this play for its plot: a reversal of fortune snapped tight by a moment of recognition. He also noted we take pleasure in lifelike images of even painful things, like corpses, because in seeing them we are learning what each thing is.',
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
        explanation: 'Catharsis is Aristotle\'s word for what tragedy does to pity and fear, though he never defines it. Mimesis means imitation, logos means reason or argument, and eudaimonia means flourishing. Only catharsis names that contested release.',
      },
    },
    {
      type: 'concept',
      title: 'Music Slips Past Reason',
      body: 'You cannot argue with a chord. A minor key floods you with sadness without offering a single reason. Schopenhauer claimed music is unique: the other arts copy ideas, but music is a copy of the will itself, our restless inner drive. That is why it strikes so deep. Plato called this same direct power a danger.',
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
          { id: 'a', text: 'It seeps into the soul and shapes character before reason can judge', isCorrect: true },
          { id: 'b', text: 'It lured workers away from their duties', isCorrect: false },
          { id: 'c', text: 'It cost too much to produce', isCorrect: false },
          { id: 'd', text: 'It required training most citizens could not afford', isCorrect: false },
        ],
        explanation: 'In the Republic, Plato says rhythm and harmony sink into the inmost soul and mould character. So he regulated the musical modes, keeping the steadfast Dorian and Phrygian and banning the soft ones, rather than banning music outright. His worry was the soul, not labour or cost.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Same power, opposite verdicts.',
      body: 'Plato and Schopenhauer agree music reaches us beneath reason. They split on what to do. Plato distrusted that pull and policed which modes the city allowed. Aristotle defended tragedy, holding the pity and fear it raises are worth feeling. The puzzle every culture keeps answering: is art\'s grip on us a gift or a threat?',
      emoji: '🌍',
    },
    {
      type: 'summary',
      title: 'We Love Songs and Stories',
      keyPoints: [
        'Aristotle: tragedy works a katharsis of pity and fear',
        'Schopenhauer: music alone copies the will itself',
        'Plato regulated the modes to guard the soul',
      ],
      closingThought: 'The next song that moves you echoes a question 2,400 years old.',
    },
  ],
};

export default lesson;
