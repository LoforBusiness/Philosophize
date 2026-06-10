import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-8',
  slug: 'the-puzzle-of-equality',
  title: 'The Puzzle of Equality',
  description: 'Everyone wants equality. But equality of what, exactly?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Equal how? Same rights, same wealth, or same chances?',
      subtext: 'One word, three rival societies. The fight is over the blank.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Equality of What?',
      body: 'We all praise equality, then mean different things. Equal legal rights? Equal opportunity to compete? Equal outcomes in wealth? Each answer builds a sharply different society, and they often collide.',
      visual: '🧩',
      highlight: 'Equality of what',
    },
    {
      type: 'quote',
      id: 'lq-political-political-8-1',
      quote: 'They call for equality in freedom; and if they cannot obtain that, they still call for equality in slavery.',
      author: 'Alexis de Tocqueville',
      era: '1840',
      work: 'Democracy in America',
    },
    {
      type: 'concept',
      title: 'Marx and Material Equality',
      body: 'Marx argued legal equality is hollow if a few own the means of production and the rest must sell their labor. Real equality, he said, needs the material base changed, not just the laws.',
      visual: '🏭',
      highlight: 'means of production',
    },
    {
      type: 'example',
      title: 'The Footrace',
      scenario: 'Picture a race. Equal rights means the same rulebook for all. Equal opportunity means everyone starts on the same line. Equal outcome means everyone finishes together. Notice: chasing one can crowd out the others.',
      emoji: '🏃',
    },
    {
      type: 'question',
      prompt: 'What does "equality of opportunity" mean, as distinct from equality of outcome?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Everyone ends with the same wealth and status', isCorrect: false },
          { id: 'b', text: 'Everyone gets a fair starting chance, though results may differ', isCorrect: true },
          { id: 'c', text: 'Everyone is treated identically in every situation', isCorrect: false },
          { id: 'd', text: 'No one is allowed to compete at all', isCorrect: false },
        ],
        explanation: 'Equality of opportunity levels the starting line; outcomes can still differ. Equality of outcome levels the finish line instead. The two pull in different directions.',
      },
    },
    {
      type: 'question',
      prompt: 'Marx demanded equality, so surely his ideal was paying every worker exactly the same wage. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Marx\'s core demand was identical wages for all', isCorrect: false },
          { id: 'b', text: 'No, he targeted who owns production, not equal paychecks', isCorrect: true },
          { id: 'c', text: 'Yes, Marx measured justice purely by equal pay', isCorrect: false },
          { id: 'd', text: 'No, because Marx opposed equality of any kind', isCorrect: false },
        ],
        explanation: 'The trap: equality sounds like equal wages. But Marx attacked private ownership of the means of production; his slogan was "from each according to ability, to each according to need," not flat pay.',
      },
    },
    {
      type: 'summary',
      title: 'One Word, Many Meanings',
      keyPoints: [
        'Equality of rights, opportunity, or outcome',
        'Tocqueville: democracies burn for equality',
        'Marx: legal equality without material equality is hollow',
        'Pursuing one form can sacrifice another',
      ],
      closingThought: 'Ask not whether someone wants equality, but equality of what.',
    },
  ],
};

export default lesson;
