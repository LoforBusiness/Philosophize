import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-5',
  slug: 'why-humans-seek-knowledge',
  title: 'Why Are Humans Driven to Know Things?',
  description: 'Aristotle, Plato, and Bacon on the hunger to understand — and where philosophy is born.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Aristotle wrote: "All men by nature desire to know."',
      subtext: 'One sentence, 2,400 years old, still humming with truth.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Shot',
      body: 'Aristotle launches his Metaphysics with a bold claim: "All men by nature desire to know." Not knowledge that pays. Not knowledge that protects. He means understanding hunted for its own sake — sheer curiosity. For Aristotle, that itch isn\'t a hobby. It\'s the signature of being human.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Proof',
      scenario: 'His evidence? Look at how we love seeing. Aristotle notes we prize sight above the other senses — not just for its uses, but because it reveals so much, drawing distinctions, lighting up the world. We crave perception even when nothing useful follows. That naked delight in grasping things, he argues, is where the love of wisdom ignites.',
      source: 'Aristotle, Metaphysics, Book I (~350 BCE)',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Wonder Lights the Fuse',
      body: 'Both Plato and Aristotle agree philosophy is born from one spark: thaumazein — wonder, astonishment, the jolt of the strange. Plato says in the Theaetetus that wonder is the philosopher\'s very root. Hit something puzzling, ask "why?", and you\'ve crossed the line into philosophy. Stop wondering, and thinking quietly dies.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Power and Wonder',
      body: 'Centuries later, Francis Bacon fired back a rival motto: "knowledge is power." Grasp how the world works, and you can bend it. Yet the Aristotelian thread never snapped — knowledge prized purely for the awe of understanding. The richest ideas do both at once: they hand us leverage and leave us amazed.',
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
          { id: 'a', text: 'The pull to understand is woven into human nature', isCorrect: true },
          { id: 'b', text: 'Only to seize power and advantage over rivals', isCorrect: false },
          { id: 'c', text: 'Because society pressures us to keep learning', isCorrect: false },
          { id: 'd', text: 'To hold the terror of death at arm\'s length', isCorrect: false },
        ],
        explanation: 'For Aristotle, the desire to know is built into human nature itself — not forced by usefulness or outside pressure, but driven by a love of understanding and wonder at the world.',
      },
    },
    {
      type: 'question',
      prompt: 'The Greek word "thaumazein" names wonder as the starting point of philosophy.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Thaumazein means wonder or astonishment. For Plato (in the Theaetetus) and Aristotle, it is where philosophy begins. Meet something baffling, ask "why?", and the philosophical engine fires up.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You just lived Aristotle\'s claim.',
      body: 'Nobody forced you here. You opened a philosophy lesson because a question tugged at you — understanding wanted for its own sake. That\'s thaumazein in motion: wonder turning into thought. Aristotle would say you\'re not just doing philosophy. You\'re being human.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'The Human Drive to Know',
      keyPoints: [
        'Aristotle: the pull to understand is our nature',
        'Wonder (thaumazein) is where philosophy ignites',
        'Plato\'s Theaetetus roots philosophy in astonishment',
        'Knowledge is both power (Bacon) and pure awe',
      ],
      closingThought: 'Every "why?" you ask proves Aristotle right: curiosity isn\'t just what you do — it\'s who you are.',
    },
  ],
};

export default lesson;
