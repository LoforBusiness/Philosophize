import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-3',
  slug: 'can-you-be-wrong-and-think-you-know',
  title: 'Can You Be Wrong About Something You\'re Certain Of?',
  description: 'Descartes unleashes an evil demon to find one unbreakable belief.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if everything you\'re sure of is a lie?',
      subtext: 'Descartes doubted it all on purpose, then rebuilt knowledge from the rubble.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not Truth',
      body: 'Feeling certain is a state of mind. Truth is how the world actually stands. The two can split apart. So Descartes wants more than confidence: beliefs that withstand every possible reason to doubt.',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In Meditation One, Descartes imagines a demon of utmost power rigging his whole reality. Every sight, every memory, even that two plus three make five, could be a planted lie. This is doubt pushed to the maximum.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '😈',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-3-1',
      quote: 'I am, I exist, is necessarily true whenever it is put forward by me or conceived in my mind.',
      author: 'René Descartes',
      era: '1641',
      work: 'Meditations on First Philosophy, II',
    },
    {
      type: 'concept',
      title: 'Doubt as a Tool',
      body: 'The demon is a device, not a real fear. Descartes asks of each idea: could the demon fake this? Most beliefs crack. One refuses — "I am, I exist." Used this way, doubt rebuilds rather than ruins.',
      visual: '⛏️',
      highlight: 'methodological doubt',
    },
    {
      type: 'question',
      prompt: 'What was Descartes really trying to do with his evil demon thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To find a belief that survives even the fiercest doubt', isCorrect: true },
          { id: 'b', text: 'To prove that such demons genuinely exist', isCorrect: false },
          { id: 'c', text: 'To show that knowledge is forever out of reach', isCorrect: false },
          { id: 'd', text: 'To argue that mathematics can never be trusted', isCorrect: false },
        ],
        explanation: 'The demon is a deliberate stress test. Cranking deception to the extreme reveals what still holds: the thinking self.',
      },
    },
    {
      type: 'question',
      prompt: 'If the demon fakes everything, why can\'t it fake "I exist" away?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because the demon agreed to leave that one belief alone', isCorrect: false },
          { id: 'b', text: 'Because math proves existence is logically certain', isCorrect: false },
          { id: 'c', text: 'Because being deceived still requires someone there to be deceived', isCorrect: true },
          { id: 'd', text: 'It can — Descartes admitted even this belief might be false', isCorrect: false },
        ],
        explanation: 'To be fooled, you must exist to be fooled. The very act of doubting proves a doubter is there.',
      },
    },
    {
      type: 'summary',
      title: 'What Survives the Demon',
      keyPoints: [
        'Feeling certain is not the same as being true',
        'The evil demon stress-tests beliefs with doubt',
        'Doubt can be a method, not despair',
        '"I am, I exist" outlasts every doubt',
      ],
      closingThought: 'Doubting boldly is no weakness. It is the first honest stride toward knowledge that actually holds.',
    },
  ],
};

export default lesson;
