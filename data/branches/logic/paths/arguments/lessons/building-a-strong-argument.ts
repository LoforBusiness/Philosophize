import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-30',
  slug: 'building-a-strong-argument',
  title: 'Build It and Stress-Test It',
  description: 'Capstone: assemble a real argument from premises to conclusion, then attack it like an opponent would.',
  estimatedMinutes: 7,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You\'ve learned to take arguments apart. Now build one.',
      subtext: 'A strong argument is constructed on purpose — and then stress-tested before anyone else can.',
      emoji: '🏗️',
    },
    {
      type: 'concept',
      title: 'The Build',
      body: 'Start from the conclusion you want to defend. Find premises that, if true, would force it. Make every hidden assumption explicit. Check the form is valid, then check each premise is actually true. Validity plus true premises equals a sound argument.',
      visual: '🧱',
      highlight: 'valid form, true premises',
    },
    {
      type: 'concept',
      title: 'The Stress Test',
      body: 'Now turn on your own work. Where is the weakest premise? Is there a counterexample, a hidden premise, an equivocation? Steelman the objection a critic would raise. An argument you\'ve attacked yourself is far harder for anyone else to topple.',
      visual: '🔨',
      highlight: 'attack your own work',
    },
    {
      type: 'example',
      title: 'Assembling One',
      scenario: 'Conclusion: "This new tax will hurt small shops." Premise 1: the tax raises costs for every business. Premise 2: small shops have the thinnest margins. Hidden premise made explicit: small shops can\'t easily pass costs to customers. Now stress-test premise 2 — is it actually true of all small shops, or a hasty generalization?',
      emoji: '🏪',
    },
    {
      type: 'question',
      prompt: 'Order the steps to build and defend a strong argument, start to finish.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'b1', text: 'State the conclusion you want to defend' },
          { id: 'b2', text: 'Find premises that would force it' },
          { id: 'b3', text: 'Make hidden assumptions explicit' },
          { id: 'b4', text: 'Check the form is valid' },
          { id: 'b5', text: 'Stress-test the weakest premise' },
        ],
        correctOrder: ['b1', 'b2', 'b3', 'b4', 'b5'],
        explanation: 'Build from the conclusion back to premises, surface what\'s hidden, confirm the form holds, then attack your own weak point. Construct first, then stress-test — that order is what makes an argument hard to knock down.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'This is everything you\'ve learned, in one move.',
      body: 'Premises and conclusions, validity and soundness, hidden premises, the fallacies, charity, the burden of proof. Building a strong argument is just running all of it forwards instead of backwards — creating what you\'ve spent a whole path learning to dismantle.',
      emoji: '🎓',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-30-1',
      quote: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
      author: 'Bertrand Russell',
      era: '1933',
      work: 'Mortals and Others',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'summary',
      title: 'Build It and Stress-Test It',
      keyPoints: [
        'Build backward: from conclusion to forcing premises',
        'Make every hidden assumption explicit',
        'Confirm valid form, then true premises',
        'Attack your own weakest premise first',
      ],
      closingThought: 'You can now both build arguments and break them. That is what it means to think for yourself. Path complete.',
    },
  ],
};

export default lesson;
