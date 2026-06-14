import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-15',
  slug: 'civil-disobedience',
  title: 'Breaking the Law to Be Just',
  description: 'When is breaking an unjust law itself a moral act? Thoreau, King, and Rawls answer.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Can breaking the law be the most lawful thing you do?',
      subtext: 'Sometimes the just citizen is the one in the jail cell.',
      emoji: '⛓️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw legitimacy rest on trust, and distributions called unjust.',
      body: 'Lesson 3 asked what gives rulers the right to be obeyed. Lesson 14 asked when an arrangement is unfair. Now the flip side: when a law is unjust, what may a citizen actually do about it?',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Conscientious Lawbreaking',
      body: 'Civil disobedience is a public, nonviolent, conscientious breach of law aimed at changing it, where the protester willingly accepts the legal penalty. That acceptance is the hinge: it is what separates principled disobedience from ordinary crime.',
      visual: '✊',
      highlight: 'accepts the legal penalty',
    },
    {
      type: 'example',
      title: 'Birmingham, 1963',
      scenario: 'Jailed for marching against segregation without a permit, Martin Luther King Jr. answered clergy who called him reckless. Drawing on Thoreau, he argued that disobeying an unjust law openly, and accepting jail for it, expresses the highest respect for law, not contempt for it.',
      source: 'Martin Luther King Jr., Letter from Birmingham Jail (1963)',
      emoji: '📨',
    },
    {
      type: 'quote',
      id: 'lq-political-political-15-1',
      quote: 'One who breaks an unjust law must do it openly, lovingly, and with a willingness to accept the penalty.',
      author: 'Martin Luther King Jr.',
      era: '1963',
      work: 'Letter from Birmingham Jail',
      philosopherId: 'martin-luther-king-jr',
    },
    {
      type: 'concept',
      title: 'Rawls Sets the Bar',
      body: 'Rawls treats civil disobedience as a public act addressed to a majority\'s sense of justice, a last resort in a near-just society. Legal channels must be tried first; the breach must be nonviolent and openly accept punishment, affirming the rule of law it appeals to.',
      visual: '⚖️',
      highlight: 'last resort',
    },
    {
      type: 'question',
      prompt: 'Order the stages of justified civil disobedience as King and Rawls describe it.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 's1', text: 'Identify a clearly unjust law that violates rights' },
          { id: 's2', text: 'Exhaust the available legal and political channels first' },
          { id: 's3', text: 'Breach the law openly and nonviolently in public' },
          { id: 's4', text: 'Willingly accept the penalty to show respect for law itself' },
        ],
        correctOrder: ['s1', 's2', 's3', 's4'],
        explanation: 'Each step earns the next: name the injustice, try lawful remedies, then break the law openly, and finally accept the penalty. Skip straight to lawbreaking and you have mere defiance, not civil disobedience, the public, penalty-accepting appeal is the whole point.',
      },
    },
    {
      type: 'question',
      prompt: 'A protester smashes windows by night, then hides from police. Surely that still counts as civil disobedience?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'No. Violence, secrecy, and dodging the penalty fail every test King and Rawls set. Civil disobedience is public, nonviolent, and accepts punishment, that is what makes it an appeal to shared justice rather than ordinary crime.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Civil disobedience: public, nonviolent, conscientious lawbreaking',
        'Accepting the penalty distinguishes it from crime',
        'Try legal channels first; breach as last resort',
        'It appeals to the majority\'s sense of justice',
      ],
      closingThought: 'When a law betrays justice, the citizen who accepts jail may honor law more than the lawmaker.',
    },
  ],
};

export default lesson;
