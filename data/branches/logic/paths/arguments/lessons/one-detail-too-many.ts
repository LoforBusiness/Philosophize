import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-41',
  slug: 'one-detail-too-many',
  title: 'One Detail Too Many',
  description: 'Add a detail to a description and it starts to feel more likely. Arithmetic says it just became less likely.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A longer story cannot be a likelier one.',
      subtext: 'Nearly everybody bets that it can.',
      emoji: '📦',
    },
    {
      type: 'concept',
      title: 'A Box Inside a Box',
      body: 'Everyone who is a teller and an activist is already a teller. So that group sits inside the bigger one and can never outgrow it. Two claims together are at most as likely as either claim on its own, and usually a good deal less.',
      visual: '🔲',
      highlight: 'can never outgrow it',
    },
    {
      type: 'example',
      title: 'Linda',
      scenario: 'Linda is thirty-one, outspoken, and studied philosophy. Asked whether she is more likely to be a bank teller, or a bank teller who is active in the feminist movement, most people choose the second. It fits her. It also cannot be the answer.',
      source: 'Tversky and Kahneman, 1983',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-41',
      quote: 'A conjunction cannot be more probable than one of its constituents.',
      author: 'Amos Tversky and Daniel Kahneman',
      era: '1983',
    },
    {
      type: 'question',
      prompt: 'What makes the longer description feel likelier?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It matches the picture you were given of her', isCorrect: true },
          { id: 'b', text: 'It is more precise, so it is more informative', isCorrect: false },
          { id: 'c', text: 'It makes two claims instead of one', isCorrect: false },
          { id: 'd', text: 'Activists are more memorable than tellers', isCorrect: false },
        ],
        explanation: 'Resemblance. You are asked about probability and you answer about fit, because fit is the question your mind finds easier. Precision is real and beside the point — a precise claim is a narrower one, which makes it less likely, not more.',
      },
    },
    {
      type: 'question',
      prompt: 'How large can the group of activist tellers be?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A slice of the tellers, and never more', isCorrect: true },
          { id: 'b', text: 'Most of the tellers, given the description', isCorrect: false },
          { id: 'c', text: 'All of the tellers, if the story fits well', isCorrect: false },
          { id: 'd', text: 'Larger than the tellers, since it says more', isCorrect: false },
        ],
        explanation: 'A slice. The inner box can touch the outer one at most, when every teller is an activist, and it can never break out of it. Nothing you learn about Linda changes that, because the description was never about how many tellers there are.',
      },
    },
    {
      type: 'summary',
      title: 'Inside the Box',
      keyPoints: [
        'A conjunction is a subset of each of its parts',
        'So it can never be the likelier of the two',
        'Detail buys resemblance and costs probability',
        'A vivid story is the strongest form of this trap',
      ],
      closingThought: 'This is why a forecast with names, dates and a motive convinces where a bare one does not. Every detail added is another way for it to be wrong.',
    },
  ],
};

export default lesson;
