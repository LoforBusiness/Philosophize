import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-41',
  slug: 'is-space-a-thing',
  title: 'Is Space a Thing, or Just Distance?',
  description: 'Move the entire universe three feet east. Newton says something happened. Leibniz says you have described the same world twice.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Shift everything three feet east.',
      subtext: 'Everything, at once. Did anything change?',
      emoji: '📐',
    },
    {
      type: 'concept',
      title: 'A Container, or an Arrangement',
      body: 'Newton took space to be a real thing that would still be there with nothing in it, like an empty room. Leibniz took it to be nothing but the arrangement of things — no things, no space. The two agree about every measurement anyone has ever made.',
      visual: '🧭',
      highlight: 'no things, no space',
    },
    {
      type: 'example',
      title: 'The Shifted World',
      scenario: 'Imagine God had built the whole universe three feet further east, and everything else the same. On Newton\'s account that is a different world. On Leibniz\'s there is nothing there to be different: every distance between every pair of things is untouched.',
      source: 'the Leibniz-Clarke correspondence, 1715',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-41',
      quote: 'I hold space to be something merely relative, as time is; I hold it to be an order of coexistences, as time is an order of successions.',
      author: 'Gottfried Leibniz',
      era: '1716',
      philosopherId: 'gottfried-leibniz',
    },
    {
      type: 'question',
      prompt: 'Which step does Leibniz use to rule the shifted world out?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'There would be no reason to build one rather than the other', isCorrect: true },
          { id: 'b', text: 'Nothing could ever tell the two apart', isCorrect: false },
          { id: 'c', text: 'Space would then have to be infinite', isCorrect: false },
          { id: 'd', text: 'Three feet is too small a distance to matter', isCorrect: false },
        ],
        explanation: 'The missing reason. Leibniz holds that nothing happens without one, and a choice between two identical options has none to give — so there was never a choice to make. Undetectability alone is weaker: plenty of real things go undetected, which is why he needs the stronger principle.',
      },
    },
    {
      type: 'question',
      prompt: 'So what is shifting the whole universe three feet east?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The same world described twice', isCorrect: true },
          { id: 'b', text: 'A real change that nobody could detect', isCorrect: false },
          { id: 'c', text: 'A question with no answer either way', isCorrect: false },
          { id: 'd', text: 'Impossible, because space cannot move', isCorrect: false },
        ],
        explanation: 'One world, twice. If space is the arrangement, the arrangement came along and nothing was left behind to have moved against. Newton\'s reply is the spinning bucket: the water climbs the wall, and it is hard to say what it is turning relative to if not space itself.',
      },
    },
    {
      type: 'summary',
      title: 'The Order of Things',
      keyPoints: [
        'Newton made space a container that could be empty',
        'Leibniz made it the order of things that exist',
        'A shifted universe distinguishes the two accounts',
        'Rotation is the hard case Leibniz still had to answer',
      ],
      closingThought: 'Physics eventually took the relational side, and then complicated it. The argument was settled by measurement, but only after the question had been asked properly.',
    },
  ],
};

export default lesson;
