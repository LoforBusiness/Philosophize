import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-5',
  slug: 'thinking-step-by-step',
  title: 'Thinking Step by Step',
  description: 'A deductive proof links premises to a conclusion, one inference at a time.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A proof is a chain. One weak link, it falls.',
      subtext: 'Deduction: premises that march, step by step, to a conclusion.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Premises, Then Conclusion',
      body: 'An argument moves from premises (claims you grant) to a conclusion (what they force). Each move is an inference. In a valid deduction, if the premises are true the conclusion cannot be false.',
      visual: '📐',
      highlight: 'the conclusion must follow',
    },
    {
      type: 'example',
      title: 'Euclid Builds a Triangle',
      scenario: 'Euclid draws a circle around A through B, another around B through A; they cross at C. AB equals AC, AB equals BC, so AC equals BC. Triangle proved, link by link.',
      source: 'Euclid, Elements, Book I, Proposition 1 (c. 300 BCE)',
      emoji: '📐',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-5',
      quote: 'Divide each of the difficulties under examination into as many parts as possible, as might be necessary for its solution.',
      author: 'René Descartes',
      era: '1637',
      work: 'Discourse on the Method',
    },
    {
      type: 'question',
      prompt: 'True or false: leaving out steps makes a deductive argument stronger.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Every missing step is a gap where a faulty inference can hide. A good deduction exposes each link so anyone can check it.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity lives in the form, not the vibe.',
      body: 'Spell out each inference and you can see exactly where the chain might break. Descartes\' advice: split a hard problem into its smallest parts, then build upward.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'A proof "feels obviously right" but skips three steps. How confident should you be?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Cautious — hidden steps may hide a bad inference', isCorrect: true },
          { id: 'b', text: 'Fully confident — feeling obvious means it\'s valid', isCorrect: false },
          { id: 'c', text: 'Confident — fewer steps means fewer mistakes', isCorrect: false },
          { id: 'd', text: 'Confident — skipping steps shows it\'s elegant', isCorrect: false },
        ],
        explanation: 'Feeling obvious isn\'t a check. Unstated steps are exactly where a hidden flaw can slip past you.',
      },
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Arguments run premises to conclusion by inference',
        'In a valid deduction, the conclusion must follow',
        'Euclid proved theorems one explicit link at a time',
        'Skipping steps hides where the chain breaks',
      ],
      closingThought: 'Face a huge problem? Do as Descartes urged: divide it into parts and climb from the simplest step up.',
    },
  ],
};

export default lesson;
