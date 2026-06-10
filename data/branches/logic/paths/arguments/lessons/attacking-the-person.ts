import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-9',
  slug: 'attacking-the-person',
  title: 'Fallacies of Distraction',
  description: 'Ad hominem and the straw man dodge the argument instead of answering it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The easiest way to "win" is to change the subject.',
      subtext: 'Informal fallacies dodge the point while looking like a reply.',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'Ad Hominem',
      body: 'Attacking the arguer instead of the argument. "You\'re no scientist, so your claim is wrong." But a true claim stays true no matter who says it. The insult answers nothing.',
      visual: '👤',
      highlight: 'attack the arguer',
    },
    {
      type: 'concept',
      title: 'The Straw Man',
      body: 'Swapping someone\'s real position for a weaker fake, then knocking that down. You feel victorious — but you only beat a scarecrow you built yourself, not their actual view.',
      visual: '🌾',
      highlight: 'a weaker fake',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-9',
      quote: 'Sophistry is an appearance of wisdom without the reality.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Sophistical Refutations',
    },
    {
      type: 'question',
      prompt: '"Don\'t trust his budget plan — he failed math in school." Which fallacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Ad hominem — it attacks him, not the plan', isCorrect: true },
          { id: 'b', text: 'Straw man — it distorts his plan', isCorrect: false },
          { id: 'c', text: 'No fallacy — past grades are relevant', isCorrect: false },
          { id: 'd', text: 'Affirming the consequent', isCorrect: false },
        ],
        explanation: 'It smears the person rather than examining the plan\'s numbers — a textbook ad hominem.',
      },
    },
    {
      type: 'question',
      prompt: 'Since an argument commits a fallacy, its conclusion must therefore be false. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — a bad argument can still reach a true conclusion', isCorrect: true },
          { id: 'b', text: 'Yes — a fallacy makes the conclusion false', isCorrect: false },
          { id: 'c', text: 'Yes — fallacies poison everything they touch', isCorrect: false },
          { id: 'd', text: 'Only if it is an ad hominem', isCorrect: false },
        ],
        explanation: 'A fallacy shows the reasoning fails to support the conclusion, not that the conclusion is false — assuming it is, is itself the "fallacy fallacy."',
      },
    },
    {
      type: 'summary',
      title: 'Fallacies of Distraction Spotted',
      keyPoints: [
        'Ad hominem attacks the person, not the claim',
        'Straw man beats a fake, weaker position',
        'Both dodge the actual argument',
        'A fallacy doesn\'t make the conclusion false',
      ],
      closingThought: 'Name the dodge out loud and the trick loses its power.',
    },
  ],
};

export default lesson;
