import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-15',
  slug: 'hasty-generalization',
  title: 'Two Cases Are Not a Pattern',
  description: 'A hasty generalization leaps from a tiny sample to a sweeping rule.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two rude tourists, and a whole country is rude?',
      subtext: 'Watch how fast a couple of cases hardens into a sweeping rule.',
      emoji: '🌍',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw strong vs weak inductive arguments.',
      body: 'Induction bets that a sample reflects the whole. The bet is only as strong as the sample is large and fair. Shrink the sample to a case or two and the inference goes weak — this is exactly where it breaks.',
      emoji: '🎲',
    },
    {
      type: 'concept',
      title: 'The Inductive Leap, Overshot',
      body: 'A HASTY GENERALIZATION draws a broad conclusion from a sample too small or unrepresentative to support it. The inductive leap outruns the evidence beneath it. Firsthand experience feels like proof, but two encounters cannot speak for millions.',
      visual: '🦘',
      highlight: 'too small or unrepresentative',
    },
    {
      type: 'example',
      title: 'Bacon on a Mind in a Hurry',
      scenario: 'Bacon warned that the mind grabs the first few cases and rushes to a rule, ignoring everything that does not fit. He called these distorting habits "Idols." The hasty generalization is one in action: a vivid encounter or two, mistaken for the shape of the whole.',
      source: 'Francis Bacon, Novum Organum, 1620',
      emoji: '🔬',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-15',
      quote: 'The human understanding, from its peculiar nature, easily supposes a greater degree of order and equality in things than it really finds.',
      author: 'Francis Bacon',
      era: '1620',
      work: 'Novum Organum',
      philosopherId: 'francis-bacon',
    },
    {
      type: 'question',
      prompt: '"I met two rude tourists from that country, so people there are rude." Firsthand evidence — so the conclusion is well supported. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False — this is a hasty generalization. Two cases is a sample far too small and unrepresentative to support a claim about millions, and firsthand experience does not fix the sample size. The inductive leap outruns the evidence beneath it.',
      },
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-15-2',
      quote: 'A prudent question is one half of wisdom.',
      author: 'Francis Bacon',
      era: '1597',
      work: 'Essays',
      philosopherId: 'francis-bacon',
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Hasty generalization: big claim, tiny sample',
        'Firsthand cases do not fix sample size',
        'It is weak induction — the leap outruns evidence',
        'Ask: large enough? representative enough?',
      ],
      closingThought: 'A pattern needs more than two points. Before you generalize, count your evidence.',
    },
  ],
};

export default lesson;
