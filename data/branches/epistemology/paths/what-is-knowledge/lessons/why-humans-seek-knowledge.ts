import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-5',
  slug: 'why-humans-seek-knowledge',
  title: 'Why Are Humans Driven to Know Things?',
  description: 'Aristotle and Plato on wonder and the hunger to understand — and how Bacon turns knowledge into power.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Aristotle wrote: "All men by nature desire to know."',
      subtext: 'The first line of his Metaphysics, 2,400 years old, still humming.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Aristotle\'s Opening Line',
      body: 'Aristotle opens the Metaphysics with a claim: "All men by nature desire to know." The highest knowledge, he says, isn\'t the useful kind — it\'s wisdom, sought for its own sake. He calls it the only "free" science, because it serves nothing but understanding itself.',
      visual: '📖',
      highlight: 'desire to know',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Evidence',
      scenario: 'His proof? The delight we take in our senses — above all, sight. We love seeing, he writes, "even apart from its usefulness," because sight reveals so much and marks out differences between things. We crave perception when nothing useful follows. That bare joy in grasping the world, he argues, is where the love of wisdom begins.',
      source: 'Aristotle, Metaphysics, Book I (Alpha), 980a (c. 350 BCE)',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Wonder Lights the Fuse',
      body: 'Both thinkers root philosophy in thaumazein — wonder. Aristotle: "It is owing to their wonder that men begin to philosophize." Plato\'s Socrates tells young Theaetetus that wonder "is the only beginning of philosophy." But wonder isn\'t just delight — it\'s also being puzzled, thrown off balance by what you can\'t yet explain.',
      visual: '🌟',
      highlight: 'thaumazein',
    },
    {
      type: 'concept',
      title: 'Knowledge as Power',
      body: 'Centuries later, Francis Bacon shifts the goal: knowledge should give us command over nature. "Human knowledge and human power meet in one," he writes — to obey nature is to master it. Where Aristotle prized knowledge for contemplation, Bacon prized it as an instrument. Two motives, one human drive.',
      visual: '⚡',
      highlight: 'knowledge and power meet',
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
        explanation: 'Aristotle opens the Metaphysics by grounding the desire to know in human nature itself. The highest wisdom, he says, is wanted for its own sake — not for usefulness or outside pressure, but out of sheer delight in understanding.',
      },
    },
    {
      type: 'question',
      prompt: 'The Greek word "thaumazein" names wonder as the starting point of philosophy.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Thaumazein means wonder or astonishment. Aristotle (Metaphysics 982b) and Plato (Theaetetus 155d) both say philosophy begins here. And it cuts both ways: wonder is also perplexity — the unsettling jolt of not yet understanding that drives inquiry forward.',
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
        'Aristotle: the desire to know is built into our nature',
        'Wisdom, sought for its own sake, is the "free" science',
        'Wonder (thaumazein) is where philosophy begins',
        'Bacon redirects knowledge toward power over nature',
      ],
      closingThought: 'Every "why?" you ask proves Aristotle right: curiosity isn\'t just what you do — it\'s who you are.',
    },
  ],
};

export default lesson;
