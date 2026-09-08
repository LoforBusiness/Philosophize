import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-39',
  slug: 'can-nothing-cause-something',
  title: 'Can Nothing Cause Something?',
  description: 'The gardener did not water the plant and the plant died. So did the king, and nobody blames him. Something other than physics is choosing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The plant died because nobody watered it.',
      subtext: 'Nobody is a great many people.',
      emoji: '🪴',
    },
    {
      type: 'concept',
      title: 'Causation by Omission',
      body: 'A cause is usually something that happens. An omission is something that does not, and we treat omissions as causes all the time: the missed call, the unread email, the water that never came. The trouble is telling one absence from all the others.',
      visual: '🚱',
      highlight: 'telling one absence from all the others',
    },
    {
      type: 'example',
      title: 'Everyone Who Did Not Water It',
      scenario: 'Ask what would have happened if the gardener had watered the plant, and the answer is that it would have lived. That is the standard test for a cause, and it passes. Now ask the same about the king, or a stranger three streets away. They did not water it either, and the answer comes out identical.',
      source: 'the problem of profligate omissions',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-39',
      quote: 'Where, if the first object had not been, the second never had existed.',
      author: 'David Hume',
      era: '1748',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: 'Why do we call the gardener a cause and not the king?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The gardener was the one expected to water it', isCorrect: true },
          { id: 'b', text: 'The gardener was physically closer to the plant', isCorrect: false },
          { id: 'c', text: 'Only the gardener could have known it was dry', isCorrect: false },
          { id: 'd', text: 'The king did not exist at the time', isCorrect: false },
        ],
        explanation: 'A duty picks the gardener out, and nothing in the physics does. Distance will not help — a neighbour is nearer than the gardener on a day off. Nor will knowledge, since a passer-by can see a dry plant perfectly well and still owes it nothing.',
      },
    },
    {
      type: 'question',
      prompt: 'What does that tell you about causes?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Which cause we name depends partly on what was expected', isCorrect: true },
          { id: 'b', text: 'Absences are never really causes at all', isCorrect: false },
          { id: 'c', text: 'Every absence is a cause, equally', isCorrect: false },
          { id: 'd', text: 'Causation is entirely a matter of opinion', isCorrect: false },
        ],
        explanation: 'Selection is doing work that physics does not. That does not make causes imaginary: the plant really did die of thirst, and no expectation could have saved it. It means the step from a full account to one named cause runs through what we thought would happen.',
      },
    },
    {
      type: 'summary',
      title: 'The Water That Never Came',
      keyPoints: [
        'Absences pass the usual test for causes',
        'So do far too many of them at once',
        'What was expected picks out the one we name',
        'The full account and the named cause are different things',
      ],
      closingThought: 'Next time a report blames someone for not acting, ask who else did not act. The list is always long, and what shortens it is never physics.',
    },
  ],
};

export default lesson;
