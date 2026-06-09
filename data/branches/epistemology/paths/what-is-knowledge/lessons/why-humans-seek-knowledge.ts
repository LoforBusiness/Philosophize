import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-5',
  slug: 'why-humans-seek-knowledge',
  title: 'Why Are Humans Driven to Know Things?',
  description: 'Aristotle on wonder, Bacon on power, and our hunger to understand.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Aristotle: "All men by nature desire to know."',
      subtext: 'The first line of his Metaphysics, 2,400 years old, still humming.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Line',
      body: 'The highest knowledge, Aristotle says, isn\'t the useful kind — it\'s wisdom, sought for its own sake. He calls it the only "free" science, because it serves nothing but understanding itself.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Evidence',
      scenario: 'His proof? The delight we take in our senses, above all sight. We love seeing "even apart from its usefulness," because it reveals so much. That bare joy in grasping the world is where wisdom begins.',
      source: 'Aristotle, Metaphysics, Book I, 980a (c. 350 BCE)',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Wonder Lights the Fuse',
      body: 'Both Plato and Aristotle root philosophy in thaumazein — wonder. "It is owing to their wonder that men begin to philosophize." But wonder is also being puzzled, thrown off balance by what you can\'t yet explain.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Knowledge as Power',
      body: 'Centuries later, Francis Bacon shifts the goal: knowledge should give command over nature. Where Aristotle prized knowledge for contemplation, Bacon prized it as an instrument. Two motives, one drive.',
      visual: '⚡',
      highlight: 'knowledge as power',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-5-1',
      quote: 'Knowledge itself is power.',
      author: 'Francis Bacon',
      era: '1597',
      work: 'Meditationes Sacrae',
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
        explanation: 'Aristotle grounds the desire to know in human nature itself — the highest wisdom is wanted for its own sake.',
      },
    },
    {
      type: 'question',
      prompt: 'Who said "knowledge is power," tying knowing to command over nature?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Aristotle, in the opening of the Metaphysics', isCorrect: false },
          { id: 'b', text: 'Plato, in the Theaetetus dialogue on wonder', isCorrect: false },
          { id: 'c', text: 'Francis Bacon, who recast knowledge as an instrument', isCorrect: true },
          { id: 'd', text: 'Socrates, who claimed to know nothing at all', isCorrect: false },
        ],
        explanation: 'Bacon wrote "knowledge itself is power" (1597). Aristotle prized knowledge for its own sake, not for command over nature.',
      },
    },
    {
      type: 'summary',
      title: 'The Human Drive to Know',
      keyPoints: [
        'Aristotle: the desire to know is in our nature',
        'Wisdom, sought for itself, is the "free" science',
        'Wonder (thaumazein) is where philosophy begins',
        'Bacon redirects knowledge toward power',
      ],
      closingThought: 'Every "why?" you ask proves Aristotle right: curiosity isn\'t just what you do — it\'s who you are.',
    },
  ],
};

export default lesson;
