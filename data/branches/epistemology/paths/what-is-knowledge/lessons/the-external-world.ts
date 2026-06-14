import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-14',
  slug: 'the-external-world',
  title: 'How Do You Know the World Is Real?',
  description: 'The brain-in-a-vat puzzle, and why it is so hard to disprove.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'How do you know you are not a brain in a vat?',
      subtext: 'A floating brain, fed fake signals, would have your exact experiences right now.',
      emoji: '🧠',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier Descartes feared an evil demon.',
      body: 'The modern version swaps the demon for a supercomputer. A brain in a tank, wired to a simulation, would see, hear, and feel a world that does not exist. Nothing in your experience could tell the difference.',
      emoji: '🪣',
    },
    {
      type: 'concept',
      title: 'The Problem of the External World',
      body: 'All you ever directly access is your own experience. The leap from experience to a real outside world is an inference. The brain-in-a-vat scenario shows that inference can never be fully proven from the inside.',
      visual: '🌐',
      highlight: 'the external world',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-14-1',
      quote: 'In one sense it must be admitted that we can never prove the existence of things other than ourselves and our experiences.',
      author: 'Bertrand Russell',
      era: '1912',
      work: 'The Problems of Philosophy',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'concept',
      title: 'Putnam’s Reply',
      body: 'Hilary Putnam argued the scenario may be self-refuting. If you really were a lifelong brain in a vat, your word "vat" would refer to vat-images, not real vats. So the sentence "I am a brain in a vat" could not even be true.',
      visual: '🔁',
      highlight: 'self-refuting',
    },
    {
      type: 'question',
      prompt: 'Why is "you might be a brain in a vat" so hard to refute with experience alone?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The fake experiences would be identical to real ones, so no observation distinguishes them', isCorrect: true },
          { id: 'b', text: 'Because it has already been scientifically proven true', isCorrect: false },
          { id: 'c', text: 'Because pinching yourself reliably wakes you from any simulation', isCorrect: false },
          { id: 'd', text: 'Because vats are physically impossible to build', isCorrect: false },
        ],
        explanation:
          'Option (c) is a tempting appeal to common sense, but it begs the question: a simulation would fake the pinch too. The scenario is built so that every possible piece of evidence is equally explained by both worlds.',
      },
    },
    {
      type: 'summary',
      title: 'The World Beyond Experience',
      keyPoints: [
        'You only directly access your own experience',
        'Brain-in-a-vat fakes all evidence equally',
        'Russell saw the external world as an inference',
        'Putnam argued the scenario may be self-refuting',
      ],
      closingThought: 'You probably cannot prove the world is real. But notice: you cannot prove it is fake either, and you have to live somewhere.',
    },
  ],
};

export default lesson;
