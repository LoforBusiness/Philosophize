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
      headline: 'Most people look — but very few ever truly see.',
      subtext: 'Aesthetics is the slow training of attention, until the world wakes up around you.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Attention as a Moral Skill',
      body: 'Iris Murdoch held that to truly see a thing — a person, a place, a painting — takes an act of will. By habit we look only for what is useful, skimming the world for our own ends. Aesthetic attention means stepping outside the self and beholding what is really there. For Murdoch, this was no mere art of the eye, but a discipline of the soul.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'Murdoch told of being lost in some sour, resentful brooding when she glanced up and saw a kestrel hanging in the air. The bird\'s beauty seized her whole attention, and the small anxious self simply dissolved. She named this "unselfing" — beauty drawing the mind out of its cramped orbit. Art, she thought, teaches us to enter that clearing on purpose.',
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
          { id: 'a', text: 'Attending so wholly to something that self-absorption falls away', isCorrect: true },
          { id: 'b', text: 'Shedding your personal identity through meditation', isCorrect: false },
          { id: 'c', text: 'Concluding that the self is an illusion', isCorrect: false },
          { id: 'd', text: 'Placing others\' needs above your own', isCorrect: false },
        ],
        explanation: 'Murdoch\'s "unselfing" names the experience of genuine attention — when something beautiful or real takes hold of the mind so completely that the ego\'s restless chatter falls silent. She found this transformative at once aesthetically and morally.',
      },
    },
    {
      type: 'concept',
      title: 'Noticing Beauty Is a Skill',
      body: 'A trained painter finds twenty greys in a grey sky; a musician hears whole harmonies folded into street noise. These are not gifts of birth but powers slowly grown. Aesthetic education does more than recite art history — it remakes perception itself, teaching the eye to find abundance where habit had only seen the plain.',
      visual: '🎨',
      highlight: 'perceptual education',
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'The Victorian critic John Ruskin taught that drawing was never about talent, but about learning to see. His pupils spent hours over a single leaf before they dared a whole tree. The point was not to make art but to school the eye in what it had always overlooked — the exact bend of a stem, the wayward veins. Seen so, the leaf could never look ordinary again.',
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
        explanation: 'Ruskin famously held that most people never truly see what lies before them — they see only their idea of it. Drawing forces the eye to meet reality face to face. The aim was a transformation of perception, not a finished piece.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Across these lessons you have explored beauty, emotion, and art.',
      body: 'All of aesthetics gathers here: in the quality of attention you carry into the world. Kant found beauty in disinterested regard, Tolstoy in honest feeling, Duchamp in the bare question itself. Each, in his way, was teaching you to look anew — with philosophy walking beside you as a guide.',
      emoji: '🌟',
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: true attention quiets the noise of the self',
        'Noticing beauty is a perceptual skill you can grow',
        'Aesthetics is less about art than about attention',
      ],
      closingThought: 'The world is already extraordinary; aesthetics only teaches you to notice.',
    },
  ],
};

export default lesson;
