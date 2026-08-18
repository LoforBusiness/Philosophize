import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-37',
  slug: 'the-shipowners-belief',
  title: 'The Shipowner\'s Belief',
  description: 'He talked himself into it, and the ship sank. Would he be innocent if it had not?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'He silenced his doubts and watched her sail.',
      subtext: 'She went down with everyone aboard.',
      emoji: '⚓',
    },
    {
      type: 'concept',
      title: 'The Ethics of Belief',
      body: 'Clifford argued that believing is something you do, and doing it badly can wrong people. His shipowner did not lie. He worked on himself until the doubts were gone, and sent the emigrants out sincerely convinced.',
      visual: '⚖️',
      highlight: 'believing is something you do',
    },
    {
      type: 'example',
      title: 'The Twist That Matters',
      scenario: 'Suppose the ship arrives safely. Clifford says the owner is just as guilty: he had no right to that belief on that evidence, and being lucky changes nothing about how he got there.',
      source: 'Clifford, "The Ethics of Belief" (1877)',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-37',
      quote: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'W.K. Clifford',
      era: '1877',
    },
    {
      type: 'question',
      prompt: 'What exactly is the shipowner blamed for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'How he arrived at the belief, not the outcome it led to', isCorrect: true },
          { id: 'b', text: 'Lying to the passengers about the ship\'s condition', isCorrect: false },
          { id: 'c', text: 'Failing to buy insurance for the voyage', isCorrect: false },
          { id: 'd', text: 'Being mistaken about a matter of fact', isCorrect: false },
        ],
        explanation: 'He never lied — he genuinely believed it. And plenty of honest mistakes carry no blame. What is condemned is the process: he stifled the doubt instead of checking, and the sincerity is the damning part.',
      },
    },
    {
      type: 'question',
      prompt: 'What is the strongest objection to Clifford\'s rule?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Some beliefs cannot be tested without first being held', isCorrect: true },
          { id: 'b', text: 'Nobody can control what they believe', isCorrect: false },
          { id: 'c', text: 'Evidence is always incomplete, so nothing would be believable', isCorrect: false },
          { id: 'd', text: 'It only applies when other people are at risk', isCorrect: false },
        ],
        explanation: 'James pressed exactly this. Trusting a stranger, committing to a project, believing a friendship will hold — waiting for sufficient evidence guarantees you never get it, because the evidence only arrives after you commit.',
      },
    },
    {
      type: 'summary',
      title: 'What You Owe Before You Believe',
      keyPoints: [
        'Belief can be a wrong, not only a mistake',
        'The blame is in the process, not the outcome',
        'A lucky result does not clear you',
        'Some beliefs must be held before they can be tested',
      ],
      closingThought: 'The shipowner is easy to condemn from a distance. He did what everyone does when checking would be expensive and the answer is one they cannot afford.',
    },
  ],
};

export default lesson;
