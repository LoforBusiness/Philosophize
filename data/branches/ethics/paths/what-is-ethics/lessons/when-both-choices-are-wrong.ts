import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-9',
  slug: 'when-both-choices-are-wrong',
  title: 'When Both Choices Are Wrong',
  description: 'Genuine moral dilemmas, and the debt that survives choosing well.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Some choices leave a mark whichever way you go.',
      subtext: 'Not every hard decision has a right answer hidden inside it.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'A Hard Choice Is Not A Dilemma',
      body: 'A hard choice has a best answer you have to work out. A genuine dilemma has none — every road available breaks something you were right to care about. Choosing well does not make the broken thing whole.',
      visual: '🔀',
      highlight: 'No road is clean',
    },
    {
      type: 'example',
      title: "Sartre's Student",
      scenario: 'In 1940 a young man asked Sartre what to do. His brother had been killed by the Germans and he wanted to join the Free French. But his mother lived for him alone, and his leaving would destroy her. No theory ranked the two.',
      source: 'Sartre, Existentialism Is a Humanism',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-9',
      quote: 'No rule of general morality can show you what you ought to do: no signs are vouchsafed in this world.',
      author: 'Jean-Paul Sartre',
      era: '1946',
      work: 'Existentialism Is a Humanism',
      philosopherId: 'jean-paul-sartre',
    },
    {
      type: 'question',
      prompt: 'The student goes. Which claim is still owed an account?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The mother he left — that duty was real and went unmet', isCorrect: true },
          { id: 'b', text: 'The fight he joined — he must now justify the risk', isCorrect: false },
          { id: 'c', text: 'Neither — he weighed them and chose well', isCorrect: false },
          { id: 'd', text: 'Both equally, since he could not satisfy either fully', isCorrect: false },
        ],
        explanation: 'The trap is thinking a correct choice settles the account. It does not: the duty he could not meet was never cancelled, only outweighed, and it still has a claim on him.',
      },
    },
    {
      type: 'question',
      prompt: 'Bernard Williams says a man who walks away untroubled has missed something. What?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That a real duty went unmet, even though he chose rightly', isCorrect: true },
          { id: 'b', text: 'That he should have searched harder for a third option', isCorrect: false },
          { id: 'c', text: 'That feeling nothing proves the choice was wrong', isCorrect: false },
          { id: 'd', text: 'That guilt is the proper response to any hard choice', isCorrect: false },
        ],
        explanation: 'The trap: if choosing rightly cancelled the loss, regret would be irrational. Yet we distrust anyone untroubled by it. Williams called what survives moral residue.',
      },
    },
    {
      type: 'summary',
      title: 'Both Roads Cost Something',
      keyPoints: [
        'A dilemma offers no cost-free road',
        'Choosing well does not erase the loss',
        'What survives the choice is moral residue',
        'Regret can be the accurate response',
      ],
      closingThought: 'When a choice still hurts after you got it right, that is not weakness — it is accuracy.',
    },
  ],
};

export default lesson;
