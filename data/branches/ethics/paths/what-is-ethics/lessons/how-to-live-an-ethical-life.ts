import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-30',
  slug: 'how-to-live-an-ethical-life',
  title: 'Putting It All Together',
  description: 'Outcomes, duties, character — three lenses on one life. How do you actually use them?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You have met the great theories. Now: how do you live?',
      subtext: 'Not by picking one and forgetting the rest, but by knowing which lens fits which moment.',
      emoji: '🧭',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met three rival lenses.',
      body: 'Consequentialism judges acts by outcomes. Deontology judges by duties and rules, treating people as ends. Virtue ethics asks what a person of good character would do. You explored each in depth. Now we ask how they work together in a real life.',
      emoji: '🔭',
    },
    {
      type: 'concept',
      title: 'Three Questions, Not Three Camps',
      body: 'Treat the theories as questions to ask, not tribes to join. What are the likely consequences? What rules and rights are at stake? What would a person of good character do, and who am I becoming by choosing this? A wise decision usually survives all three tests, not just one.',
      visual: '❓',
      highlight: 'questions, not camps',
    },
    {
      type: 'example',
      title: 'One Hard Choice, Three Lenses',
      scenario: 'You discover a colleague is quietly cheating customers. The consequentialist in you weighs the harm of staying silent against the fallout of speaking up. The deontologist asks about honesty and your duty not to be complicit. The virtue ethicist asks what an honest, courageous person would do — and what staying silent would make you. Often the lenses converge; when they don’t, you must judge.',
      emoji: '🤔',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-30-1',
      quote: 'Moral excellence comes about as a result of habit. We become just by doing just acts, temperate by doing temperate acts, brave by doing brave acts.',
      author: 'Aristotle',
      era: 'c. 340 BCE',
      work: 'Nicomachean Ethics',
      philosopherId: 'aristotle',
    },
    {
      type: 'concept',
      title: 'Ethics Is A Practice',
      body: 'Theory sharpens judgment, but living well is a skill built by habit, like Aristotle said. Notice the moral choices hidden in ordinary days. Use the lenses to think more clearly. Stay humble — even careful people get it wrong. And let your reasons and your conscience keep correcting each other.',
      visual: '🌱',
      highlight: 'a skill built by habit',
    },
    {
      type: 'question',
      prompt: 'Which best captures the mature way to use the three ethical theories?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Pick the one true theory and apply it mechanically to every case', isCorrect: false },
          { id: 'b', text: 'Use each as a lens that surfaces different morally relevant features of a choice', isCorrect: true },
          { id: 'c', text: 'Ignore theory entirely and just trust your gut', isCorrect: false },
          { id: 'd', text: 'Use whichever theory justifies what you already wanted to do', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it promises certainty by crowning one theory and switching off judgment. But each lens reveals something the others can miss — consequences, duties, character. Reducing ethics to a single formula throws away that information. And Option D names the real danger: motivated reasoning, picking a theory to rubber-stamp your wish. Maturity is using all three honestly to think harder, not to excuse yourself.',
      },
    },
    {
      type: 'question',
      prompt: 'The three lenses point three different ways and no formula breaks the tie. What now?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Weigh them and own the judgement', isCorrect: true },
          { id: 'b', text: 'Follow whichever rule is strictest', isCorrect: false },
          { id: 'c', text: 'Pick the lens that suits your wish', isCorrect: false },
          { id: 'd', text: 'Treat every answer as equally good', isCorrect: false },
        ],
        explanation: 'Weigh them, and own it. Aristotle called the skill practical wisdom, and it cannot be reduced to a rule because the rules are what have collided. Defaulting to the strictest looks like rigour and is a way of not deciding, and a hard case does not make every answer equal.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Treat theories as lenses, not rival tribes',
        'Ask: outcomes, duties, and character',
        'Living well is a habit-built skill',
        'When lenses clash, weigh and own the judgment',
      ],
      closingThought: 'You came asking what is right. You leave with something better: the tools to keep asking well.',
    },
  ],
};

export default lesson;
