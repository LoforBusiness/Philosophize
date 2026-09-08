import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-38',
  slug: 'who-speaks-for-you',
  title: 'Who Speaks for You?',
  description: 'You elected somebody. A vote comes up that nobody mentioned in the campaign. Are they your messenger, or your judgement in the room?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A vote comes up that nobody campaigned on.',
      subtext: 'Should they guess what you want, or decide?',
      emoji: '🗳️',
    },
    {
      type: 'concept',
      title: 'Delegate or Trustee',
      body: 'A delegate carries instructions and votes them, whatever they privately think. A trustee is sent to listen, argue and then decide. Both are real theories of what an election hands over, and they give opposite answers on the same day.',
      visual: '🧵',
      highlight: 'what an election hands over',
    },
    {
      type: 'example',
      title: 'Burke at Bristol',
      scenario: 'In 1774 Edmund Burke told the voters of Bristol, to their faces and on the day they elected him, that he would not take their instructions. Parliament was not a congress of hostile envoys, he said, but one assembly deliberating for the whole. They returned him once, and then they threw him out.',
      source: 'Speech to the Electors of Bristol, 1774',
    },
    {
      type: 'quote',
      id: 'lq-political-political-38',
      quote: 'Your representative owes you, not his industry only, but his judgment; and he betrays you if he sacrifices it to your opinion.',
      author: 'Edmund Burke',
      era: '1774',
      philosopherId: 'edmund-burke',
    },
    {
      type: 'question',
      prompt: 'What does a trustee owe you that a messenger does not?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Their own judgement, after hearing the arguments', isCorrect: true },
          { id: 'b', text: 'Obedience to whatever you last told them', isCorrect: false },
          { id: 'c', text: 'Loyalty to the party that selected them', isCorrect: false },
          { id: 'd', text: 'A promise never to change their mind', isCorrect: false },
        ],
        explanation: 'Judgement is the thing a messenger cannot supply. Obedience is exactly what the delegate model asks for, so it cannot be the difference. And a party line is a third master, owed to neither you nor the argument.',
      },
    },
    {
      type: 'question',
      prompt: 'What is the strongest case for the delegate model?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is the only version you can hold them to', isCorrect: true },
          { id: 'b', text: 'Voters always know more than politicians', isCorrect: false },
          { id: 'c', text: 'Judgement is worthless in politics', isCorrect: false },
          { id: 'd', text: 'It makes government faster', isCorrect: false },
        ],
        explanation: 'Accountability is the real prize. Instructions can be checked against a record; judgement cannot be, because any vote at all can be described as the judgement they were sent to use. That is the price Burke asks you to pay, and he was honest about it.',
      },
    },
    {
      type: 'summary',
      title: 'The Slack in the Cord',
      keyPoints: [
        'A delegate carries instructions; a trustee carries judgement',
        'Elections do not say which one you handed over',
        'Judgement is what a messenger cannot supply',
        'Instructions are what you can hold somebody to',
      ],
      closingThought: 'Every argument about a broken manifesto promise is this argument, wearing different clothes. Decide which model you meant before you decide who betrayed you.',
    },
  ],
};

export default lesson;
