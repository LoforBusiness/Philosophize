import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'premises-and-conclusions',
  title: 'Premises & Conclusions',
  description: 'Learn to identify what\'s supporting what in any argument you encounter.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every argument hides a structure. Can you find it?',
      subtext: 'Once you can spot premises and conclusions, you\'ll see arguments everywhere.',
      emoji: '🔍',
    },
    {
      type: 'concept',
      title: 'The Premise',
      body: 'A premise is any statement offered as evidence or a reason. Premises are the foundation of the argument — they\'re what the conclusion rests on. Look for words like "because," "since," and "given that."',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'The Conclusion',
      body: 'The conclusion is the statement the argument is trying to prove. It\'s what all the premises are pointing toward. Look for words like "therefore," "so," "thus," and "hence."',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'Spotting the Structure',
      scenario: '"Since it rained all night, the ground must be wet."\n\nPremise: It rained all night.\nConclusion: The ground is wet.\n\nThe word "since" signals the premise, and "must be" points to the conclusion.',
      emoji: '🌧️',
    },
    {
      type: 'question',
      prompt: 'In "Therefore, you should study philosophy," what does "therefore" signal?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A conclusion is coming', isCorrect: true },
          { id: 'b', text: 'A premise is coming', isCorrect: false },
          { id: 'c', text: 'An example is coming', isCorrect: false },
          { id: 'd', text: 'A contradiction is coming', isCorrect: false },
        ],
        explanation: '"Therefore" is a conclusion indicator — it tells you the argument is about to make its main claim.',
      },
    },
    {
      type: 'question',
      prompt: '"Because logic is useful, you should study it." Which is the premise?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Logic is useful', isCorrect: true },
          { id: 'b', text: 'You should study logic', isCorrect: false },
          { id: 'c', text: 'Both are premises', isCorrect: false },
          { id: 'd', text: 'Neither is a premise', isCorrect: false },
        ],
        explanation: '"Logic is useful" is the reason (premise). "You should study it" is the claim being supported (conclusion). The word "because" signals the premise.',
      },
    },
    {
      type: 'summary',
      title: 'Structure Mastered',
      keyPoints: [
        '"Because / since / given that" → premise',
        '"Therefore / thus / hence" → conclusion',
        'Premises support the conclusion',
        'Every argument has this hidden structure',
      ],
      closingThought: 'Spot the structure, and you\'ll never be fooled by a bad argument again.',
    },
  ],
};

export default lesson;
