import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/endur1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-endurance-1',
  slug: 'proceed',
  title: 'Proceed',
  description: 'The Endurance at a Thames quay, the whaling station at Grytviken, and the ship frozen into the Weddell Sea pack, with telegrams, picks and the ship\'s log.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The Navy could have taken his ship. It wired one word.',
      subtext: 'August 1914: Shackleton sails for Antarctica as the war begins.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Change the plan, keep the goal',
      body: 'When the ice trapped the Endurance, Shackleton didn\'t rage or give up. He waited when the whalers warned him, then turned his stuck ship into a winter home. The goal of crossing Antarctica stayed the same. The plan bent to what the ice allowed, and the crew took their mood from his.',
      visual: '💡',
      highlight: 'adapting',
    },
    {
      type: 'question',
      prompt: 'The ice traps the ship before winter. What does Shackleton do?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Makes the ship a winter station and waits', isCorrect: true },
          { id: 'b', text: 'Keeps cutting at the ice all winter', isCorrect: false },
          { id: 'c', text: 'Abandons the ship and walks to land', isCorrect: false },
        ],
        explanation: 'He changed the plan and kept the goal. Cutting had already failed, and leaving a sound ship for open ice made no sense.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-endurance-1-1',
      quote: 'Within an hour I received a laconic wire from the Admiralty saying ‘Proceed.’',
      author: 'Ernest Shackleton',
      era: '1919',
      work: 'South (1919), Preface',
    },
    {
      type: 'summary',
      title: 'Proceed',
      keyPoints: [
        'Shackleton set out in 1914 to cross Antarctica on foot',
        'He offered his ship for the war, and was told to proceed',
        'Trapped in the ice, he changed the plan and kept the goal',
      ],
      closingThought: 'Now came the long polar night, with twenty-eight men to keep cheerful. That takes more than a plan.',
    },
  ],
};

export default lesson;
