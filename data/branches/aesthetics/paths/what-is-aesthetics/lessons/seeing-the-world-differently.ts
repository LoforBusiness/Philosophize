import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-5',
  slug: 'seeing-the-world-differently',
  title: 'Seeing the World Differently',
  description: 'Learn how aesthetic education trains you to notice what others walk past.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Most people look — but very few actually see.',
      subtext: 'Aesthetics is the practice of training your attention until the world comes alive.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Attention as a Moral Skill',
      body: 'Iris Murdoch argued that truly seeing something — a person, a place, a work of art — requires an act of will. We usually look through habit, filtering reality for what is useful. Aesthetic attention means stepping out of the self and genuinely perceiving what is there. For Murdoch, this was not just an art skill but a moral one.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'Murdoch described being trapped in resentful thoughts when she looked up and saw a kestrel hovering overhead. In that moment the bird\'s beauty demanded her full attention, and her self-absorbed anxieties dissolved. She called this "unselfing" — the world\'s beauty pulling consciousness out of its narrow orbit. Art trains us to access this state deliberately.',
      source: 'Iris Murdoch, The Sovereignty of Good (1970)',
      emoji: '🦅',
    },
    {
      type: 'question',
      prompt: 'What did Iris Murdoch mean by "unselfing"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Attending so fully to something that self-absorption dissolves', isCorrect: true },
          { id: 'b', text: 'Losing your personal identity through meditation', isCorrect: false },
          { id: 'c', text: 'Deciding that the self is an illusion', isCorrect: false },
          { id: 'd', text: 'Prioritising others\' needs over your own', isCorrect: false },
        ],
        explanation: 'Murdoch\'s "unselfing" describes the experience of genuine attention — when something beautiful or real fully absorbs your consciousness, crowding out the ego\'s constant chatter. She saw this as both aesthetically and morally transformative.',
      },
    },
    {
      type: 'concept',
      title: 'Noticing Beauty Is a Skill',
      body: 'A trained painter sees twenty shades of grey in a cloudy sky. A musician hears harmonic layers in street noise. These are not gifts — they are developed capacities. Aesthetic education does not just teach art history. It rebuilds perception itself, teaching you to find richness where habit sees plainness.',
      visual: '🎨',
      highlight: 'perceptual education',
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'Victorian critic John Ruskin taught that drawing was not about talent — it was about learning to see. His students spent hours drawing a single leaf before sketching a tree. The exercise was not to produce art but to force the eye to notice what it had always ignored: the precise curve of a stem, the asymmetry of veins. Once seen this way, the leaf never looked ordinary again.',
      source: 'John Ruskin, The Elements of Drawing (1857)',
      emoji: '🍃',
    },
    {
      type: 'question',
      prompt: 'Ruskin believed drawing lessons were primarily about developing the ability to see, not produce art. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Ruskin famously argued that most people do not actually see what is in front of them — they see their idea of it. Drawing forces the eye to confront reality directly. The goal was perceptual transformation, not technical output.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Across these lessons you have explored beauty, emotion, and art.',
      body: 'All of aesthetics points here: to the quality of attention you bring to the world. Kant found beauty in disinterested attention. Tolstoy found it in emotional honesty. Duchamp found it in the question itself. Each was training you to look differently — with philosophy as your guide.',
      emoji: '🌟',
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: genuine attention dissolves the self\'s noise',
        'Noticing beauty is a learnable perceptual skill',
        'Aesthetics is not just about art — it is about attention',
      ],
      closingThought: 'The world is already extraordinary. Aesthetics teaches you to notice.',
    },
  ],
};

export default lesson;
