import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-4',
  slug: 'strong-vs-weak-arguments',
  title: 'Strong Arguments vs Weak Arguments',
  description: 'How logicians grade arguments: validity tests the form, soundness adds true premises.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Logic has two grades. Most arguments flunk one.',
      subtext: 'Validity tests the shape. Soundness demands true premises too. Learn the difference.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Validity vs Soundness',
      body: 'An argument is VALID when its form guarantees the conclusion: if the premises were true, the conclusion would have to follow. It is SOUND when it is valid AND the premises really are true. Validity grades the logic; soundness adds the facts.',
      visual: '🏗️',
      highlight: 'VALID',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Syllogism',
      scenario: 'Aristotle\'s classic: "All men are mortal; Socrates is a man; therefore Socrates is mortal." Valid AND sound — the form holds and every premise is true.\n\nNow swap a premise: "All birds can fly; a penguin is a bird; so a penguin flies." Still valid in form, but unsound — premise one is false.',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'An argument is valid but one premise is false. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Valid but unsound — good form, false premise', isCorrect: true },
          { id: 'b', text: 'Sound, since the logic is correct', isCorrect: false },
          { id: 'c', text: 'Invalid, because a premise is wrong', isCorrect: false },
          { id: 'd', text: 'Neither valid nor invalid', isCorrect: false },
        ],
        explanation: 'Validity is about form alone, so the argument stays valid. But soundness requires every premise be true — one false premise makes it valid yet unsound.',
      },
    },
    {
      type: 'summary',
      title: 'Validity & Soundness Unlocked',
      keyPoints: [
        'Validity: true premises would force the conclusion',
        'Soundness: valid plus actually-true premises',
        'A valid argument can still be unsound',
        'Aristotle\'s syllogism is the classic model',
      ],
      closingThought: 'Test the form first, then test the facts — that\'s logic.',
    },
  ],
};

export default lesson;
