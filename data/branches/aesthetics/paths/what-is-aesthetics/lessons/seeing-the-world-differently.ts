import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-5',
  slug: 'seeing-the-world-differently',
  title: 'Seeing the World Differently',
  description: 'How paying attention to beauty trains you to notice more.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'We look at things all day, but rarely really see them.',
      subtext: 'Aesthetics is partly about training your attention to notice more.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Attention as a Skill',
      body: 'The philosopher Iris Murdoch said that really seeing something, a person, a place, a painting, takes effort. Usually we just scan the world for what is useful to us. Paying real attention means setting your own concerns aside and noticing what is actually there. For Murdoch, this was both an aesthetic and a moral skill.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'Murdoch described being stuck in anxious, resentful thoughts when she looked up and saw a kestrel hovering in the air. The bird took her full attention, and her worried, self-focused mood faded. She called this "unselfing": beauty pulling the mind out of itself. Art, she thought, helps us do this on purpose.',
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
          { id: 'a', text: 'Attending to something so fully that self-focus fades', isCorrect: true },
          { id: 'b', text: 'Letting go of your identity through meditation', isCorrect: false },
          { id: 'c', text: 'Deciding that the self is an illusion', isCorrect: false },
          { id: 'd', text: 'Putting others\' needs above your own', isCorrect: false },
        ],
        explanation: 'For Murdoch, "unselfing" is what happens when something beautiful or real grabs your attention so fully that your self-focused worries quiet down. She thought this mattered both aesthetically and morally.',
      },
    },
    {
      type: 'concept',
      title: 'Noticing Beauty Is a Skill',
      body: 'A trained painter sees many shades of grey in a grey sky; a musician hears patterns in ordinary noise. These are not just natural talents, but skills built over time. Learning about art is not only about facts and history. It can actually change how you perceive, helping you notice more in everyday things.',
      visual: '🎨',
      highlight: 'perceptual education',
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'The Victorian critic John Ruskin taught that drawing is not about talent but about learning to see. His students spent hours on a single leaf before drawing a whole tree. The goal was not to make art, but to train the eye to notice details it usually skips, like the exact bend of a stem. After that, the leaf looked different.',
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
        explanation: 'Ruskin argued that most people see only their idea of a thing, not the thing itself. Drawing forces you to look closely at what is really there. The point was to change how you see, not to make a finished picture.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have covered beauty, emotion, and art.',
      body: 'A lot of aesthetics comes down to attention, to how closely you look at the world. Kant focused on disinterested enjoyment, Tolstoy on shared feeling, Duchamp on the question of what art is. In different ways, each one asks you to look more carefully.',
      emoji: '🌟',
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: real attention quiets your self-focused worries',
        'Noticing beauty is a skill you can build',
        'Aesthetics is as much about attention as about art',
      ],
      closingThought: 'Aesthetics trains you to notice what is already around you.',
    },
  ],
};

export default lesson;
