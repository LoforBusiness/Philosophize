import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-8',
  slug: 'free-will-vs-determinism',
  title: 'Are You Free, or Wound Up?',
  description: 'If every event has a cause, was your last choice ever really yours?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Did you choose this — or was it always coming?',
      subtext: 'Determinism says the dominoes were set long ago.',
      emoji: '🎲',
    },
    {
      type: 'concept',
      title: 'The Determinist Threat',
      body: 'Determinism holds that every event, including your choices, is fixed by prior causes and the laws of nature. If true, then given the past, you could never have done otherwise.',
      visual: '⛓️',
      highlight: 'could never have done otherwise',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-8-1',
      quote: 'My first act of free will shall be to believe in free will.',
      author: 'William James',
      era: '1870',
      work: 'Diary entry, 30 April',
    },
    {
      type: 'example',
      title: 'Laplace\'s Demon',
      scenario: 'Imagine an intellect knowing the position of every atom and every force acting on it. For such a mind, said Laplace, nothing would be uncertain — the future, like the past, would lie open before its eyes.',
      emoji: '👹',
      source: 'Laplace, A Philosophical Essay on Probabilities (1814)',
    },
    {
      type: 'concept',
      title: 'A Third Way: Compatibilism',
      body: 'Compatibilists answer that freedom is not the absence of causes but the absence of compulsion. You act freely when you do what you want, unforced — even if your wants themselves were caused.',
      visual: '🔀',
      highlight: 'compatibilism',
    },
    {
      type: 'question',
      prompt: 'What does the determinist claim about your decisions?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They are random and unpredictable', isCorrect: false },
          { id: 'b', text: 'They follow inevitably from prior causes and natural laws', isCorrect: true },
          { id: 'c', text: 'They are made by a soul outside nature', isCorrect: false },
          { id: 'd', text: 'They prove the future is unknowable', isCorrect: false },
        ],
        explanation: 'Determinism says each choice is the inevitable effect of earlier causes plus the laws of nature, so given the past, only one outcome was ever possible.',
      },
    },
    {
      type: 'question',
      prompt: 'Quantum physics says some events are random. Doesn\'t that randomness rescue free will?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — randomness means our choices are free', isCorrect: false },
          { id: 'b', text: 'Yes — undetermined events must be freely willed', isCorrect: false },
          { id: 'c', text: 'No — a choice fixed by chance is no more yours than one fixed by causes', isCorrect: true },
          { id: 'd', text: 'No — quantum physics has been disproven', isCorrect: false },
        ],
        explanation: 'Randomness is not control: if a decision is settled by a coin-flip in your neurons, it is luck rather than agency, so mere chance does not deliver the freedom we want.',
      },
    },
    {
      type: 'summary',
      title: 'Freedom on Trial',
      keyPoints: [
        'Determinism: every choice fixed by prior causes',
        'Laplace\'s demon would foresee it all',
        'Compatibilism: free means unforced, not uncaused',
        'Randomness is not the same as control',
      ],
      closingThought: 'Whether or not the dominoes were set, you still have to decide — and that deciding feels like the freest thing you do.',
    },
  ],
};

export default lesson;
