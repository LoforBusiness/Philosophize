import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-35',
  slug: 'the-empty-chairs',
  title: 'The Empty Chairs',
  description: 'Everyone affected should have a say. Most of them are not born.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every vote is cast by the people who happen to be alive.',
      subtext: 'They are outnumbered by everyone who comes next.',
      emoji: '🪑',
    },
    {
      type: 'concept',
      title: 'The Missing Constituency',
      body: 'Democracy hands power to those affected by a decision. Storing waste for ten thousand years, or warming a planet, affects people who cannot vote because they do not exist yet. They will exist. And there are far more of them than of us.',
      visual: '🗳️',
      highlight: 'they will exist',
    },
    {
      type: 'example',
      title: 'The Non-Identity Problem',
      scenario: 'Choose a reckless policy and different people get born — different jobs, different meetings, different children. So nobody in the worse future can say they were made worse off. They would not have existed at all under the careful policy.',
      source: 'Parfit, "Reasons and Persons" (1984)',
    },
    {
      type: 'quote',
      id: 'lq-political-political-35',
      quote: 'We are the trustees of the earth, not its owners.',
      author: 'Edmund Burke',
      era: '1790',
    },
    {
      type: 'question',
      prompt: 'What makes the non-identity problem awkward?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nobody in the worse future is worse off than they would have been', isCorrect: true },
          { id: 'b', text: 'Future people might not share our values', isCorrect: false },
          { id: 'c', text: 'We cannot predict the future accurately enough to plan', isCorrect: false },
          { id: 'd', text: 'Future people cannot enforce any claim against us', isCorrect: false },
        ],
        explanation: 'Harm is usually measured against how someone would otherwise have been. Change the policy and you change who gets born, so the comparison has nobody to attach to — and the wrong is obvious anyway.',
      },
    },
    {
      type: 'question',
      prompt: 'Which reply keeps the wrong without needing a victim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Judge outcomes, not just persons: a worse world is worse even if nobody was wronged', isCorrect: true },
          { id: 'b', text: 'Give future people votes now through appointed representatives', isCorrect: false },
          { id: 'c', text: 'Assume future people will be richer and can cope', isCorrect: false },
          { id: 'd', text: 'Treat the problem as a puzzle with no practical importance', isCorrect: false },
        ],
        explanation: 'Representation is a good institutional fix and does not answer the argument. The philosophical reply drops the demand for an identified victim: some choices make the world go worse, and that is a reason not to make them.',
      },
    },
    {
      type: 'summary',
      title: 'Who Is in the Room',
      keyPoints: [
        'Those affected by a decision mostly do not exist yet',
        'Change the policy and you change who is born',
        'So no future person is made worse off',
        'Judging outcomes rescues the wrong without a victim',
      ],
      closingThought: 'Every generation inherits a world it had no vote in. The only question is what kind of ancestor that makes you.',
    },
  ],
};

export default lesson;
