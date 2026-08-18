import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-35',
  slug: 'the-painted-mule',
  title: 'The Zebra and the Painted Mule',
  description: 'You know it is a zebra. Do you know it is not a mule in stripes?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You look at the pen and you know: zebra.',
      subtext: 'Now rule out the paint.',
      emoji: '🦓',
    },
    {
      type: 'concept',
      title: 'Closure',
      body: 'If you know something, and you know it means something else, you should be able to know that too. Know it is a zebra, know a zebra is not a painted mule, and you should know it is not a painted mule. That rule is called closure.',
      visual: '🔗',
      highlight: 'closure',
    },
    {
      type: 'example',
      title: 'The Awkward Pair',
      scenario: 'Ask someone at the zoo whether that is a zebra and they say yes without hesitating. Ask whether they have ruled out a cleverly painted mule and they go quiet. Both answers feel right, and closure says they cannot both be.',
      source: 'Dretske, "Epistemic Operators" (1970)',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-35',
      quote: 'To know is to have evidence that rules out relevant alternatives.',
      author: 'Fred Dretske',
      era: '1970',
    },
    {
      type: 'question',
      prompt: 'Why does the pair of answers cause trouble?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Closure says knowing the first should hand you the second, and it does not feel like it does', isCorrect: true },
          { id: 'b', text: 'Because zoos are not reliable sources of information', isCorrect: false },
          { id: 'c', text: 'Because nobody can ever be certain of anything they see', isCorrect: false },
          { id: 'd', text: 'Because a painted mule really is more likely than a zebra', isCorrect: false },
        ],
        explanation: 'Nothing here is about zoos or certainty. The trouble is structural: the same evidence that comfortably delivers "zebra" seems to deliver nothing at all against the mule.',
      },
    },
    {
      type: 'question',
      prompt: 'One popular answer keeps closure. How?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Say the mule is not a relevant alternative, so ordinary evidence does rule it out', isCorrect: true },
          { id: 'b', text: 'Say knowledge requires certainty after all', isCorrect: false },
          { id: 'c', text: 'Say nobody knows it is a zebra either', isCorrect: false },
          { id: 'd', text: 'Say closure only applies to mathematics', isCorrect: false },
        ],
        explanation: 'If an alternative is far-fetched enough, your evidence counts as excluding it and the pair stops fighting. The cost is that "far-fetched enough" now has to be spelled out — and it moves when the stakes do.',
      },
    },
    {
      type: 'summary',
      title: 'What Your Evidence Reaches',
      keyPoints: [
        'Closure: know it, know what it implies, know that too',
        'Ordinary evidence delivers "zebra" easily',
        'The same evidence seems silent about the paint',
        'Either closure goes, or the mule was never relevant',
      ],
      closingThought: 'You did not check for paint. You did not need to — and saying exactly why you did not need to is most of modern epistemology.',
    },
  ],
};

export default lesson;
