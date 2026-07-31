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
      prompt: 'Whose side would each claim be arguing for?',
      xpValue: 5,
      interaction: {
        type: 'two-camps',
        leftLabel: 'Dualist',
        rightLabel: 'Physicalist',
        items: [
          { id: 'i1', text: 'Thinking and matter are two different kinds of stuff.', side: 'left' },
          { id: 'i2', text: 'Damage the brain and you damage the mind.', side: 'right' },
          { id: 'i3', text: 'I can doubt I have a body, but not that I think.', side: 'left' },
          { id: 'i4', text: 'Every mental event is some physical event.', side: 'right' },
        ],
        explanation: 'Dualism says mind and body are two fundamentally different substances — thinking and unextended on one side, extended and unthinking on the other. Physicalism says there is only the one kind of stuff. Notice that both camps can accept the brain-damage evidence; they disagree about what it shows.',
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
