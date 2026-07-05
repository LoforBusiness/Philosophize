import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-22',
  slug: 'reliabilism-and-the-value-of-knowledge',
  title: 'Why Is Knowledge Better Than Luck?',
  description: 'A true belief and knowledge get the same answer. So why prize knowledge?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A lucky guess and real knowledge can both be right.',
      subtext: 'So why do we value one and shrug at the other? They land on the same answer.',
      emoji: '🎯',
    },
    {
      type: 'example',
      title: 'Two Coffees',
      scenario:
        'Two cafés both serve you great coffee today. One has a master barista who reliably makes it well every morning. The other got lucky—the machine usually breaks, but today it happened to work. Same cup, same taste. Yet you would return only to the reliable café. Why? Because you want it again tomorrow.',
      emoji: '☕',
    },
    {
      type: 'concept',
      title: 'The Value Problem',
      body: 'A merely lucky true belief and genuine knowledge can give the identical answer. So why does knowledge seem more valuable? Plato asked this 2,400 years ago about the road to Larissa: a guide who knows the way and one who merely guesses right both get you there. Yet knowing still seems better.',
      visual: '🛤️',
      highlight: 'the value problem',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-22-1',
      quote: 'True opinions, as long as they remain, are a fine thing and do all sorts of good. But they refuse to stay long, and they escape from a man’s mind.',
      author: 'Plato (Socrates speaking)',
      era: 'c. 380 BCE',
      work: 'Meno',
    },
    {
      type: 'concept',
      title: 'Reliabilism',
      body: 'Reliabilists answer that knowledge comes from a reliable process—one that tends to produce truth across many cases, not just this once. A working eye, a sound calculation, an honest expert. The reliable café will get it right again tomorrow. Knowledge is valuable because the source keeps delivering.',
      visual: '⚙️',
      highlight: 'reliable process',
    },
    {
      type: 'reinforcement',
      callout: 'Remember the stopped clock from Gettier?',
      body: 'Earlier, a stopped clock showed the right time by accident. It was true and justified but not knowledge. Reliabilism explains why: a stopped clock is not a reliable process. It happened to be right once and will mislead you the rest of the day.',
      emoji: '🕒',
    },
    {
      type: 'question',
      prompt: 'Two people both believe it will rain today, and it does. Why might only one of them count as knowing?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'One read a reliable forecast; the other just felt lucky', isCorrect: true },
          { id: 'b', text: 'Only the one who feels more certain really knows', isCorrect: false },
          { id: 'c', text: 'Since both were right, both equally count as knowing', isCorrect: false },
          { id: 'd', text: 'Neither knows, because the future can never be known', isCorrect: false },
        ],
        explanation:
          'Option (c) is the tempting trap: it confuses being correct with knowing. Both got the true answer, but a coin flip can be correct too. Reliabilism asks about the process. The forecast-reader used a method that tends to track the truth; the lucky guesser did not. That difference—not the matching answer—is what knowledge adds.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Lucky belief and knowledge can match the answer',
        'The value problem: so why prize knowledge?',
        'Reliabilism: knowledge comes from truth-tracking processes',
        'A reliable source keeps delivering tomorrow',
      ],
      closingThought: 'Next time you are right, ask the harder question: would my method have been right again under slightly different luck?',
    },
  ],
};

export default lesson;
