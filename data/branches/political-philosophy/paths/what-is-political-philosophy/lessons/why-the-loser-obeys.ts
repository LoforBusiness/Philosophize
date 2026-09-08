import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-39',
  slug: 'why-the-loser-obeys',
  title: 'Why the Loser Obeys',
  description: 'You voted against it and it passed anyway. Something has to explain why you are now bound by it, and outnumbered is not an argument.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Sixty said yes. You were one of the forty.',
      subtext: 'Why is it binding on you?',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Authority and Power',
      body: 'Power is being able to make you comply. Authority is having a claim on you that you should recognise even when nobody is watching. A majority always has the first. Democratic theory is the long argument about whether it has the second.',
      visual: '🏛️',
      highlight: 'a claim on you that you should recognise',
    },
    {
      type: 'example',
      title: 'Three Answers',
      scenario: 'One: you agreed to the procedure, so you are bound by what it produces. Two: you had the same say as everybody else, and a fair loss is still a loss. Three: on questions with a right answer, a large group is more often right than any one member of it. Each answer is worth something, and none survives every case.',
      source: 'consent, fairness and the wisdom of numbers',
    },
    {
      type: 'quote',
      id: 'lq-political-political-39',
      quote: 'The body should move that way whither the greater force carries it, which is the consent of the majority.',
      author: 'John Locke',
      era: '1689',
      philosopherId: 'john-locke',
    },
    {
      type: 'question',
      prompt: 'Which of these is not a reason to obey at all?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They have more people, so they can make you', isCorrect: true },
          { id: 'b', text: 'You agreed to decide things this way', isCorrect: false },
          { id: 'c', text: 'You had exactly the say everybody else had', isCorrect: false },
          { id: 'd', text: 'A large group is more often right than one person', isCorrect: false },
        ],
        explanation: 'Being outnumbered is a fact about force, and force explains why you will comply rather than why you should. The other three at least try to give you a reason you could accept while alone in a room with nobody watching.',
      },
    },
    {
      type: 'question',
      prompt: 'What happens to that duty as a law becomes unjust?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It holds for a long way, and then gives out', isCorrect: true },
          { id: 'b', text: 'It never weakens — a vote is a vote', isCorrect: false },
          { id: 'c', text: 'It was never there in the first place', isCorrect: false },
          { id: 'd', text: 'It grows stronger the worse the law is', isCorrect: false },
        ],
        explanation: 'Almost everybody draws a curve that stays high and then falls off a cliff. A flat line makes every atrocity binding on its victims; a floor of zero makes losing an election optional. Where the cliff sits is the real disagreement.',
      },
    },
    {
      type: 'summary',
      title: 'Outvoted, and Still Bound',
      keyPoints: [
        'Power makes you comply; authority gives you a reason',
        'Consent, fairness and numbers are the three offers',
        'Being outnumbered is not one of them',
        'The duty holds a long way and then gives out',
      ],
      closingThought: 'The interesting question is never whether there is a limit. It is where you put it, and whether you would accept the same limit when your own side is the sixty.',
    },
  ],
};

export default lesson;
