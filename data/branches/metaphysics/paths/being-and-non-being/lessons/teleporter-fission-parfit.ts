import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-13',
  slug: 'teleporter-fission-parfit',
  title: 'The Teleporter Problem',
  description: 'A machine copies you on Mars and destroys the original. Did you travel, or die?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You step in on Earth. Someone steps out on Mars.',
      subtext: 'Same memories, same scar, same fear of spiders. Is it you?',
      emoji: '🛰️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw Locke locate the self in memory.',
      body: 'Lessons 11–12 said you persist through psychological continuity — the chain of memories and intentions linking each day to the next. That felt safe. Now a machine will copy that chain perfectly. If continuity is all there is, copying it should be enough.',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'The Teleporter',
      body: 'A scanner records every atom, beams the data to Mars, builds a perfect replica, then vaporizes the original. The replica remembers stepping in. It feels continuous. Did you survive the trip — or did you die on Earth while a stranger inherited your life?',
      visual: '⚡',
      highlight: 'perfect replica',
    },
    {
      type: 'example',
      title: 'Now the Machine Malfunctions',
      scenario: 'The scanner forgets to destroy the original. You walk out of the booth on Earth, unharmed. At the same instant, an equally continuous you walks out on Mars. Two people, each with your full past, each certain they are you. The chain of continuity has branched in two.',
      emoji: '🌓',
    },
    {
      type: 'concept',
      title: 'Fission Breaks Identity',
      body: 'Identity is one-to-one: a thing can only be identical to one thing. But continuity can branch. If both Martians are equally continuous with you, neither can be uniquely you — yet nothing about survival was lost. Parfit concludes: maybe identity is not what matters.',
      visual: '🪞',
      highlight: 'one-to-one',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-13-1',
      quote: 'Personal identity is not what matters.',
      author: 'Derek Parfit',
      era: '1984',
      work: 'Reasons and Persons',
      philosopherId: 'derek-parfit',
    },
    {
      type: 'question',
      prompt: 'Judge this claim: "In Parfit\'s fission case, exactly one of the two people must be the real you."',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. The tempting answer assumes identity must be all-or-nothing — that one survivor has to be the "real" you. But both branches are equally continuous; nothing picks a winner. Parfit argues the question "which one is really me?" is empty. What both share — psychological continuity — is what actually matters.',
      },
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-13-2',
      quote: 'My death will break the more direct relations between my present experiences and future experiences, but it will not break various other relations.',
      author: 'Derek Parfit',
      era: '1984',
      work: 'Reasons and Persons',
      philosopherId: 'derek-parfit',
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered at the fork, and E37c requires the data to carry the same two
      // questions with the same correct answers.
      type: 'question',
      prompt: 'Continuity went two ways at the fork. What is it that could not?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Identity — a thing can only be identical to one thing', isCorrect: true },
          { id: 'b', text: 'Continuity, which is why only one survivor is really you', isCorrect: false },
          { id: 'c', text: 'Memory, since only one of them holds the originals', isCorrect: false },
          { id: 'd', text: 'Nothing — both branches are simply you, twice over', isCorrect: false },
        ],
        explanation: 'Continuity survived twice over, which is precisely the trouble. Identity is the relation that cannot branch, and that mismatch is what makes "which one is really me?" unanswerable.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Teleporter: a perfect copy may not be you',
        'Fission: continuity can branch, identity cannot',
        'Parfit — identity is not what matters; survival does',
        'Hume and the Buddha gain force from this',
      ],
      closingThought: 'If you can split in two and lose nothing that matters, perhaps the unified "self" Locke defended was a convenient fiction all along.',
    },
  ],
};

export default lesson;
