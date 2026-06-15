import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-30',
  slug: 'ideal-vs-non-ideal-theory',
  title: 'The Just Society, And The Road There',
  description: 'Capstone: should we map the perfect society, or fix the worst injustice in front of us?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Should we picture utopia, or just abolish the nearest injustice?',
      subtext: 'Every theory you have met faces this final question: ideal blueprint, or real-world repair?',
      emoji: '🧭',
    },
    {
      type: 'reinforcement',
      callout: 'You have toured rival visions of the just society.',
      body: 'Rawls and Nozick, liberty and equality, recognition and democracy, war and punishment. This capstone steps back to ask how political philosophy should even work: aim at the perfect, or start from the broken?',
      emoji: '🗺️',
    },
    {
      type: 'concept',
      title: 'Ideal Theory',
      body: 'Ideal theory asks: what would a perfectly just society look like, if everyone complied and conditions were favorable? Rawls began here, building a model of perfect justice first, on the bet that we cannot fix injustice well until we know what justice ultimately is.',
      visual: '🏔️',
      highlight: 'ideal theory',
    },
    {
      type: 'concept',
      title: 'Non-Ideal Theory',
      body: 'Non-ideal theory starts from the world as it is, with its injustice, partial compliance, and scarcity, and asks what to do now. Critics like Sen say we rarely need a blueprint of perfection to know that slavery, famine, or torture must end first.',
      visual: '🛠️',
      highlight: 'non-ideal theory',
    },
    {
      type: 'example',
      title: 'You Do Not Need Everest',
      scenario: 'Sen offers an image: to judge that one painting is better than another, you do not need to name the world\'s greatest painting. Likewise, to know that ending slavery improves justice, you need not first settle what perfect justice is. Comparing real options, he argues, matters more than mapping a faraway ideal.',
      source: 'Amartya Sen, The Idea of Justice (2009)',
      emoji: '🖼️',
    },
    {
      type: 'quote',
      id: 'lq-political-political-30-1',
      quote: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      era: '1971',
      work: 'A Theory of Justice',
      philosopherId: 'john-rawls',
    },
    {
      type: 'question',
      prompt: 'Sen\'s painting analogy is meant to show what about non-ideal theory?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We can rank real options as more or less just without a perfect ideal', isCorrect: true },
          { id: 'b', text: 'Art and justice are exactly the same thing', isCorrect: false },
          { id: 'c', text: 'No society can ever be compared to another', isCorrect: false },
          { id: 'd', text: 'Perfect justice has already been achieved somewhere', isCorrect: false },
        ],
        explanation: 'Tempting answer (b) overreads the analogy. The point is methodological: comparative judgments ("this is more just than that") do not require first identifying a transcendent perfect ideal, just as ranking two paintings needs no "greatest painting."',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A reformer has limited time and energy. She can devote it to designing the blueprint of a perfectly just society, hoping it guides reform for generations, or to abolishing one glaring injustice now, imperfectly, with no grand theory behind it.',
      prompt: 'Where should political philosophy spend its effort?',
      choices: [
        { id: 'a', label: 'Map the ideal first; it guides all reform' },
        { id: 'b', label: 'Fix the worst injustice now; theory can wait' },
        { id: 'c', label: 'Both at once; an ideal anchors urgent repair' },
      ],
      views: [
        {
          thinker: 'John Rawls (ideal theory)',
          stance: 'We need a clear target to aim at',
          why: 'Without a worked-out conception of perfect justice, reforms drift; we cannot tell whether a change is real progress or a detour. The ideal is a compass, not a fantasy, orienting all our piecemeal efforts.',
        },
        {
          thinker: 'Amartya Sen (non-ideal theory)',
          stance: 'Reduce injustice we can actually see',
          why: 'People suffering now cannot wait for a perfect blueprint that may never arrive. We routinely know one arrangement is less unjust than another; acting on those comparisons does more good than chasing utopia.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Blueprint Or Repair',
      keyPoints: [
        'Ideal theory maps the perfectly just society',
        'Non-ideal theory tackles real injustice now',
        'Sen: we can rank options without a perfect ideal',
        'A just society needs both vision and action',
      ],
      closingThought: 'You have the questions now. The just society is not found, but argued for, and built.',
    },
  ],
};

export default lesson;
