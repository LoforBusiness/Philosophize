import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-27',
  slug: 'the-liar-paradox',
  title: 'This Sentence Is False',
  description: 'A sentence that breaks logic by talking about itself — and what it taught modern thinkers.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"This sentence is false." Now try to decide if it\'s true.',
      subtext: 'If it\'s true, it\'s false. If it\'s false, it\'s true. The harder you look, the worse it gets.',
      emoji: '🌀',
    },
    {
      type: 'concept',
      title: 'The Liar',
      body: 'Call the sentence L: "L is false." Suppose L is true — then what it says holds, so L is false. Suppose L is false — then what it says is wrong, so L is true. Every assignment flips into its opposite. No stable truth value exists.',
      visual: '🔄',
      highlight: 'no stable truth value',
    },
    {
      type: 'concept',
      title: 'Why It Breaks',
      body: 'The culprit is self-reference: the sentence talks about its own truth. Ordinary statements describe the world; the Liar tries to describe itself, and that loop has no ground to stand on. Self-reference plus negation is a recipe for paradox.',
      visual: '🪞',
      highlight: 'self-reference',
    },
    {
      type: 'example',
      title: 'Epimenides the Cretan',
      scenario: 'The ancient version comes from Epimenides, himself a Cretan, who declared: "All Cretans are liars." If he\'s telling the truth, then Cretans lie — so he lies. The puzzle is over two thousand years old, and it still has no comfortable answer. It returns whenever language is allowed to point at itself.',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Walk through the Liar "L: L is false." Order the reasoning from assumption to deadlock.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 's1', text: 'Assume L is true' },
          { id: 's2', text: 'Then what L says holds, so L is false' },
          { id: 's3', text: 'But assume instead L is false' },
          { id: 's4', text: 'Then L\'s claim is wrong, so L is true — deadlock' },
        ],
        correctOrder: ['s1', 's2', 's3', 's4'],
        explanation: 'Each branch flips into its opposite, and there\'s no exit. That endless flip is the paradox — the sentence simply has no consistent truth value.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'This isn\'t just a party trick.',
      body: 'Self-reference paradoxes pushed logicians to greatness. Russell\'s paradox forced a rebuild of set theory, and Gödel turned self-reference into his incompleteness theorems. A sentence that bites its own tail reshaped twentieth-century logic and mathematics.',
      emoji: '🧩',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-27-1',
      quote: 'The universality of colloquial language is presumably the primary source of all semantical antinomies.',
      author: 'Alfred Tarski',
      era: '1944',
      work: 'The Semantic Conception of Truth',
    },
    {
      type: 'question',
      prompt: 'What should logic do with a sentence like the Liar?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Stop a language from naming its own truth', isCorrect: true },
          { id: 'b', text: 'Give it no truth value at all', isCorrect: false },
          { id: 'c', text: 'Let it be true and false together', isCorrect: false },
          { id: 'd', text: 'Ban self-reference from every sentence', isCorrect: false },
        ],
        explanation: 'Cut the pointing. Tarski split the language in levels, so truth for one level is only ever spoken at the next and the loop has nowhere to close. Leaving it valueless works until somebody writes "this sentence is not true". Accepting both is a serious position that costs a law nearly all logic rests on. And banning self-reference outright would forbid "this sentence is in English", which is harmless and true.',
      },
    },
    {
      type: 'summary',
      title: 'This Sentence Is False',
      keyPoints: [
        'The Liar has no consistent truth value',
        'The cause is self-reference plus negation',
        'Epimenides voiced it over two millennia ago',
        'Such paradoxes reshaped modern logic and math',
      ],
      closingThought: 'Some sentences aren\'t false — they\'re sick. Knowing the difference is real logical maturity.',
    },
  ],
};

export default lesson;
