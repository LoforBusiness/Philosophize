import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-36',
  slug: 'who-is-watching',
  title: 'Who Is Watching',
  description: '"Nothing to hide" answers the wrong question about being seen.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A camera that only ever watches innocent people.',
      subtext: 'Something still changed.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'The Chilling Effect',
      body: 'Being watched changes behaviour before it changes anything else. People consult fewer awkward sources, sign fewer petitions, say less at meetings. None of that requires a single prosecution. The knowledge that a record exists is the whole mechanism.',
      visual: '🌡️',
      highlight: 'the knowledge that a record exists',
    },
    {
      type: 'example',
      title: 'The Inspection House',
      scenario: 'Bentham designed a prison where one guard could see every cell and no prisoner could tell whether they were being watched. The genius was that the guard need not be there. Foucault noticed that the design describes far more than prisons.',
      source: 'Foucault, "Discipline and Punish" (1975)',
    },
    {
      type: 'quote',
      id: 'lq-political-political-36',
      quote: 'Visibility is a trap.',
      author: 'Michel Foucault',
      era: '1975',
    },
    {
      type: 'question',
      prompt: 'What is wrong with "nothing to hide, nothing to fear"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It treats privacy as concealing wrongs, when the harm falls on innocent behaviour', isCorrect: true },
          { id: 'b', text: 'It is false because everybody has something to hide', isCorrect: false },
          { id: 'c', text: 'It ignores the risk of the data being stolen', isCorrect: false },
          { id: 'd', text: 'It only applies to governments, not companies', isCorrect: false },
        ],
        explanation: 'Leaks and hypocrisy are real arguments and both concede the framing. The deeper reply is that the loss lands on people doing nothing wrong: what shrinks is the range of ordinary things they feel free to do.',
      },
    },
    {
      type: 'question',
      prompt: 'Why does it matter whether the watching is uncertain?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Uncertainty makes you behave as if always watched, so it works without being used', isCorrect: true },
          { id: 'b', text: 'Because uncertain surveillance is easier to challenge legally', isCorrect: false },
          { id: 'c', text: 'Because it means fewer people are actually monitored', isCorrect: false },
          { id: 'd', text: 'It does not matter — only actual observation has effects', isCorrect: false },
        ],
        explanation: 'That is Bentham\'s design working exactly as intended. If you cannot tell, the safe assumption is that you are being watched, and you adjust — which costs the watcher nothing and does not require them to be there.',
      },
    },
    {
      type: 'summary',
      title: 'What Being Seen Costs',
      keyPoints: [
        'The harm lands on innocent behaviour, not hidden guilt',
        'Uncertainty about being watched is enough',
        'The effect needs no prosecution to work',
        'What shrinks is the range of things people try',
      ],
      closingThought: 'A society can be perfectly free on paper and quietly narrower in practice, and the narrowing shows up in nobody\'s statistics.',
    },
  ],
};

export default lesson;
