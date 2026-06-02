import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-5',
  slug: 'why-humans-seek-knowledge',
  title: 'Why Are Humans Driven to Know Things?',
  description: 'From Aristotle\'s bold opening claim to the philosophy of curiosity — explore why humans can\'t stop asking why.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Aristotle\'s opening line: "All men by nature desire to know."',
      subtext: 'Written some 2,400 years ago — and it still rings true today.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Claim',
      body: 'Aristotle opened his Metaphysics with one of philosophy\'s most enduring lines: "All men by nature desire to know." He did not mean knowledge useful for survival. He meant that we are drawn to understanding for its own sake — for the sheer wonder of it. That hunger is woven into what it is to be human.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'The Evidence Aristotle Offered',
      scenario: 'As proof, Aristotle pointed to our love of the senses. We delight in sight and sound and scent long after any usefulness has gone. We watch a sunset that asks nothing of us; we listen to music we do not need. This sheer pleasure in perceiving the world, he held, is the first seed of all philosophy.',
      source: 'Aristotle, Metaphysics, Book I (~350 BCE)',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Curiosity as a Philosophical Virtue',
      body: 'To the ancients, curiosity was no idle distraction but a virtue, the signature of a fine mind. Wonder — thaumazein in Greek — they named the very beginning of philosophy. To be curious is to stay awake to the world. To cease asking is, in some quiet way, to stop becoming a thinker at all.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Knowledge as Power and as Wonder',
      body: 'Francis Bacon declared that "knowledge is power" — grasp how the world works and you may reshape it. Yet from Aristotle onward, thinkers prized knowledge as its own reward: wonder, beauty, the deep ease of understanding. The finest knowledge does both at once — it arms your hand and stirs your awe.',
      visual: '⚡',
      highlight: 'knowledge is power',
    },
    {
      type: 'question',
      prompt: 'According to Aristotle, why do human beings desire knowledge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Seeking understanding belongs to human nature itself', isCorrect: true },
          { id: 'b', text: 'Only to win power and advantage over others', isCorrect: false },
          { id: 'c', text: 'Because society compels us to keep learning', isCorrect: false },
          { id: 'd', text: 'To hold the fear of death at a distance', isCorrect: false },
        ],
        explanation: 'For Aristotle, the desire to know is sewn into human nature — driven neither by outside pressure nor mere usefulness, but by an inborn love of understanding and wonder at the world.',
      },
    },
    {
      type: 'question',
      prompt: 'The Greek word "thaumazein" names wonder as the very starting point of philosophy.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Thaumazein — wonder, amazement — was for Aristotle and Plato the origin of philosophy. The instant we meet something baffling or awe-inspiring and ask "why?", philosophical thinking quietly begins.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have traced why human beings are driven to seek knowledge.',
      body: 'That you are here at all — choosing philosophy when nothing required it — is Aristotle\'s claim made flesh. You are exercising what he prized as the highest human capacity: the pure, unbidden desire to understand. That impulse is no quirk. It is among the truest marks of being human.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'The Human Drive to Know',
      keyPoints: [
        'Aristotle: to understand is part of our very nature',
        'Wonder (thaumazein) is where philosophy first stirs',
        'Curiosity is a virtue, never a mere distraction',
        'Knowledge can be both power and pure wonder at once',
      ],
      closingThought: 'Every question you raise proves Aristotle right — curiosity is not only something you do, it is something you are.',
    },
  ],
};

export default lesson;
