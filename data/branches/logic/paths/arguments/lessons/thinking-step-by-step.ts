import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-5',
  slug: 'thinking-step-by-step',
  title: 'Thinking Step by Step',
  description: 'How a deductive proof links premises to a conclusion one inference at a time — and why every link must hold.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A proof is a chain. One weak link and it falls.',
      subtext: 'Logicians call this deduction: premises that march, step by step, to a conclusion.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Premises, Then Conclusion',
      body: 'An argument moves from premises (claims you grant) to a conclusion (what they force). Each move is an inference. In a valid deduction the conclusion, as Aristotle put it, "follows of necessity": if the premises are true, it cannot be false. Skip a link and the chain snaps.',
      visual: '📐',
      highlight: 'the conclusion must follow',
    },
    {
      type: 'example',
      title: 'Euclid Builds a Triangle',
      scenario: 'To build an equilateral triangle on a line AB, Euclid draws a circle around A through B, and another around B through A. They cross at C. AB equals AC (same circle); AB equals BC (same circle). So AC equals BC — things equal to the same thing are equal to each other. Triangle proved, link by link.',
      source: 'Euclid, Elements, Book I, Proposition 1 (c. 300 BCE)',
      emoji: '📐',
    },
    {
      type: 'question',
      prompt: 'True or false: leaving out steps makes a deductive argument stronger.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Every missing step is a gap where a faulty inference can hide. A good deduction, like Euclid\'s, exposes each link, so anyone can check that the conclusion truly follows.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity lives in the form, not the vibe.',
      body: 'A valid argument is one whose form guarantees the conclusion when the premises hold. Descartes\' advice in the Discourse on the Method: split a hard problem into its smallest parts and work from the simplest upward. Spell out each inference, and you can see exactly where the chain might break.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Arguments run from premises to conclusion by inference',
        'In a valid deduction, the conclusion follows of necessity',
        'Euclid proved his theorems one explicit link at a time',
        'Skipping steps hides where the chain breaks',
      ],
      closingThought: 'Face a huge problem? Do as Descartes urged: divide it into parts and climb from the simplest step up.',
    },
  ],
};

export default lesson;
