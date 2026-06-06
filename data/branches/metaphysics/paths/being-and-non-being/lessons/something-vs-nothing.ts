import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-2',
  slug: 'something-vs-nothing',
  title: 'Something vs. Nothing',
  description: 'Why is there something rather than nothing? Meet the oldest, deepest question in metaphysics.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something rather than nothing?',
      subtext: 'Leibniz asked it. Three centuries on, nobody has truly closed the case.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'The Question Behind Every Question',
      body: 'The philosopher Gottfried Leibniz pressed the boldest question there is: why is there something rather than nothing? Existence itself demands no explanation, yet here it all is. Philosophers call this the riddle of being. Nothing would have been simpler. So why anything at all?',
      visual: '🕳️',
      highlight: 'the riddle of being',
    },
    {
      type: 'concept',
      title: 'Can Nothing Even Be?',
      body: 'The ancient Greek thinker Parmenides struck first. To speak of nothing, he argued, you must think it. But to think it is to make it a something. So "nothing" cancels itself: what is not, cannot be. For Parmenides, only being exists. Pure non-being is unthinkable.',
      visual: '🧠',
      highlight: 'non-being',
    },
    {
      type: 'example',
      title: 'Parmenides Draws the Line',
      scenario: 'Around 500 BCE, Parmenides wrote a poem in which a goddess hands him one iron rule: "what is, is; what is not, cannot be." Reason, not the eyes, reveals truth. Change and absence are illusions. Heraclitus disagreed fiercely, insisting all is flux. That clash launched Western metaphysics.',
      source: 'Parmenides, On Nature (c. 500 BCE)',
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
        explanation: 'Parmenides held that "what is not, cannot be." The moment you think or speak of nothing, you treat it as a thing — so genuine non-being escapes us. Only being remains.',
      },
    },
    {
      type: 'question',
      prompt: 'Leibniz famously asked why there is something rather than nothing.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Leibniz framed this as the deepest question in metaphysics. He thought a full answer required a necessary being to ground all the contingent things that might just as easily not have existed.',
      },
    },
    {
      type: 'reinforcement',
      callout: '"Nothing" keeps dissolving the harder you grip it.',
      body: 'Leibniz asks why anything exists; Parmenides answers that non-being is unthinkable, so being had no alternative. Heraclitus pushes back, calling reality pure flux. These rival moves are metaphysics itself — reasoning, not measuring, our way toward what it means to be.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'The Riddle of Being',
      keyPoints: [
        'Leibniz: why something rather than nothing?',
        'Parmenides: what is not cannot be',
        'Heraclitus: all reality is flux',
        'Metaphysics reasons toward being itself',
      ],
      closingThought: 'If non-being is truly unthinkable, perhaps being never needed permission to exist.',
    },
  ],
};

export default lesson;
