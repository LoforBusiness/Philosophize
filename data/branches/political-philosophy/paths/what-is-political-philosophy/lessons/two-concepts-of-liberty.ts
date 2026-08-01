import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-12',
  slug: 'two-concepts-of-liberty',
  title: 'Two Kinds Of Freedom',
  description: 'Freedom from interference, or freedom to become your true self? Berlin says they can clash.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'They forced you to be free. Does that sentence make sense?',
      subtext: 'Isaiah Berlin thought it could become the most dangerous sentence in politics.',
      emoji: '🔓',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw freedom split into "freedom from" and "freedom to."',
      body: 'In Freedom vs. Control you met negative liberty (no one blocks your way) and positive liberty (you master yourself). Berlin gave them precise names for a reason: he thought these two freedoms could turn and fight each other.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: How Wide Is My Door?',
      body: 'Negative liberty asks one question: how many doors are open, with no one slamming them shut? It measures freedom by the absence of obstacles others place in your path. The more choices left untouched, the freer you are.',
      visual: '🚪',
      highlight: 'absence of obstacles',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Who Is My Master?',
      body: 'Positive liberty asks a different question: who really steers your life? To be free is to be your own master, ruled by your reason, not your fears or addictions. The danger: someone may claim to know your "true" self better than you do.',
      visual: '👑',
      highlight: 'self-mastery',
    },
    {
      type: 'example',
      title: 'When "For Your Own Good" Turns Into a Cage',
      scenario: 'A regime announces that your real, rational self wants its plan. You disagree? That is just your lower, confused self talking. So it overrides your actual choices to liberate the "true" you. You wanted to walk out the door; they locked it, and called the locking freedom.',
      source: 'Isaiah Berlin, Two Concepts of Liberty (1958)',
      emoji: '⛓️',
    },
    {
      type: 'quote',
      id: 'lq-political-political-12-1',
      quote: "The 'positive' sense of the word 'liberty' derives from the wish on the part of the individual to be his own master.",
      author: 'Isaiah Berlin',
      era: '1958',
      work: 'Two Concepts of Liberty',
      philosopherId: 'isaiah-berlin',
    },
    {
      type: 'question',
      prompt: 'Which kind of freedom is each complaint about?',
      xpValue: 5,
      interaction: {
        type: 'two-camps',
        leftLabel: 'Negative',
        rightLabel: 'Positive',
        items: [
          { id: 'i1', text: 'No law stops me, but I cannot afford to go.', side: 'right' },
          { id: 'i2', text: 'A guard turns me back at the gate.', side: 'left' },
          { id: 'i3', text: 'I am free to choose, but too addicted to choose well.', side: 'right' },
          { id: 'i4', text: 'The law forbids me from saying it.', side: 'left' },
        ],
        explanation: 'Negative liberty asks who is standing in your way; positive liberty asks whether you are actually master of yourself. That is why they can pull apart — and why Berlin worried. A state can expand your "true" self-mastery while removing the choices you would have made.',
      },
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered under the doorway, and E37c requires the data to carry the same
      // two questions with the same correct answers.
      type: 'question',
      prompt: 'The door is wide open and you still cannot choose. Which claim to freedom is false?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That you are master of yourself', isCorrect: true },
          { id: 'b', text: 'That nobody is blocking your way', isCorrect: false },
          { id: 'c', text: 'Both of them are false here', isCorrect: false },
          { id: 'd', text: 'Neither — an open door is all freedom requires', isCorrect: false },
        ],
        explanation: 'Negative liberty is honestly satisfied: the doorway is clear. Self-mastery is the one being claimed on your behalf, and that is exactly what Berlin warns cannot be switched on for you by someone else.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Negative liberty: the absence of obstacles from others',
        'Positive liberty: being your own master',
        'Berlin warned the two can openly conflict',
        '"Forcing people to be free" can mask coercion',
      ],
      closingThought: 'Whenever someone overrides your choice "for your real freedom," ask: whose self are they serving?',
    },
  ],
};

export default lesson;
