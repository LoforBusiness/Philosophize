import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-1',
  slug: 'why-things-feel-beautiful',
  title: 'Why Things Feel Beautiful',
  description: 'Beauty hits as a feeling — yet we demand others feel it too. Why?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why does a sunset feel beautiful?',
      subtext: 'It strikes you in a heartbeat. Defining it could take a lifetime.',
      emoji: '🌅',
    },
    {
      type: 'concept',
      title: 'Disinterested Pleasure',
      body: 'Aesthetics is the philosophy of beauty and art. In his Critique of the Power of Judgment, Immanuel Kant found beauty strange: it pleases without you wanting anything from the object. You crave food because hunger drives you. The sunset feeds no hunger — you simply savor its look. Kant calls this "disinterested" pleasure: not bored, but indifferent to the object\'s use or even its existence.',
      visual: '✨',
      highlight: 'disinterested pleasure',
    },
    {
      type: 'concept',
      title: 'The Riddle of Taste',
      body: 'David Hume raised a paradox to wrestle it down. He admits beauty "exists merely in the mind" — yet we still rank a master above a clumsy hack and feel we are right. His answer was not pure opinion: a standard set by true critics whose verdicts, refined by practice and surviving the test of time, slowly converge.',
      visual: '🎭',
      highlight: 'standard of taste',
    },
    {
      type: 'example',
      title: 'The Antinomy of Taste',
      scenario: 'Kant named a contradiction the "antinomy of taste." Side one: there is no disputing taste, since beauty rests on feeling, not proof. Side two: we contend about it constantly, insisting a great symphony truly is beautiful. Both hold, Kant says — a judgment of taste is felt, never provable by rules, yet it speaks "with a universal voice," as if binding everyone.',
      source: 'Immanuel Kant, Critique of the Power of Judgment (1790)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to Kant, what makes aesthetic pleasure different from the pleasure of eating?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is disinterested — indifferent to the object\'s use or existence', isCorrect: true },
          { id: 'b', text: 'It lasts longer than bodily pleasure', isCorrect: false },
          { id: 'c', text: 'It applies only to visual art', isCorrect: false },
          { id: 'd', text: 'It can only be felt after formal training', isCorrect: false },
        ],
        explanation: 'For Kant, aesthetic pleasure is "disinterested" — it does not depend on any desire for the object and is indifferent to its usefulness or existence. That freedom from interest is exactly what separates beauty from the pleasure of eating, which gratifies the senses and feeds a need.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Beauty speaks as if it commands.',
      body: 'Here is the engine of aesthetics. You rarely stop at "I like this." You say "this is beautiful" — as if beauty were a property of the thing, not just your mood. Kant called this "subjective universal validity": rooted in feeling, yet quietly demanding that everyone agree, even though no concept or proof can settle it.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'When you call something beautiful, you are claiming others should agree. True or false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held that judgments of taste claim "universal validity": you judge not just for yourself but as if for everyone. Unlike private liking, they reach out and ask all to agree — yet, resting on feeling rather than concepts, no argument can force that agreement.',
      },
    },
    {
      type: 'summary',
      title: 'Beauty: Personal Yet Universal',
      keyPoints: [
        'Kant: aesthetic pleasure is disinterested, free of desire',
        'Hume: a standard of taste set by true critics over time',
        'Beauty is felt, yet claims to speak for everyone',
      ],
      closingThought: 'Aesthetics asks what beauty is — and why a feeling dares to speak for us all.',
    },
  ],
};

export default lesson;
