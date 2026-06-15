import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-25',
  slug: 'feminist-political-philosophy',
  title: 'The Personal Is Political',
  description: 'For centuries the home was "private," beyond justice. Feminists asked: who does that serve?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Who does the dishes is a question about justice.',
      subtext: 'For most of history, philosophy said the home was nobody\'s political business.',
      emoji: '🏠',
    },
    {
      type: 'concept',
      title: 'The Public / Private Line',
      body: 'Classic political philosophy drew a line: the public world of law, work, and citizenship deserved scrutiny; the private home did not. Justice stopped at the front door. Inside, power between women and men was treated as natural, not political.',
      visual: '🚪',
      highlight: 'public / private',
    },
    {
      type: 'concept',
      title: '"The Personal Is Political"',
      body: 'Feminist thinkers turned this around. The slogan means that so-called private matters, housework, child care, who decides, who defers, are shaped by power and shape society in turn. What looks like a personal arrangement is held in place by public norms and laws.',
      visual: '📣',
      highlight: 'the personal is political',
    },
    {
      type: 'example',
      title: 'The "Free Choice" To Stay Home',
      scenario: 'A woman "chooses" to leave her career after a child arrives. Looks personal. But childcare is unaffordable, leave policy favors mothers, and she earns less to begin with because of a wage gap. The choice was real, yet the deck was stacked by public rules. Justice, feminists argue, must reach into that stacking.',
      source: 'Susan Moller Okin, Justice, Gender, and the Family (1989)',
      emoji: '💼',
    },
    {
      type: 'quote',
      id: 'lq-political-political-25-1',
      quote: 'One is not born, but rather becomes, a woman.',
      author: 'Simone de Beauvoir',
      era: '1949',
      work: 'The Second Sex',
      philosopherId: 'simone-de-beauvoir',
    },
    {
      type: 'reinforcement',
      callout: 'This echoes Rawls, then pushes past him.',
      body: 'Okin admired Rawls\'s veil of ignorance: choosers who do not know their place. But she noted they were imagined as "heads of households," hiding the family\'s internal injustice. Apply the veil honestly and you cannot know your gender either.',
      emoji: '🧵',
    },
    {
      type: 'question',
      prompt: 'What does "the personal is political" most precisely claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Power and public norms shape supposedly private life, so justice applies there too', isCorrect: true },
          { id: 'b', text: 'People should share every private detail publicly', isCorrect: false },
          { id: 'c', text: 'Politicians should regulate every household choice directly', isCorrect: false },
          { id: 'd', text: 'There is no real difference between any two people', isCorrect: false },
        ],
        explanation: 'Tempting reading (b) and (c) take "political" to mean state surveillance or control. The claim is analytical: the private sphere is not a justice-free zone, because it is structured by power and by public rules.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A society guarantees equal legal rights to all genders, then says its work is done; what happens inside families is a private matter. A feminist replies that unequal housework, care burdens, and economic dependence persist behind that closed door, shaping everything outside it.',
      prompt: 'Is equal rights enough, or must justice enter the home?',
      choices: [
        { id: 'a', label: 'Equal legal rights are enough; the home is private' },
        { id: 'b', label: 'Justice must address inequality within the family' },
        { id: 'c', label: 'Only public workplaces, not homes, are politics\' concern' },
      ],
      views: [
        {
          thinker: 'Susan Moller Okin',
          stance: 'The family is the first school of justice',
          why: 'Children learn fairness, or its absence, at home. A division of labor that leaves women dependent undermines equal citizenship. So a just society must reform the gendered family, not wall it off as private.',
        },
        {
          thinker: 'Classical liberals',
          stance: 'Guard a private sphere from state reach',
          why: 'Protecting an intimate sphere from political control is itself a hard-won liberty. Once justice claims authority over chores and child-rearing, the state gains a dangerous license to manage the most personal corners of life.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Justice Beyond The Front Door',
      keyPoints: [
        'Philosophy long exempted the "private" home from justice',
        '"The personal is political": power shapes private life',
        'Apparent free choices can be structured by public rules',
        'The family may be the first school of justice',
      ],
      closingThought: 'Next time something is called "just private," ask whose interest that label protects.',
    },
  ],
};

export default lesson;
