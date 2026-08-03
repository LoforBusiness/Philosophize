import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-32',
  slug: 'borrowing-a-verdict',
  title: 'Can You Borrow a Moral Verdict?',
  description: 'Why taking someone\'s word for it works in physics and feels wrong in ethics.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A trusted friend says it is wrong. Is that enough?',
      subtext: 'You would take their word about a train time without blinking.',
      emoji: '🗣️',
    },
    {
      type: 'concept',
      title: 'Testimony Usually Works',
      body: 'Almost everything you know came from somebody telling you. You have never measured the speed of light or visited most countries. Deferring to people who know better is not laziness — it is how knowledge scales.',
      visual: '📚',
      highlight: 'Most knowledge is borrowed',
    },
    {
      type: 'example',
      title: 'The Asymmetry',
      scenario: '"My friend says the bridge is unsafe, so I am not crossing" sounds sensible. "My friend says eating meat is wrong, so I have stopped" sounds like something is missing — even to people who agree with the conclusion.',
      source: 'The puzzle of moral testimony',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-32',
      quote: 'Nothing is more difficult, and therefore more precious, than to be able to decide.',
      author: 'Napoleon Bonaparte',
      era: 'c. 1810',
    },
    {
      type: 'question',
      prompt: 'Both now hold the same true verdict. What does the borrower lack?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The understanding that would let them apply it to a new case', isCorrect: true },
          { id: 'b', text: 'Nothing — a true belief is a true belief', isCorrect: false },
          { id: 'c', text: 'Certainty, since second-hand claims are always shakier', isCorrect: false },
          { id: 'd', text: 'The right to act on it at all', isCorrect: false },
        ],
        explanation: 'The trap is B, which is right about the belief and wrong about the person. Change the case slightly and the borrower is stuck: they carry a verdict rather than the reasons that produced it.',
      },
    },
    {
      type: 'question',
      prompt: 'So should you ever defer to someone else on a moral question?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — as a signal to go and look, not as a substitute for looking', isCorrect: true },
          { id: 'b', text: 'No — moral judgements must always be worked out alone', isCorrect: false },
          { id: 'c', text: 'Yes, exactly as you would defer about a train time', isCorrect: false },
          { id: 'd', text: 'Only when the person is an accredited ethicist', isCorrect: false },
        ],
        explanation: 'The trap is B, which flatters us and is unlivable — nobody rederives every moral question from scratch. Testimony is excellent evidence that you have missed something. It is a poor replacement for seeing it.',
      },
    },
    {
      type: 'summary',
      title: 'A Verdict Is Not Understanding',
      keyPoints: [
        'Most of what you know is testimony, and that is fine',
        'Moral deference feels different, and the feeling tracks something',
        'A borrowed verdict does not travel to new cases',
        'Take it as a reason to look, not a reason to stop',
      ],
      closingThought: 'You can be handed the right answer and still not have what the answer was made of.',
    },
  ],
};

export default lesson;
