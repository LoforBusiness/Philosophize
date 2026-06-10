import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-9',
  slug: 'mind-and-body',
  title: 'Is the Mind More Than the Brain?',
  description: 'Descartes thought mind and matter were two utterly different kinds of thing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Are your thoughts made of the same stuff as your brain?',
      subtext: 'Descartes was sure they were not.',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Descartes\'s Dualism',
      body: 'Descartes doubted everything he could, but could not doubt that he was thinking. Mind, he concluded, is a thinking thing without extension; body is an extended thing without thought. Two separate substances.',
      visual: '🪞',
      highlight: 'two separate substances',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-9-1',
      quote: 'I am, then, in the strict sense only a thing that thinks; that is, I am a mind, or intelligence, or intellect, or reason.',
      author: 'Rene Descartes',
      era: '1641',
      work: 'Meditations on First Philosophy, II',
    },
    {
      type: 'concept',
      title: 'The Interaction Problem',
      body: 'If mind and body are wholly different, how does a thought lift your arm? Descartes guessed the pineal gland. Critics replied: an unextended mind has no way to push physical matter at all.',
      visual: '🔗',
      highlight: 'how does a thought lift your arm',
    },
    {
      type: 'example',
      title: 'The Physicalist Reply',
      scenario: 'Damage the brain and the mind changes — memory, mood, even character. To many philosophers this suggests the mind is not a separate substance but what the brain does, the way digestion is what the gut does.',
      emoji: '⚡',
    },
    {
      type: 'question',
      prompt: 'What is the core claim of Descartes\'s dualism?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The mind is simply a part of the brain', isCorrect: false },
          { id: 'b', text: 'Mind and body are two distinct kinds of substance', isCorrect: true },
          { id: 'c', text: 'Only the body is real; the mind is illusion', isCorrect: false },
          { id: 'd', text: 'Mind and body are the same single thing', isCorrect: false },
        ],
        explanation: 'Dualism holds that mind (thinking, unextended) and body (extended, unthinking) are two fundamentally different substances rather than one.',
      },
    },
    {
      type: 'question',
      prompt: '"I think, therefore I am" comes from the Meditations, so it proves the mind is separate from the body. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'The famous phrase appears in the Discourse, not the Meditations, and the cogito only proves that a thinking thing exists — the leap to mind being a separate substance is a further, much-disputed argument.',
      },
    },
    {
      type: 'summary',
      title: 'The Mind-Body Knot',
      keyPoints: [
        'Descartes: mind and body, two substances',
        'Mind thinks; body merely extends',
        'The interaction problem dogs dualism',
        'Physicalists: mind is what brains do',
      ],
      closingThought: 'Whatever the mind turns out to be, the gap between thought and matter remains philosophy\'s hardest seam to close.',
    },
  ],
};

export default lesson;
