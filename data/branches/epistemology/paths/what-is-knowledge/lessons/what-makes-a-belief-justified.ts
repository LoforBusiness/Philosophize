import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-8',
  slug: 'what-makes-a-belief-justified',
  title: 'What Makes a Belief Justified?',
  description: 'Every reason needs a reason. So where does the chain finally stop?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why believe that? And why believe THAT?',
      subtext: 'Ask "why" enough times and justification seems to run out of ground.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'The Regress Problem',
      body: 'Each belief leans on another belief for support. But that one needs support too. The reasons march backward forever — a regress. So what finally holds the whole chain up?',
      visual: '♾️',
      highlight: 'the regress problem',
    },
    {
      type: 'concept',
      title: 'Foundationalism',
      body: 'Foundationalists say the chain stops at basic beliefs that need no further proof — like "I am in pain" or simple logic. Everything else is built on top of this bedrock.',
      visual: '🧱',
      highlight: 'foundationalism',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-8-1',
      quote: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'William Kingdon Clifford',
      era: '1877',
      work: 'The Ethics of Belief',
    },
    {
      type: 'concept',
      title: 'Coherentism',
      body: 'Coherentists reject bedrock entirely. A belief is justified by fitting into a web of mutually supporting beliefs. No single foundation — strength comes from how well the whole net hangs together.',
      visual: '🕸️',
      highlight: 'coherentism',
    },
    {
      type: 'question',
      prompt: 'How does foundationalism answer the regress of reasons?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Some basic beliefs are self-supporting and end the chain', isCorrect: true },
          { id: 'b', text: 'The chain of reasons truly does go on forever', isCorrect: false },
          { id: 'c', text: 'Every belief is justified by the belief before it, circularly', isCorrect: false },
          { id: 'd', text: 'No belief is ever justified, so the question is empty', isCorrect: false },
        ],
        explanation: 'Foundationalism halts the regress at basic beliefs that need no further support, the bedrock the rest is built on.',
      },
    },
    {
      type: 'question',
      prompt: 'A friend says "My beliefs justify each other, so my chain of reasons is a loop." Is that automatically a fatal flaw?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — any circle of reasons is always worthless', isCorrect: false },
          { id: 'b', text: 'Yes — only a straight foundation can ever justify a belief', isCorrect: false },
          { id: 'c', text: 'Not necessarily — coherentists argue a wide, well-knit web can justify itself', isCorrect: true },
          { id: 'd', text: 'No — because all reasoning is secretly circular anyway', isCorrect: false },
        ],
        explanation: 'A tiny circle is empty, but coherentists hold that a large, tightly interlocking web of beliefs can support itself.',
      },
    },
    {
      type: 'summary',
      title: 'Where Reasons Rest',
      keyPoints: [
        'Reasons threaten to regress backward forever',
        'Foundationalism stops at self-supporting basic beliefs',
        'Coherentism trusts a web of mutual support',
        'Clifford demands evidence for what we believe',
      ],
      closingThought: 'Bedrock or web? Both try to answer one stubborn question: when is it finally okay to stop asking why?',
    },
  ],
};

export default lesson;
