import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-14',
  slug: 'rawls-vs-nozick',
  title: 'Rawls vs Nozick, Round Two',
  description: 'Is justice about a fair pattern, or about a fair history? Two giants collide.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A star earns millions, one dollar at a time. Unjust?',
      subtext: 'Nozick built an entire argument to answer no, and to corner Rawls.',
      emoji: '🏀',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw Rawls and Nozick clash over property.',
      body: 'In Justice as Fairness, Rawls judged distributions by the worst-off. In Property and Distribution, Nozick answered with just process. Now we sharpen that fight into its deepest form.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Two Ways to Judge Justice',
      body: 'Rawls reads a distribution by its pattern: is it fair to the worst-off? Nozick reads it by its history: were the steps just? One looks at the snapshot; the other at the story behind it.',
      visual: '🧭',
      highlight: 'pattern vs history',
    },
    {
      type: 'example',
      title: 'The Wilt Chamberlain Case',
      scenario: 'Start from any distribution you call just. A basketball star asks each fan for one dollar to watch him play. Millions gladly pay. Now he is vastly rich and the pattern is broken. Yet every step was a free, just transfer. So which did you really care about, the pattern, or the freedom that destroyed it?',
      source: 'Robert Nozick, Anarchy, State, and Utopia (1974)',
      emoji: '💵',
    },
    {
      type: 'concept',
      title: 'Liberty Upsets Patterns',
      body: 'Nozick\'s point: to hold any fixed pattern in place, you must keep blocking the voluntary choices that disturb it. So a patterned ideal of justice must continually interfere with free people. Liberty, he says, upsets patterns.',
      visual: '✋',
      highlight: 'continually interfere',
    },
    {
      type: 'quote',
      id: 'lq-political-political-14-1',
      quote: 'Whatever arises from a just situation by just steps is itself just.',
      author: 'Robert Nozick',
      era: '1974',
      work: 'Anarchy, State, and Utopia',
    },
    {
      type: 'dilemma',
      scenario: 'A star is freely paid a dollar by millions of fans and becomes vastly rich. The resulting inequality is huge. A government proposes taxing the fortune to fund the worst-off. Was the inequality unjust to begin with, and may the state correct it?',
      prompt: 'Is the inequality unjust, and may it be redistributed?',
      choices: [
        { id: 'a', label: 'No, it arose from free choices and is entitled' },
        { id: 'b', label: 'It depends on how the worst-off now fare' },
        { id: 'c', label: 'Yes, any large gap is unjust on its face' },
      ],
      views: [
        {
          thinker: 'Robert Nozick',
          stance: 'Just transfers, so taxing it coerces',
          why: 'Each dollar moved by free consent from a just start. Redistribution overrides those choices and treats the star\'s earnings as a resource the state may seize, which Nozick likens to forced labor.',
        },
        {
          thinker: 'John Rawls',
          stance: 'Ask whether background institutions stay fair',
          why: 'An isolated transfer never settles justice. What matters is whether the basic structure, its rules of property and tax, still works to the benefit of the least advantaged over time.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'Nozick\'s Wilt Chamberlain case mainly argues that any patterned ideal of justice must do what?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Continually interfere with people\'s free choices to survive', isCorrect: true },
          { id: 'b', text: 'Make everyone\'s wealth exactly equal forever', isCorrect: false },
          { id: 'c', text: 'Ban professional sports and ticket sales', isCorrect: false },
          { id: 'd', text: 'Prove the rich always work harder than the poor', isCorrect: false },
        ],
        explanation: 'The tempting answer "make everyone equal" is a strawman: it caricatures patterns as crude equality. Nozick\'s real claim is subtler, any fixed pattern, equal or not, can only be preserved by repeatedly blocking voluntary transfers. Liberty upsets patterns.',
      },
    },
    {
      type: 'summary',
      title: 'Pattern Against History',
      keyPoints: [
        'Rawls judges the pattern; Nozick judges the history',
        'Free transfers from a just start break any pattern',
        'Holding a pattern means interfering with liberty',
        'Two real, directly opposed answers',
      ],
      closingThought: 'Ask not only "is this distribution fair?" but "how did it come to be?"',
    },
  ],
};

export default lesson;
