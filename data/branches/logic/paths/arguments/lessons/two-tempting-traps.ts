import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-8',
  slug: 'two-tempting-traps',
  title: 'Two Traps That Look Valid',
  description: 'Affirming the consequent and denying the antecedent fool almost everyone.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two moves feel airtight — and both are broken.',
      subtext: 'They mimic the valid forms, then quietly lead you off a cliff.',
      emoji: '🪤',
    },
    {
      type: 'concept',
      title: 'Affirming the Consequent',
      body: 'If P, then Q. Q is true — so P? No. "If it rains, streets are wet. Streets are wet, so it rained." A burst pipe could soak them too. Invalid.',
      visual: '🚫',
      highlight: 'Q, so P? No',
    },
    {
      type: 'concept',
      title: 'Denying the Antecedent',
      body: 'If P, then Q. P is false — so not Q? No. "If it rains, streets are wet. No rain, so dry." But a passing truck spilled water. The link runs one way only.',
      visual: '⛔',
      highlight: 'not P, so not Q? No',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-8',
      quote: 'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      author: 'Arthur Conan Doyle',
      era: '1890',
      work: 'The Sign of Four',
    },
    {
      type: 'question',
      prompt: '"If P then Q. P is false." Can you safely conclude Q is false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'That is denying the antecedent. Q might still be true for some other reason — the conditional only blocked the other direction.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A true conclusion does not prove the reasoning works.',
      body: 'These traps often land on a believable conclusion, which makes them feel valid. Always check the form, not whether the ending sounds right.',
      emoji: '🔍',
    },
    {
      type: 'question',
      prompt: '"If she trained, she\'s fit. She IS fit — so she trained." Sound reasoning?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — affirming the consequent; fitness has other causes', isCorrect: true },
          { id: 'b', text: 'Yes — being fit proves she trained', isCorrect: false },
          { id: 'c', text: 'Yes — that\'s just modus ponens', isCorrect: false },
          { id: 'd', text: 'Yes — the conclusion is plausible, so it holds', isCorrect: false },
        ],
        explanation: 'Affirming Q does not give you P; good genes or another sport could explain her fitness. The form is invalid even if she did train.',
      },
    },
    {
      type: 'summary',
      title: 'Two Traps Disarmed',
      keyPoints: [
        'Affirming the consequent: Q, so P — invalid',
        'Denying the antecedent: not-P, so not-Q — invalid',
        'They mimic the valid forms backward',
        'A believable conclusion never proves the form',
      ],
      closingThought: 'Spot the trap and the smartest-sounding mistakes stop fooling you.',
    },
  ],
};

export default lesson;
