import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-35',
  slug: 'why-is-anything-funny',
  title: 'Why Is Anything Funny?',
  description: 'Explaining a joke kills it. That is a clue, not an accident.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Nothing is less funny than a joke explained.',
      subtext: 'Why should understanding ruin it?',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'Incongruity',
      body: 'A joke sets up one pattern and delivers another. You spend the setup building an expectation, and the punchline swaps it for a second reading that fits just as well. The laugh is the swap, which is why it only works once.',
      visual: '🔀',
      highlight: 'the laugh is the swap',
    },
    {
      type: 'example',
      title: 'The Rival Theories',
      scenario: 'Hobbes said we laugh from sudden glory at someone else\'s expense. Freud said laughter releases pressure we were holding in. Incongruity says neither is needed: the mismatch itself is enough, which is why puns work on nobody\'s misfortune.',
      source: 'Kant, Critique of Judgment (1790)',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-35',
      quote: 'Laughter is an affection arising from a strained expectation being suddenly reduced to nothing.',
      author: 'Immanuel Kant',
      era: '1790',
    },
    {
      type: 'question',
      prompt: 'Why does explaining a joke destroy it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The explanation supplies the second reading, so there is no swap left to happen', isCorrect: true },
          { id: 'b', text: 'Because jokes are only funny when they are new to everyone', isCorrect: false },
          { id: 'c', text: 'Because analysis is always the enemy of enjoyment', isCorrect: false },
          { id: 'd', text: 'Because the explanation takes longer than the joke', isCorrect: false },
        ],
        explanation: 'Timing and novelty matter, but the deep reason is structural: you cannot be surprised by a reading you have just been handed. The explanation does the joke\'s job, badly, in advance.',
      },
    },
    {
      type: 'question',
      prompt: 'What is the best evidence against the superiority theory?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Plenty of jokes have no victim at all — a pun humiliates nobody', isCorrect: true },
          { id: 'b', text: 'People sometimes laugh when they are alone', isCorrect: false },
          { id: 'c', text: 'Cruel jokes are usually considered bad taste', isCorrect: false },
          { id: 'd', text: 'Not everyone finds the same things funny', isCorrect: false },
        ],
        explanation: 'A theory of humour has to cover the whole range. Superiority explains mockery beautifully and has nothing to say about a pun, which is funny with nobody beneath anybody.',
      },
    },
    {
      type: 'summary',
      title: 'The Swap',
      keyPoints: [
        'A joke builds one reading and delivers a second',
        'Both readings must genuinely fit',
        'Explaining supplies the second reading in advance',
        'Superiority and relief cover only some of the cases',
      ],
      closingThought: 'Comedy is the one art form whose success is measured by an involuntary noise. No wonder it resists being explained by people writing carefully.',
    },
  ],
};

export default lesson;
