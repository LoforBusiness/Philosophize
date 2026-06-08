import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-2',
  slug: 'something-vs-nothing',
  title: 'Something vs. Nothing',
  description: 'Why is there something rather than nothing? Trace the question from Parmenides to Leibniz.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something rather than nothing?',
      subtext: 'Leibniz gave it its classic form in 1714. Three centuries on, the case stays open.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'The Question Behind Every Question',
      body: 'Leibniz held that nothing is so without a sufficient reason. Apply that rule to existence itself, and the first thing you may ask is: why is there something rather than nothing? "Nothing," he noted, is simpler and easier. So why anything at all?',
      visual: '🕳️',
      highlight: 'sufficient reason',
    },
    {
      type: 'concept',
      title: 'Can Nothing Even Be?',
      body: 'Parmenides struck first. To speak of "what is not," he argued, you must think it — yet you can neither know nor utter what is not. So non-being gives reason nothing to grip. What-is can have no rival, because "nothing" cannot be thought at all.',
      visual: '🧠',
      highlight: 'non-being',
    },
    {
      type: 'example',
      title: 'Parmenides Draws the Line',
      scenario: 'In the early 5th century BCE, Parmenides wrote a poem in which a goddess sets out two ways: that it is, and that it is not. The second is rejected — what is not can never be apprehended. Judge by reason, she says, not by aimless eye and echoing ear. Tradition pairs him against Heraclitus, who saw all things flowing.',
      source: 'Parmenides, fragments of his poem (early 5th c. BCE)',
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
        explanation: 'For Parmenides, "what is not" can be neither known nor spoken. The moment you try to think nothing, you treat it as a thing — so genuine non-being slips away, and what-is is left without a rival.',
      },
    },
    {
      type: 'question',
      prompt: 'Leibniz famously asked why there is something rather than nothing.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'In his Principles of Nature and Grace (1714), Leibniz derives the question from the principle of sufficient reason. His own answer: contingent things might not have existed, so they need a ground outside the whole series — a necessary being.',
      },
    },
    {
      type: 'reinforcement',
      callout: '"Nothing" keeps dissolving the harder you grip it.',
      body: 'Two kinds of answer. Leibniz wants a reason — a necessary being grounding all that might not have been. Parmenides says there was never an alternative, since "nothing" is unthinkable. Either way, the work is done by reasoning, not measuring.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'The Riddle of Being',
      keyPoints: [
        'Leibniz: why something rather than nothing?',
        'His ground: a necessary being',
        'Parmenides: what is not cannot be',
        'Metaphysics reasons toward being itself',
      ],
      closingThought: 'If non-being truly cannot be thought, perhaps being never needed permission to exist.',
    },
  ],
};

export default lesson;
