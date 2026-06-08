import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-5',
  slug: 'seeing-the-world-differently',
  title: 'Seeing the World Differently',
  description: 'How attention to beauty becomes a way of perceiving reality.',
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
      body: 'Iris Murdoch borrowed a phrase from Simone Weil: attention is "a just and loving gaze" at a single reality, a face, a tree, a painting. Normally the "fat, relentless ego" filters the world through our own concerns. Real attention quiets that ego so reality can come forward. For Murdoch this is at once aesthetic and moral.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'Murdoch describes herself at a window, anxious and resentful, brooding over some bruise to her pride. Then she sees a hovering kestrel. "In a moment everything is altered. The brooding self with its hurt vanity has disappeared. There is nothing now but kestrel." She called this "unselfing", and held that great art lets us reach it on purpose.',
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
          { id: 'a', text: 'Some real thing absorbs you so fully that the ego drops away', isCorrect: true },
          { id: 'b', text: 'A meditation technique for letting go of your identity', isCorrect: false },
          { id: 'c', text: 'Deciding that the self is an illusion', isCorrect: false },
          { id: 'd', text: 'Putting others\' needs above your own', isCorrect: false },
        ],
        explanation: 'For Murdoch, "unselfing" is not a technique you perform but something that happens to you: a kestrel, or a great artwork, grips you so wholly that the self-preoccupied ego simply vanishes. She prized this as both an aesthetic and a moral achievement.',
      },
    },
    {
      type: 'concept',
      title: 'Perception You Can Train',
      body: 'A painter spots a dozen greys in one grey sky; a musician hears structure inside ordinary noise. These are skills, not gifts, sharpened over years. Aesthetics is not just dates and names. Learning to attend to art and nature can retrain perception itself, so the familiar world suddenly shows you more.',
      visual: '🎨',
      highlight: 'perceptual education',
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'The Victorian critic John Ruskin taught that drawing is really about recovering "the innocence of the eye", seeing flat patches of colour as they truly are, before the mind swaps in its idea of the thing. So his students studied a single leaf patiently before any whole tree. The aim was not a pretty picture but an honest, retrained eye.',
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
        explanation: 'Ruskin held that we usually see only our idea of a thing, never the colours actually before us. Drawing forces a slow, honest look, recovering what he called "the innocence of the eye". The payoff was sharpened vision, not a finished masterpiece.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty, emotion, and art, all covered.',
      body: 'So much of aesthetics circles one question: how closely do you look? Kant praised a pleasure indifferent to whether you can use the thing, Tolstoy the feeling art passes between people, Duchamp the riddle of what counts as art at all. Each, in its own way, dares you to look harder.',
      emoji: '🌟',
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: loving attention can dissolve the brooding ego',
        'Perception is a skill you can sharpen',
        'Aesthetics is about attention, not just art',
      ],
      closingThought: 'Aesthetics trains you to truly see what already surrounds you.',
    },
  ],
};

export default lesson;
