import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-2',
  slug: 'something-vs-nothing',
  title: 'Something vs. Nothing',
  description: 'Trace the riddle of being from Parmenides to Leibniz.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something rather than nothing?',
      subtext: 'Leibniz gave it its classic form in 1714. The case stays open.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'The Question Behind Every Question',
      body: 'Leibniz held that nothing is so without a sufficient reason. Apply that to existence itself: why is there something rather than nothing? Nothing, he noted, is simpler and easier.',
      visual: '🕳️',
      highlight: 'sufficient reason',
    },
    {
      type: 'concept',
      title: 'Can Nothing Even Be?',
      body: 'Parmenides struck first. To speak of "what is not," you must think it — yet you can neither know nor utter what is not. So non-being gives reason nothing to grip.',
      visual: '🧠',
      highlight: 'non-being',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-2-1',
      quote: 'The same thing is there for thinking and for being.',
      author: 'Parmenides',
      era: 'c. 475 BCE',
      work: 'On Nature, fragment 3',
    },
    {
      type: 'example',
      title: 'Parmenides Draws the Line',
      scenario: 'A goddess in his poem sets out two ways: that it is, and that it is not. The second is rejected — what is not can never be grasped. Judge by reason, she says, not by eye and ear.',
      source: 'Parmenides, On Nature (early 5th c. BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'On Parmenides\'s view, why can pure nothingness never truly exist?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Physics has not yet discovered it', isCorrect: false },
          { id: 'b', text: 'To think of nothing is to turn it into a something', isCorrect: true },
          { id: 'c', text: 'Nothingness is far too small to detect', isCorrect: false },
          { id: 'd', text: 'The gods forbade it in his poem', isCorrect: false },
        ],
        explanation: 'For Parmenides, "what is not" can be neither known nor spoken. Try to think nothing and you treat it as a thing — so genuine non-being slips away.',
      },
    },
    {
      type: 'question',
      prompt: 'Leibniz and Parmenides both reasoned about being. So they reached the same conclusion, right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — both proved a necessary being exists', isCorrect: false },
          { id: 'b', text: 'Yes — both said nothing is unthinkable', isCorrect: false },
          { id: 'c', text: 'No — Leibniz wants a reason for being; Parmenides denies nothing was ever an option', isCorrect: true },
          { id: 'd', text: 'No — Parmenides agreed with science, Leibniz did not', isCorrect: false },
        ],
        explanation: 'They differ: Leibniz seeks a sufficient reason (a necessary being); Parmenides argues "nothing" is unthinkable, so being never needed an explanation for beating an alternative.',
      },
    },
    {
      type: 'summary',
      title: 'The Riddle of Being',
      keyPoints: [
        'Leibniz: why something rather than nothing?',
        'His ground: a necessary being',
        'Parmenides: what is not cannot be',
        'Reason, not measurement, does the work',
      ],
      closingThought: 'If non-being truly cannot be thought, perhaps being never needed permission to exist.',
    },
  ],
};

export default lesson;
