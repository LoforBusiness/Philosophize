import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-21',
  slug: 'can-you-choose-a-belief',
  title: 'Try To Believe It Is Raining',
  description: 'Belief answers to evidence, not to effort — and what follows from that.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Right now, believe it is raining. Not pretend. Believe.',
      subtext: 'You cannot, and noticing why tells you what belief is.',
      emoji: '🌧️',
    },
    {
      type: 'concept',
      title: 'Belief Is Not A Decision',
      body: 'You can decide to stand up, or to say something false. You cannot decide to believe something you take to be untrue. Belief aims at truth, so it answers to evidence — and wanting is not evidence.',
      visual: '🎯',
      highlight: 'Aiming at truth, not at wanting',
    },
    {
      type: 'example',
      title: 'The Offer',
      scenario: 'Someone offers you a fortune to believe, sincerely and right now, that the room is underwater. The money is real and you want it badly. You can say the words, plan around them, even hope. The belief does not arrive.',
      source: 'After Bernard Williams, Deciding to Believe',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-21',
      quote: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'William Kingdon Clifford',
      era: '1877',
      work: 'The Ethics of Belief',
    },
    {
      type: 'question',
      prompt: 'The prize is enormous and you are trying hard. What moves the needle?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Evidence — effort and wanting do nothing on their own', isCorrect: true },
          { id: 'b', text: 'Wanting it enough, if the stakes are high enough', isCorrect: false },
          { id: 'c', text: 'Sheer repetition, which becomes belief eventually', isCorrect: false },
          { id: 'd', text: 'Deciding, exactly as you decide to stand up', isCorrect: false },
        ],
        explanation: 'The trap is that trying feels like it should work, because it works for almost everything else you do. Belief is the odd case: it tracks how things seem, not how much you would like them to be.',
      },
    },
    {
      type: 'question',
      prompt: 'So is what you believe entirely out of your hands?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — you choose what evidence you go and stand in front of', isCorrect: true },
          { id: 'b', text: 'Yes — belief is involuntary, so nothing you do matters', isCorrect: false },
          { id: 'c', text: 'No — with enough discipline you can simply decide', isCorrect: false },
          { id: 'd', text: 'Yes, and that makes Clifford’s demand meaningless', isCorrect: false },
        ],
        explanation: 'The trap: "involuntary" sliding into "not my responsibility". Pascal saw the way out — you cannot will a belief, but you can choose the company, habits and reading that decide what reaches you.',
      },
    },
    {
      type: 'summary',
      title: 'You Steer It Sideways',
      keyPoints: [
        'You cannot believe something at will',
        'Belief answers to evidence, not to wanting',
        'You do choose what evidence you meet',
        'That is where the responsibility lives',
      ],
      closingThought: 'Nobody chooses a belief directly. Everybody chooses what they read.',
    },
  ],
};

export default lesson;
