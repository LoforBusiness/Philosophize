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
      headline: 'You look at the world all day, yet rarely see it.',
      subtext: 'Aesthetics is attention training. It teaches the eye to wake up.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Attention as a Skill',
      body: 'Murdoch borrowed from Simone Weil: attention is "a just and loving gaze" at one reality. Normally the "fat, relentless ego" filters everything. Real attention quiets it so reality comes forward.',
      visual: '🔍',
      highlight: 'unselfing',
    },
    {
      type: 'example',
      title: 'Murdoch and the Kestrel',
      scenario: 'At a window, anxious and brooding over a bruise to her pride, Murdoch sees a hovering kestrel. In a moment the brooding self vanishes — nothing now but kestrel. She called this "unselfing."',
      source: 'Iris Murdoch, The Sovereignty of Good (1970)',
      emoji: '🦅',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-5-1',
      quote: 'I observe a hovering kestrel. In a moment everything is altered. The brooding self with its hurt vanity has disappeared.',
      author: 'Iris Murdoch',
      era: '1970',
      work: 'The Sovereignty of Good',
    },
    {
      type: 'question',
      prompt: 'What did Iris Murdoch mean by "unselfing"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Some real thing absorbs you so fully the ego drops away', isCorrect: true },
          { id: 'b', text: 'A meditation technique for shedding your identity', isCorrect: false },
          { id: 'c', text: 'Deciding the self is an illusion', isCorrect: false },
          { id: 'd', text: 'Putting others\' needs above your own', isCorrect: false },
        ],
        explanation: 'Unselfing is not a technique you perform but something that happens to you: a kestrel or artwork grips you so wholly the self-preoccupied ego vanishes.',
      },
    },
    {
      type: 'example',
      title: 'Ruskin\'s Drawing Lessons',
      scenario: 'Ruskin taught that drawing recovers "the innocence of the eye" — seeing patches of color as they truly are, before the mind swaps in its idea. Students studied one leaf before any tree.',
      source: 'John Ruskin, The Elements of Drawing (1857)',
      emoji: '🍃',
    },
    {
      type: 'question',
      prompt: 'Ruskin had students draw a single leaf for hours. What was the real goal?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To master leaves before drawing harder subjects', isCorrect: false },
          { id: 'b', text: 'To produce a gallery-worthy finished picture', isCorrect: false },
          { id: 'c', text: 'To retrain the eye to see colors, not its idea of the thing', isCorrect: true },
          { id: 'd', text: 'To prove that talent matters more than practice', isCorrect: false },
        ],
        explanation: 'The trap: "drawing class, so the goal is a good drawing." For Ruskin the payoff was sharpened vision — "the innocence of the eye" — not a masterpiece.',
      },
    },
    {
      type: 'summary',
      title: 'Aesthetics Changes How You See',
      keyPoints: [
        'Murdoch: loving attention dissolves the ego',
        'Perception is a skill you can sharpen',
        'Aesthetics is attention, not just art',
      ],
      closingThought: 'Aesthetics trains you to truly see what already surrounds you.',
    },
  ],
};

export default lesson;
