import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-24',
  slug: 'deduction-induction-abduction',
  title: 'The Three Ways to Reason',
  description: 'Deduction, induction, and abduction — and why the best detectives use the third.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Sherlock Holmes never "deduced" anything. He guessed brilliantly.',
      subtext: 'There are three engines of inference, and his famous one isn\'t deduction at all.',
      emoji: '🔎',
    },
    {
      type: 'concept',
      title: 'Deduction',
      body: 'Deduction moves from general rules to a guaranteed conclusion. If the premises are true, the conclusion can\'t be false. "All humans are mortal; Socrates is human; so Socrates is mortal." Airtight — but it never tells you anything the premises didn\'t already contain.',
      visual: '🔒',
      highlight: 'guaranteed conclusion',
    },
    {
      type: 'concept',
      title: 'Induction',
      body: 'Induction moves from many cases to a likely generalisation. "Every sunrise so far, so probably tomorrow too." It can teach you genuinely new things — but it\'s never certain. One black swan, and the rule breaks.',
      visual: '📈',
      highlight: 'likely, never certain',
    },
    {
      type: 'concept',
      title: 'Abduction',
      body: 'Abduction infers the best explanation for what you observe. Wet grass at dawn? Most likely it rained. It\'s a reasoned guess at the likeliest cause — powerful, but defeasible if a better explanation appears (maybe the sprinkler ran).',
      visual: '💡',
      highlight: 'best explanation',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-24-1',
      quote: 'Abduction is the process of forming an explanatory hypothesis. It is the only logical operation which introduces any new idea.',
      author: 'Charles Sanders Peirce',
      era: 'c. 1903',
      work: 'Collected Papers',
      philosopherId: 'charles-sanders-peirce',
    },
    {
      type: 'question',
      prompt: 'You find your kitchen flooded and a burst pipe nearby. "The pipe caused it." Which inference is this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Abduction — inferring the best explanation', isCorrect: true },
          { id: 'b', text: 'Deduction — the conclusion is guaranteed', isCorrect: false },
          { id: 'c', text: 'Induction — generalising from many floods', isCorrect: false },
          { id: 'd', text: 'None — it\'s just a wild guess', isCorrect: false },
        ],
        explanation: 'It feels like deduction because the answer seems obvious — but it isn\'t guaranteed. The flood could have other causes. You\'re picking the likeliest explanation for the evidence: that\'s abduction, and it stays open to revision.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you sorted valid from strong.',
      body: 'Deduction aims at validity: truth-preserving and certain. Induction and abduction aim at strength: probable, world-expanding, but fallible. Knowing which engine an argument runs on tells you exactly how much certainty to expect from it.',
      emoji: '⚙️',
    },
    {
      type: 'summary',
      title: 'Three Ways to Reason',
      keyPoints: [
        'Deduction: certain, but tells you nothing new',
        'Induction: generalises from cases, only probable',
        'Abduction: infers the best explanation, revisable',
        'Detective work is mostly abduction, not deduction',
      ],
      closingThought: 'Match the engine to the job: certainty, generalisation, or the best available guess.',
    },
  ],
};

export default lesson;
