import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-5',
  slug: 'why-humans-seek-knowledge',
  title: 'Why Are Humans Driven to Know Things?',
  description: 'From Aristotle\'s famous opening line to the value of curiosity, explore why humans keep asking why.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Aristotle wrote: "All men by nature desire to know."',
      subtext: 'He wrote it about 2,400 years ago, and it still rings true.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Claim',
      body: 'Aristotle began his Metaphysics with a famous line: "All men by nature desire to know." He did not just mean knowledge that helps us survive. He meant we want to understand things for their own sake, simply because we are curious. For Aristotle, that drive is part of being human.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'The Evidence Aristotle Offered',
      scenario: 'As evidence, Aristotle pointed to how much we enjoy our senses. We like seeing, hearing, and smelling things even when there is no practical use. We watch a sunset or listen to music we do not need. He thought this simple pleasure in taking in the world is where philosophy begins.',
      source: 'Aristotle, Metaphysics, Book I (~350 BCE)',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Curiosity as a Virtue',
      body: 'For the ancient Greeks, curiosity was not a distraction but a good trait, a sign of a strong mind. They used the word thaumazein, meaning wonder, to describe where philosophy starts. To be curious is to pay attention to the world. To stop asking questions is to stop thinking.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Knowledge as Power and as Wonder',
      body: 'Francis Bacon said "knowledge is power." If you understand how the world works, you can change it. But since Aristotle, many thinkers have also valued knowledge for its own sake: the wonder and satisfaction of understanding. The best knowledge often does both, giving us power and a sense of awe.',
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
        explanation: 'For Aristotle, the desire to know is part of human nature. It is not driven by outside pressure or usefulness, but by a built-in love of understanding and wonder at the world.',
      },
    },
    {
      type: 'question',
      prompt: 'The Greek word "thaumazein" names wonder as the starting point of philosophy.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Thaumazein means wonder or amazement. For Aristotle and Plato, it is where philosophy begins. The moment we meet something puzzling and ask "why?", philosophical thinking starts.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have seen why humans seek knowledge.',
      body: 'The fact that you are here, choosing to study philosophy when nothing forced you to, is Aristotle\'s point in action. You are doing exactly what he described: wanting to understand simply for its own sake. That curiosity is one of the clearest signs of being human.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'The Human Drive to Know',
      keyPoints: [
        'Aristotle: wanting to understand is part of our nature',
        'Wonder (thaumazein) is where philosophy begins',
        'Curiosity is a virtue, not just a distraction',
        'Knowledge can be both power and pure wonder',
      ],
      closingThought: 'Every question you ask proves Aristotle\'s point: curiosity is not just what you do, it is part of who you are.',
    },
  ],
};

export default lesson;
