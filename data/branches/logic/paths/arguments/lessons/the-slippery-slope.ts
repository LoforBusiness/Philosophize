import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-13',
  slug: 'the-slippery-slope',
  title: 'One Step to the Bottom of the Hill',
  description: 'The slippery slope assumes one small step must drag you to disaster.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One small step, and suddenly civilization collapses?',
      subtext: 'Some arguments roll you to disaster without earning a single step.',
      emoji: '⛷️',
    },
    {
      type: 'concept',
      title: 'The Slippery Slope',
      body: 'A slippery slope claims one modest step must trigger a chain ending in catastrophe — yet it justifies no link in that chain. Each "and then" is asserted, never argued. The fall does the persuading; the reasoning never shows up.',
      visual: '🎿',
      highlight: 'unjustified chain',
    },
    {
      type: 'example',
      title: 'The Quiz to the Apocalypse',
      scenario: '"If we let students retake one quiz, soon they\'ll demand to retake finals, then we\'ll have to abolish grades entirely." Notice the leaps: one retake to every retake, every retake to no grades. Nothing shows why any step forces the next. The dread of the bottom hides the missing middle.',
      source: 'Frederick Schauer, "Slippery Slopes"',
      emoji: '📝',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw modus ponens chain conditionals safely.',
      body: 'A slippery slope is a row of if-thens dressed up as sound modus ponens — but none of the links is established. The earlier traps faked the consequences; here the whole chain does, asserting an inevitable fall that was never proven.',
      emoji: '🔗',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-13',
      quote: 'The slippery slope argument claims that a particular act, seemingly innocuous when taken in isolation, may yet lead to a future host of increasingly pernicious events.',
      author: 'Frederick Schauer',
      era: '1985',
      work: 'Slippery Slopes',
    },
    {
      type: 'question',
      prompt: '"Let students retake one quiz, and soon we abolish grades entirely." What is the flaw?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Slippery slope — no link in the chain is justified', isCorrect: true },
          { id: 'b', text: 'No flaw — it traces the logical consequences', isCorrect: false },
          { id: 'c', text: 'It attacks the student instead of the idea', isCorrect: false },
          { id: 'd', text: 'It denies the antecedent of a conditional', isCorrect: false },
        ],
        explanation: 'This is the slippery slope fallacy. The tempting "no flaw" answer mistakes a string of asserted if-thens for a proven chain — but each step needs its own evidence, and none is given. A bare row of dominoes is not an argument that they fall.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Not every chain is a fallacy.',
      body: 'A slope is legitimate when each causal link is actually supported — "one drink impairs judgment, which slows reaction, which raises crash risk." The fallacy is asserting the fall, not tracing genuine, evidenced steps.',
      emoji: '⚖️',
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'A slippery slope asserts an inevitable chain to disaster',
        'It justifies no link — unsupported if-thens posing as proof',
        'It is fallacious only when the causal steps go unsupported',
        'A real chain earns every link with evidence',
      ],
      closingThought: 'Ask of any slope: which step is proven — and which is just dread?',
    },
  ],
};

export default lesson;
