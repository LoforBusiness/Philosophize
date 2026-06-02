import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Explore the classic philosophical definition of knowledge and why belief alone is never enough.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You believe a thousand things. But which of them do you truly know?',
      subtext: 'Philosophers drew a quiet, decisive line between believing and knowing.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'The Classic Definition of Knowledge',
      body: 'For centuries, philosophers held that knowledge is "justified true belief." To know, three things must align: the claim must be true, you must believe it, and you must hold good reasons — justification — for doing so. Belief alone drifts. Only truth and reason together let it stand.',
      visual: '🧠',
      highlight: 'justified true belief',
    },
    {
      type: 'concept',
      title: 'Why Belief Is Not Enough',
      body: 'Guess the next coin will land heads, and you may be right. But did you know? No. A true belief with nothing behind it is luck wearing the mask of insight. Knowledge asks more: reasons sturdy enough that being right was never an accident.',
      visual: '🪙',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'Plato Questions a Slave Boy',
      scenario: 'In Plato\'s Meno, Socrates draws geometry out of an untaught slave boy with nothing but careful questions. The boy reaches the right answer himself. Plato\'s point is quietly radical: knowledge is never simply poured into us. It is something we are led, step by step, to recognize within ourselves.',
      source: 'Plato, Meno (~380 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to the classic definition, which THREE things does genuine knowledge require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A belief that is true and held for good reasons', isCorrect: true },
          { id: 'b', text: 'A belief felt with great confidence and emotion', isCorrect: false },
          { id: 'c', text: 'A belief that most people happen to share', isCorrect: false },
          { id: 'd', text: 'Any belief that simply turns out to be correct', isCorrect: false },
        ],
        explanation: 'Justified true belief asks that the claim be true, that you believe it, and that good reasons hold it up. Conviction and popularity are not reasons — they only feel like them.',
      },
    },
    {
      type: 'question',
      prompt: 'Is a lucky guess that happens to be right the same as genuine knowledge?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A lucky guess may land on the truth, yet nothing in your mind earned it. Without reasons binding belief to truth, philosophers say you do not know — you simply got fortunate.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Remember: belief, on its own, is never quite knowledge.',
      body: 'A stopped clock is right twice a day. Glance at it in that lucky moment and your belief is true — yet built on nothing. You do not know the hour; chance handed it to you. Justification is the thread that separates knowing from happy accident.',
      emoji: '🕰️',
    },
    {
      type: 'summary',
      title: 'Knowing Apart From Believing',
      keyPoints: [
        'Knowledge weds three things: truth, belief, and reason',
        'A right guess with no reasons is not yet knowing',
        'Plato searched the nature of knowledge in the Meno',
        'Justification is the line between knowing and believing',
      ],
      closingThought: 'The next time the words "I know" rise to your lips, pause and ask: what, exactly, holds them up?',
    },
  ],
};

export default lesson;
