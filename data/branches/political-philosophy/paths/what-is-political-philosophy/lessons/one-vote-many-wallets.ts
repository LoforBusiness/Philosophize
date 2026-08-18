import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-37',
  slug: 'one-vote-many-wallets',
  title: 'One Vote, Many Wallets',
  description: 'Everyone gets one ballot. Not everyone gets one voice.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two citizens. Equal votes. Wildly unequal influence.',
      subtext: 'Which one did the system promise?',
      emoji: '🗳️',
    },
    {
      type: 'concept',
      title: 'Fair Value',
      body: 'Rawls distinguished having a liberty from being able to use it. Everyone may run for office; not everyone can afford to. He argued political liberties are special: their worth must be roughly equal, not merely their formal possession.',
      visual: '⚖️',
      highlight: 'having it versus being able to use it',
    },
    {
      type: 'example',
      title: 'The Free Speech Objection',
      scenario: 'Spending money to spread a message is a way of speaking. Cap it and you limit political speech, which is exactly what a free society is supposed to protect most fiercely. Both sides here are defending liberty, which is why it does not resolve.',
      source: 'Rawls, "Political Liberalism" (1993)',
    },
    {
      type: 'quote',
      id: 'lq-political-political-37',
      quote: 'The liberties protected by the principle of participation lose much of their value whenever those with greater means control the course of public debate.',
      author: 'John Rawls',
      era: '1971',
    },
    {
      type: 'question',
      prompt: 'What is Rawls\'s "fair value" claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Political liberties must be worth roughly the same to everyone, not merely held equally', isCorrect: true },
          { id: 'b', text: 'That everyone should have the same amount of money', isCorrect: false },
          { id: 'c', text: 'That political speech deserves less protection than other speech', isCorrect: false },
          { id: 'd', text: 'That voting should be compulsory', isCorrect: false },
        ],
        explanation: 'He is not levelling incomes generally — he allows inequality elsewhere. The claim is narrow and sharp: for POLITICAL liberties specifically, formal possession is not enough if their usable worth varies wildly.',
      },
    },
    {
      type: 'question',
      prompt: 'Why is the disagreement here so hard to settle?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Both sides are protecting a liberty, and the liberties conflict', isCorrect: true },
          { id: 'b', text: 'Because nobody has measured the effect of political spending', isCorrect: false },
          { id: 'c', text: 'Because one side is arguing in bad faith', isCorrect: false },
          { id: 'd', text: 'Because it is a question for courts, not philosophers', isCorrect: false },
        ],
        explanation: 'This is not liberty against equality. Spending to be heard is a form of speech, and equal political worth is a form of liberty too, so the fight is between two things a free society is committed to.',
      },
    },
    {
      type: 'summary',
      title: 'The Worth of a Right',
      keyPoints: [
        'Having a liberty differs from being able to use it',
        'Rawls: political liberties need fair value, not just equal form',
        'Limiting spending limits a kind of speech',
        'So the conflict is liberty against liberty',
      ],
      closingThought: 'Every democracy answers this somewhere, usually without saying so. Where it draws the line tells you what it thinks a vote is for.',
    },
  ],
};

export default lesson;
