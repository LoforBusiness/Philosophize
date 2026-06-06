import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-5',
  slug: 'seeing-the-world-differently',
  title: 'Seeing the World Differently',
  description: 'How attention to beauty becomes a way of perceiving the world.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You look at the world all day, but rarely truly see it.',
      subtext: 'Aesthetics is attention training. It teaches the eye to wake up.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Attention as a Skill',
      body: 'The philosopher Iris Murdoch argued that really seeing something, a face, a tree, a painting, takes effort. Normally we scan the world for what is useful and skip the rest. True attention quiets your own concerns and lets reality come forward. Murdoch called this discipline both aesthetic and moral.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'Murdoch tells of brooding, anxious and resentful, when she glanced up and saw a kestrel hovering. The bird seized her whole attention, and the petty self-focused mood simply dissolved. She named this "unselfing": beauty yanking the mind out of its own orbit. Great art, she held, lets us trigger that release deliberately.',
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
        explanation: 'For Murdoch, "unselfing" happens when something beautiful or real grips your attention so completely that anxious self-focus loosens its hold. She prized this as both an aesthetic and a moral achievement.',
      },
    },
    {
      type: 'concept',
      title: 'Perception You Can Train',
      body: 'A painter spots a dozen greys in one grey sky; a musician hears structure inside ordinary noise. These are not gifts but skills, sharpened over years. Aesthetics is not just dates and names. Studying art rewires perception itself, so that the familiar world suddenly shows you more.',
      visual: '🎨',
      highlight: 'perceptual education',
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'The Victorian critic John Ruskin insisted drawing is not about talent but about learning to see. His students pored over a single leaf for hours before attempting a whole tree. The aim was never a pretty picture, but a retrained eye that catches what it normally races past, the exact curve of a stem. Afterward, the leaf looked transformed.',
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
        explanation: 'Ruskin held that most people see only their idea of a thing, never the thing itself. Drawing forces a slow, honest look at what is actually there. The payoff was sharpened vision, not a finished masterpiece.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty, emotion, and art, all covered.',
      body: 'So much of aesthetics circles one question: how closely do you look? Kant prized disinterested delight, Tolstoy the feeling art passes between people, Duchamp the riddle of what counts as art at all. Each, in its own way, dares you to look harder.',
      emoji: '🌟',
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: real attention dissolves self-focused worry',
        'Perception is a skill you can sharpen',
        'Aesthetics is about attention, not just art',
      ],
      closingThought: 'Aesthetics trains you to truly see what already surrounds you.',
    },
  ],
};

export default lesson;
