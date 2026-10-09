import type { Lesson } from '@/data/types';

// The first lesson of History's second unit, the life of Julius Caesar (LESSON_RULES AW),
// a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/caesar1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-caesar-1',
  slug: 'caesar-and-the-pirates',
  title: 'Caesar and the Pirates',
  description: 'A Roman ship, a pirate galley, three treasure chests and an island cove: young Caesar is kidnapped, and takes charge.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Kidnapped by pirates, he told them to ask for more.',
      subtext: 'Young Julius Caesar, 75 BC.',
      emoji: '🏴‍☠️',
    },
    {
      type: 'concept',
      title: 'A Hostage in Charge',
      body: 'Sailing to Rhodes to study, young Caesar was captured by Cilician pirates. They asked twenty talents; he told them to ask fifty. For thirty-eight days he ordered them about, and promised to crucify them. Once free, he raised ships, caught them, and kept his promise.',
      visual: '💡',
      highlight: 'fifty',
    },
    {
      type: 'question',
      prompt: 'The pirates asked twenty talents. What did Caesar do?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Told them to ask fifty', isCorrect: true },
          { id: 'b', text: 'Paid the twenty at once', isCorrect: false },
          { id: 'c', text: 'Talked them down to ten', isCorrect: false },
        ],
        explanation: 'He laughed that they did not know who they had caught, and told them to ask fifty.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-caesar-1-1',
      quote: 'Caesar laughed at them for not knowing who their captive was, and of his own accord agreed to give them fifty.',
      author: 'Plutarch',
      era: 'c. AD 100',
      work: 'Life of Caesar, 2 (tr. Bernadotte Perrin)',
    },
    {
      type: 'summary',
      title: 'Caesar and the Pirates',
      keyPoints: [
        'Pirates kidnapped young Caesar on his way to Rhodes',
        'He raised his own ransom from twenty talents to fifty',
        'He promised revenge as a joke, then kept his word',
      ],
      closingThought: 'He was twenty-five, a prisoner, and already acting like the one in charge. Rome was about to meet him.',
    },
  ],
};

export default lesson;
