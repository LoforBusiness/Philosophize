import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-7',
  slug: 'the-puzzle-of-time',
  title: 'What Is Time, Really?',
  description: 'You live in time every second, yet trying to define it slips your grip.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You know what time is — until someone asks.',
      subtext: 'Augustine noticed the catch sixteen centuries ago.',
      emoji: '⏳',
    },
    {
      type: 'concept',
      title: 'A Puzzle Inside the Obvious',
      body: 'The past is gone, the future is not yet, and the present has no width — the instant you name it, it has passed. So time seems made of pieces that do not exist.',
      visual: '🕰️',
      highlight: 'the present has no width',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-7-1',
      quote: 'What then is time? If no one asks me, I know; if I wish to explain it to one who asks, I know not.',
      author: 'Augustine of Hippo',
      era: 'c. 398 CE',
      work: 'Confessions, Book XI',
      philosopherId: 'augustine',
    },
    {
      type: 'example',
      title: 'Where Does the Present Live?',
      scenario: 'Augustine probed a sound. While it rings, part is already past, part still to come. We measure time, he said, not in things outside us but as a stretching of the mind across memory and expectation.',
      emoji: '🔔',
      source: 'Augustine, Confessions, Book XI (c. 398 CE)',
    },
    {
      type: 'concept',
      title: 'Does Time Flow, or Just Sit There?',
      body: 'Two camps split the question. The A-theory says past, present, and future are real and time genuinely flows. The B-theory says all moments exist equally, and "now" is just where you stand.',
      visual: '🌊',
      highlight: 'A-theory versus B-theory',
    },
    {
      type: 'question',
      prompt: 'Why did Augustine find the present moment so hard to pin down?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Clocks in his day were too crude', isCorrect: false },
          { id: 'b', text: 'The instant has no duration — name it, and it has already slipped away', isCorrect: true },
          { id: 'c', text: 'He believed only the future was real', isCorrect: false },
          { id: 'd', text: 'Time runs differently for different people', isCorrect: false },
        ],
        explanation: 'For Augustine the present shrinks to a durationless point: the moment you grasp it, it is past — so the "now" we live in resists being held still.',
      },
    },
    {
      type: 'question',
      prompt: 'Physics shows clocks tick slower when you move fast. So science has fully explained what time is, right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — relativity settled the nature of time', isCorrect: false },
          { id: 'b', text: 'Yes — time is simply what clocks measure', isCorrect: false },
          { id: 'c', text: 'No — relativity describes how time behaves, not why it flows or what "now" is', isCorrect: true },
          { id: 'd', text: 'No — because relativity has never been tested', isCorrect: false },
        ],
        explanation: 'Relativity precisely describes time\'s behaviour, but the metaphysical questions — whether time truly flows and what makes a moment "present" — lie beyond what the equations decide.',
      },
    },
    {
      type: 'summary',
      title: 'Time Hides in Plain Sight',
      keyPoints: [
        'Past gone, future not yet, present vanishing',
        'Augustine: easy to live, hard to define',
        'Time may be a stretching of the mind',
        'A-theory flows; B-theory sits still',
      ],
      closingThought: 'You swim in time every waking second — and still cannot say quite what you are swimming in.',
    },
  ],
};

export default lesson;
