import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-28',
  slug: 'arguing-by-analogy',
  title: 'Arguing by Analogy',
  description: 'When "it\'s just like X" is a powerful argument — and when it quietly cheats.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every great argument hides a "this is like that."',
      subtext: 'Analogies persuade fast. But the wrong likeness can smuggle a bad conclusion right past you.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'The Argument by Analogy',
      body: 'An analogical argument says: A and B are alike in known ways, so they\'re probably alike in another way too. It\'s inductive — never certain, but often strong. Its strength depends entirely on whether the shared features are relevant to the conclusion.',
      visual: '🔗',
      highlight: 'relevant shared features',
    },
    {
      type: 'concept',
      title: 'When It\'s Strong vs Weak',
      body: 'Strong: many relevant similarities, few relevant differences, a modest conclusion. Weak: the similarities are superficial, or a crucial difference is ignored. A "disanalogy" — one important way the cases differ — can sink the whole argument on its own.',
      visual: '🪓',
      highlight: 'one important disanalogy',
    },
    {
      type: 'example',
      title: 'The Violinist',
      scenario: 'Judith Jarvis Thomson imagines you waking up wired to a famous violinist who needs your kidneys for nine months to survive. Unplugging him kills him — yet surely you may. She argues pregnancy from rape is relevantly similar, so abortion can be permissible. The argument lives or dies on whether the cases are truly alike.',
      source: 'Thomson, "A Defense of Abortion", 1971',
      emoji: '🎻',
    },
    {
      type: 'question',
      prompt: '"Banning hate speech is fine — we ban shouting fire in a theatre." What weakens this analogy most?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A relevant difference: one causes instant panic, one expresses a view', isCorrect: true },
          { id: 'b', text: 'Theatres and public squares are different buildings', isCorrect: false },
          { id: 'c', text: 'Some people enjoy theatre and some don\'t', isCorrect: false },
          { id: 'd', text: 'The phrase about fire is very old', isCorrect: false },
        ],
        explanation: 'It\'s tempting to nitpick surface details like buildings — but those are irrelevant. An analogy is broken by a relevant disanalogy: shouting fire triggers immediate physical danger, whereas hate speech expresses a viewpoint. That gap is what does the damage.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met the hasty generalization.',
      body: 'Both errors over-extend a small base. Hasty generalization leaps from too few cases to a rule; a weak analogy leaps from a shallow resemblance to a conclusion. The fix for both is the same: demand that the link actually be relevant.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'Arguing by Analogy',
      keyPoints: [
        'Analogy: alike here, so probably alike there',
        'Strong when shared features are relevant and many',
        'Weak when a relevant difference is ignored',
        'Attack analogies by finding the key disanalogy',
      ],
      closingThought: 'Next time you hear "it\'s just like…", ask: alike in the way that actually matters?',
    },
  ],
};

export default lesson;
