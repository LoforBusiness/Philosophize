import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-41',
  slug: 'when-the-rules-are-suspended',
  title: 'When the Rules Are Suspended',
  description: 'Every constitution has a hole in it for the emergency. Locke put it there deliberately, and knew exactly what it cost.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The law cannot foresee everything.',
      subtext: 'So somebody has to act without it. Who, and how far?',
      emoji: '📕',
    },
    {
      type: 'concept',
      title: 'Prerogative',
      body: 'Locke gave the executive a power to act for the public good without the law, and sometimes against it. He was not being careless. Legislatures are slow, and no rule written in advance covers a fire, a plague or an invasion in the way the moment needs.',
      visual: '⚡',
      highlight: 'without the law, and sometimes against it',
    },
    {
      type: 'example',
      title: 'The Missing Sentence',
      scenario: 'Every part of that power has an owner and a purpose. The executive holds it, and the public good is what it is for. The one thing it does not have is a rule saying how far it goes, because a rule that could say so would have foreseen the case.',
      source: 'Locke, Second Treatise, chapter XIV',
    },
    {
      type: 'quote',
      id: 'lq-political-political-41',
      quote: 'This power to act according to discretion for the public good, without the prescription of the law and sometimes even against it, is that which is called prerogative.',
      author: 'John Locke',
      era: '1689',
      philosopherId: 'john-locke',
    },
    {
      type: 'question',
      prompt: 'What is the one thing prerogative has none of?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A rule that says how far it goes', isCorrect: true },
          { id: 'b', text: 'Somebody who holds it', isCorrect: false },
          { id: 'c', text: 'A purpose it is meant to serve', isCorrect: false },
          { id: 'd', text: 'Any historical precedent', isCorrect: false },
        ],
        explanation: 'A rule. It has a holder — the executive — and a purpose, the public good. What it cannot have is a written limit, because a limit precise enough to be a limit would have to describe the emergency in advance, and then the ordinary law would already cover it.',
      },
    },
    {
      type: 'question',
      prompt: 'How should the room to act outside the law change as a crisis deepens?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It grows step by step with the danger', isCorrect: true },
          { id: 'b', text: 'It stays flat — the law binds regardless', isCorrect: false },
          { id: 'c', text: 'Nothing, and then everything at the worst moment', isCorrect: false },
          { id: 'd', text: 'It is wide open from the start', isCorrect: false },
        ],
        explanation: 'Step by step. Locke ties the power to the need, so it is answerable to how bad things are. The switch answer is the dangerous one: if the exception arrives all at once, whoever declares the emergency has just granted themselves everything, and Locke\'s remedy is that the people judge afterwards.',
      },
    },
    {
      type: 'summary',
      title: 'The Hole in the Book',
      keyPoints: [
        'No law can describe every emergency in advance',
        'Locke gave the executive room to act without one',
        'The power has a holder and a purpose but no limit',
        'Tying it to the need is what keeps it answerable',
      ],
      closingThought: 'The question is never whether a state has this power. It is who decides that the emergency has begun, and who gets to say when it ended.',
    },
  ],
};

export default lesson;
