import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-4',
  slug: 'where-does-knowledge-come-from',
  title: 'Where Does Knowledge Come From?',
  description: 'Senses or reason? Empiricists and rationalists fight over the source.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Blank mind at birth, or already primed?',
      subtext: 'Two camps. One question. Centuries of philosophical war.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists say nothing is in the mind before you live it. Locke pictured it as blank paper. Every idea comes from sensation and reflection. Hume agreed: ideas are faint copies of experience.',
      visual: '👁️',
      highlight: 'blank paper',
    },
    {
      type: 'example',
      title: 'Locke\'s White Paper',
      scenario: 'If truths were stamped in us at birth, even children would assent to them — they don\'t. So ideas are built. You learn "hot" by getting burned, "red" by seeing red. Big ideas grow from small sensations.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-4-1',
      quote: 'Let us suppose the mind to be white paper, void of all characters, without any ideas. How comes it to be furnished?',
      author: 'John Locke',
      era: '1689',
      work: 'An Essay Concerning Human Understanding',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists fire back: some truths are part of our nature. Descartes and Leibniz held that math and logic are grasped by reason alone, a priori — known prior to the senses. The mind is primed, not blank.',
      visual: '⚙️',
      highlight: 'a priori truths',
    },
    {
      type: 'example',
      title: 'Plato\'s Slave Boy',
      scenario: 'In the Meno, Socrates leads an untaught slave boy to double a square\'s area using only questions. Nobody taught him geometry, so the knowledge was already in him. To learn, Plato says, is to recollect.',
      source: 'Plato, Meno (c. 385 BCE)',
      emoji: '📐',
    },
    {
      type: 'question',
      prompt: 'Sort each claim into the camp that would make it.',
      xpValue: 5,
      interaction: {
        type: 'two-camps',
        leftLabel: 'Rationalist',
        rightLabel: 'Empiricist',
        items: [
          { id: 'i1', text: 'The newborn mind is white paper.', side: 'right' },
          { id: 'i2', text: 'Some truths can be reached by reason alone.', side: 'left' },
          { id: 'i3', text: 'Nothing is in the mind that was not first in the senses.', side: 'right' },
          { id: 'i4', text: 'We are born already knowing certain ideas.', side: 'left' },
        ],
        explanation: 'Locke called the newborn mind "white paper," filled only by sensation and reflection; Descartes, Plato and Leibniz all argued the reverse. Note that no rationalist denies the senses matter — the claim is only that SOME truths, mathematics above all, do not wait on them.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Then Kant brokered a truce.',
      body: 'Kant said both camps were half right. Raw data pours in through the senses, but the mind\'s own forms — space, time, cause — shape it into experience. Reason and the senses need each other.',
      emoji: '🌉',
    },
    {
      type: 'question',
      prompt: 'A rationalist says "all knowledge comes from reason." Which claim best fits actual rationalism?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'ALL knowledge comes from reason, with the senses adding nothing', isCorrect: false },
          { id: 'b', text: 'SOME truths, like math, are reachable by reason alone', isCorrect: true },
          { id: 'c', text: 'Reason is just experience that we have forgotten', isCorrect: false },
          { id: 'd', text: 'The senses are illusions, so only reason is real', isCorrect: false },
        ],
        explanation: 'Rationalists claim some truths are a priori, not that experience is worthless. The "all" version overshoots their real position.',
      },
    },
    {
      type: 'summary',
      title: 'Empiricists vs. Rationalists',
      keyPoints: [
        'Empiricists trace ideas to sensation and reflection',
        'Locke\'s white paper: the mind starts blank',
        'Rationalists say reason yields a priori truths',
        'Kant fused experience and the mind\'s forms',
      ],
      closingThought: 'Born primed, or learning from scratch? The labels oversimplify, but the question is pure epistemology — how you know anything at all.',
    },
  ],
};

export default lesson;
