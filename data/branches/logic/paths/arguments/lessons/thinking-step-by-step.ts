import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-5',
  slug: 'thinking-step-by-step',
  title: 'Thinking Step by Step',
  description: 'How an argument links premises to a conclusion one inference at a time — and why every link must hold.',
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
      body: 'An argument moves from premises (claims you grant) to a conclusion (what they force). Each move is an inference. In a valid deduction, the form alone guarantees that true premises make a true conclusion. Skip a step and the link snaps — the conclusion no longer follows.',
      visual: '📐',
      highlight: 'the conclusion must follow',
    },
    {
      type: 'example',
      title: 'Descartes Hunts for Bedrock',
      scenario: 'In the Meditations, Descartes doubts everything — the senses, the world, even mathematics. Yet one thing resists: he cannot doubt that he is doubting. Doubting is thinking. Thinking needs a thinker. Therefore he must exist — his famous cogito. Tiny inferences, locked in sequence, yielding one unshakable foundation.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '🧠',
    },
    {
      type: 'question',
      prompt: 'True or false: leaving out steps makes a deductive argument stronger.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Every missing step is a gap where a faulty inference can hide. A strong deduction exposes each link, so anyone can test whether the conclusion truly follows.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity lives in the form, not the vibe.',
      body: 'A valid argument is one whose form guarantees the conclusion when the premises hold. Spelling out each inference is how you check that form. Hide a step and you hide where the chain might break — and a single broken link sinks the whole proof.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Arguments run from premises to conclusion by inference',
        'Each inference must make the conclusion follow',
        'Descartes reached "I think, therefore I am" step by step',
        'Skipping steps hides where the chain breaks',
      ],
      closingThought: 'Face a huge problem? Break it into premises and let each inference earn the next.',
    },
  ],
};

export default lesson;
