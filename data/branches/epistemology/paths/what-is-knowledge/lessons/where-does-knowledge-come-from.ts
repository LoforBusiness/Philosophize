import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-4',
  slug: 'where-does-knowledge-come-from',
  title: 'Where Does Knowledge Come From?',
  description: 'Empiricists versus rationalists: the long argument over whether knowledge is built from the senses or partly rooted in reason itself.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Is the mind blank at birth, or already primed to think?',
      subtext: 'Two camps. One question. Centuries of philosophical war.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists say nothing is in the mind before you live it. Locke pictured the mind as "white paper, void of all characters." Every idea comes from two springs: sensation, the outer senses, and reflection, watching your own mind work. Hume agreed: ideas are faint copies of experience.',
      visual: '👁️',
      highlight: 'white paper',
    },
    {
      type: 'example',
      title: 'Locke\'s White Paper',
      scenario: 'Locke first attacked the idea of innate principles: if truths were stamped in us at birth, even children and the unlearned would assent to them, but they don\'t. So ideas must be built. You learn "hot" by getting burned, "red" by seeing red. Bigger ideas grow slowly from countless small sensations.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists fire back: some concepts and truths are part of our nature, not gleaned from the world. Descartes and Leibniz argued that math and logic are grasped by reason alone, a priori, known prior to the senses. The mind isn\'t blank; it\'s primed, ready to unfold what experience only prompts.',
      visual: '⚙️',
      highlight: 'a priori truths',
    },
    {
      type: 'example',
      title: 'Plato\'s Slave Boy',
      scenario: 'In the Meno, Socrates takes an untaught slave boy and, asking only questions, leads him to double the area of a square. Nobody taught him geometry, Socrates argues, so the knowledge was already in his soul. To learn, Plato says, is really to recollect what the mind already held.',
      source: 'Plato, Meno (c. 385 BCE)',
      emoji: '📐',
    },
    {
      type: 'question',
      prompt: 'Which philosopher held that the mind begins as a blank slate, with no innate principles?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'John Locke', isCorrect: true },
          { id: 'b', text: 'René Descartes', isCorrect: false },
          { id: 'c', text: 'Plato', isCorrect: false },
          { id: 'd', text: 'Aristotle', isCorrect: false },
        ],
        explanation: 'Locke called the newborn mind "white paper," filled only through sensation and reflection. Descartes argued the reverse, trusting innate ideas reached by reason. Plato went further still, holding in the Meno that learning is really recollecting truths the soul already had.',
      },
    },
    {
      type: 'question',
      prompt: 'Rationalists hold that some knowledge comes from reason alone, without any experience.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'True. Rationalists like Descartes and Leibniz insisted some truths, especially in math and logic, are reached by reason alone and owe nothing to the senses. Philosophers call these a priori, known prior to experience.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Then Kant brokered a truce.',
      body: 'Kant argued both camps were half right. Raw data pours in through the senses, but the mind\'s own forms, space, time, and cause, shape it into experience. "Thoughts without content are empty, intuitions without concepts are blind." Reason and the senses, he said, need each other.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'Empiricists vs. Rationalists',
      keyPoints: [
        'Empiricists trace all ideas to sensation and reflection',
        'Locke\'s white paper: the mind starts blank',
        'Rationalists say reason yields a priori truths',
        'Kant fused experience and the mind\'s own forms',
      ],
      closingThought: 'Born primed, or learning from scratch? The neat labels oversimplify, but the question is pure epistemology, the study of how you know anything at all.',
    },
  ],
};

export default lesson;
