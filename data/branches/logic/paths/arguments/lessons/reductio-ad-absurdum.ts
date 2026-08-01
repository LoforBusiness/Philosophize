import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-26',
  slug: 'reductio-ad-absurdum',
  title: 'Proof by Contradiction',
  description: 'The judo move of logic: assume your opponent is right, then watch it self-destruct.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Want to prove something true? Try assuming it\'s false.',
      subtext: 'If "false" leads to nonsense, "true" is all that\'s left. That\'s the oldest trick in mathematics.',
      emoji: '💥',
    },
    {
      type: 'concept',
      title: 'Reductio ad Absurdum',
      body: 'To prove a claim, assume the opposite is true. Follow that assumption with valid steps until it collapses into a contradiction or an absurdity. Since the reasoning was sound, the assumption must have been the problem — so the original claim stands.',
      visual: '♻️',
      highlight: 'collapses into contradiction',
    },
    {
      type: 'example',
      title: 'There Is No Largest Number',
      scenario: 'Suppose, for contradiction, that some number N is the largest of all. But then consider N + 1 — it\'s a number, and it\'s bigger than N. That contradicts N being the largest. The only faulty step was the assumption itself. So there is no largest number. We proved it by destroying its denial.',
      emoji: '♾️',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-26-1',
      quote: 'Reductio ad absurdum, which Euclid loved so much, is one of a mathematician\'s finest weapons.',
      author: 'G. H. Hardy',
      era: '1940',
      work: 'A Mathematician\'s Apology',
    },
    {
      type: 'question',
      prompt: 'In a reductio, you reach a contradiction from your assumption. What follows?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The assumption was false, so its opposite is true', isCorrect: true },
          { id: 'b', text: 'The whole argument is broken and proves nothing', isCorrect: false },
          { id: 'c', text: 'Both the assumption and its opposite are false', isCorrect: false },
          { id: 'd', text: 'You must restart with a different assumption', isCorrect: false },
        ],
        explanation: 'Reaching a contradiction feels like failure — that\'s the trap. But the contradiction is the goal: if valid steps led from your assumption to absurdity, the assumption is what must go, and its opposite is proven.',
      },
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered on the chain itself, and E37c requires the data to carry the
      // same two questions with the same correct answers.
      type: 'question',
      prompt: 'The chain of reasoning ends in an absurdity. What does that break?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The assumption at the top of the chain', isCorrect: true },
          { id: 'b', text: 'One of the middle steps, which must be flawed', isCorrect: false },
          { id: 'c', text: 'The rules of logic themselves', isCorrect: false },
          { id: 'd', text: 'Nothing — a contradiction just ends the attempt', isCorrect: false },
        ],
        explanation: 'Not the logic, and not a middle step — those were valid moves you would make again tomorrow. The only thing in the chain that was ever optional is the thing you assumed at the start.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met modus tollens.',
      body: 'Reductio is modus tollens in spirit: if assuming P forces a falsehood, then not-P. The Stoics\' "deny the consequent" and the mathematician\'s "prove by contradiction" are two faces of the same move — push a claim until it breaks.',
      emoji: '🔁',
    },
    {
      type: 'summary',
      title: 'Proof by Contradiction',
      keyPoints: [
        'Assume the opposite of what you want to prove',
        'Reason validly until it yields a contradiction',
        'The contradiction kills the assumption, not the logic',
        'Therefore the original claim must be true',
      ],
      closingThought: 'Sometimes the surest way forward is to walk the wrong road until it dead-ends.',
    },
  ],
};

export default lesson;
