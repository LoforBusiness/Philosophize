import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-39',
  slug: 'the-rule-that-breaks-itself',
  title: 'The Rule That Breaks Itself',
  description: 'Some claims fail the moment you hold them to their own standard. Learn to spot the ones that saw through the plank they are sitting on.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Hold the claim to its own standard.',
      subtext: 'Some of them do not survive it.',
      emoji: '🪚',
    },
    {
      type: 'concept',
      title: 'Self-Refutation',
      body: 'A claim about all claims includes itself. So apply it to itself and see what happens. If it convicts itself, you have not been out-argued — the sentence did the work for you, and nobody has to agree on anything else first.',
      visual: '🔁',
      highlight: 'A claim about all claims includes itself',
    },
    {
      type: 'example',
      title: 'Nothing Can Be Proved',
      scenario: 'Say it and you have made a claim. A claim invites the question: can you prove it? If you can, then something can be proved and the sentence is false. If you cannot, you are asking to be believed on nothing. There is no third road, and no outside evidence was needed to close it.',
      source: 'the ancient turning-round, Plato, Theaetetus 171a',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-39',
      quote: 'Such a man, as such, is from the start no better than a vegetable.',
      author: 'Aristotle',
      era: 'c. 350 BC',
    },
    {
      type: 'question',
      prompt: 'Which claim cannot survive its own test?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nothing can be proved', isCorrect: true },
          { id: 'b', text: 'Every event has a cause', isCorrect: false },
          { id: 'c', text: 'Some claims are false', isCorrect: false },
          { id: 'd', text: 'The sky is green', isCorrect: false },
        ],
        explanation: 'Only the first is a claim about claims, so only it lands inside its own scope. Every event has a cause is about events, not sentences. Some claims are false survives happily, since it is one. And the sky is green is simply untrue, which is a different fault altogether.',
      },
    },
    {
      type: 'question',
      prompt: 'A claim fails its own test. What follows?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is false, and no other evidence is needed', isCorrect: true },
          { id: 'b', text: 'It is meaningless and says nothing at all', isCorrect: false },
          { id: 'c', text: 'It holds, so long as it exempts itself', isCorrect: false },
          { id: 'd', text: 'Nothing — no claim can judge itself', isCorrect: false },
        ],
        explanation: 'It is false. That is the whole force of the move: you needed no data and no shared premise, only the sentence. Exempting it is available but expensive, because a rule with its own name written on the exception is a rule nobody else has to accept.',
      },
    },
    {
      type: 'summary',
      title: 'Turning It Round',
      keyPoints: [
        'A claim about all claims covers itself',
        'Apply it to itself and read the result',
        'Convicting itself makes it false, cheaply',
        'The escape is an exception, and it costs',
      ],
      closingThought: 'It is the shortest refutation there is: no evidence, no shared ground, just the sentence held up to its own light. Try it on the next sweeping claim you meet.',
    },
  ],
};

export default lesson;
