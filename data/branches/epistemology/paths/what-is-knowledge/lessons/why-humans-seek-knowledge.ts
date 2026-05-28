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
      headline: 'Aristotle\'s first line: "All men by nature desire to know."',
      subtext: 'Written 2,400 years ago — and it still feels completely true.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Claim',
      body: 'Aristotle began his Metaphysics with one of the most famous lines in philosophy: "All men by nature desire to know." He wasn\'t talking about practical knowledge for survival. He meant that humans are uniquely drawn to understanding for its own sake — for the sheer joy and wonder of it. Curiosity is part of what makes us human.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'The Evidence Aristotle Used',
      scenario: 'Aristotle pointed to our love of the senses as proof. We delight in sight, smell, and sound even when they serve no practical purpose. We watch a sunset for no survival reason. We listen to music we don\'t need. He argued that this pleasure in perception — in just experiencing the world — is the seed of all philosophical inquiry.',
      source: 'Aristotle, Metaphysics, Book I (~350 BCE)',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Curiosity as a Philosophical Virtue',
      body: 'For ancient philosophers, curiosity was not a distraction — it was a virtue, a mark of an excellent human being. Wonder (thaumazein in Greek) was considered the beginning of philosophy itself. To be curious is to be alive to the world. To stop asking questions is, in a sense, to stop growing as a thinker.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Knowledge as Power and as Wonder',
      body: 'Francis Bacon famously declared "knowledge is power" — knowing how the world works lets you change it. But philosophers from Aristotle onward also saw knowledge as its own reward: wonder, beauty, the satisfaction of understanding. The best knowledge serves both purposes: it empowers you and fills you with awe at the same time.',
      visual: '⚡',
      highlight: 'knowledge is power',
    },
    {
      type: 'question',
      prompt: 'According to Aristotle, why do humans desire knowledge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is part of human nature to seek understanding', isCorrect: true },
          { id: 'b', text: 'Only to gain power over others', isCorrect: false },
          { id: 'c', text: 'Because society forces us to learn', isCorrect: false },
          { id: 'd', text: 'To avoid the fear of death', isCorrect: false },
        ],
        explanation: 'Aristotle believed the desire to know is built into human nature itself — not driven by external force or purely practical goals, but by an innate love of understanding and wonder at the world.',
      },
    },
    {
      type: 'question',
      prompt: 'The Greek word "thaumazein" refers to wonder as the starting point of philosophy.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Thaumazein (wonder or amazement) was seen by Aristotle and Plato as the origin of philosophy. When humans encounter something puzzling or awe-inspiring and ask "why?", that is the moment philosophical thinking begins.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve explored why humans are driven to seek knowledge.',
      body: 'The fact that you\'re here — choosing to study philosophy when you didn\'t have to — is Aristotle\'s point made real. You are exercising what he called the highest human capacity: the pure, intrinsic desire to understand. That impulse is not a quirk. It is exactly what makes you human.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'The Human Drive to Know',
      keyPoints: [
        'Aristotle: all humans naturally desire to understand',
        'Wonder (thaumazein) is where philosophy begins',
        'Curiosity is a virtue, not a distraction',
        'Knowledge can be both power and pure wonder',
      ],
      closingThought: 'Every question you ask is proof that Aristotle was right — curiosity is not just something you do, it is something you are.',
    },
  ],
};

export default lesson;
