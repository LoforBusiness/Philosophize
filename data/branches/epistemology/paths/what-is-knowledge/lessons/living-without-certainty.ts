import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-10',
  slug: 'living-without-certainty',
  title: 'Can You Know Without Being Certain?',
  description: 'Fallibilism: how to hold knowledge firmly while admitting you might be wrong.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You might be wrong. Can you still know?',
      subtext: 'After all the doubt and debate, here is where the journey lands.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Fallibilism',
      body: 'Fallibilism says knowledge does not require certainty. You can genuinely know something while admitting you could, in principle, be mistaken. Knowing and doubting can live together.',
      visual: '⚖️',
      highlight: 'fallibilism',
    },
    {
      type: 'concept',
      title: 'Why It Helps',
      body: 'Science never claims final proof, yet clearly knows much. Fallibilism explains how: claims stay open to revision. Being correctable is a strength, not a confession of ignorance.',
      visual: '🔬',
      highlight: 'open to revision',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-10-1',
      quote: 'To teach how to live without certainty, and yet without being paralyzed by hesitation, is perhaps the chief thing philosophy can do.',
      author: 'Bertrand Russell',
      era: '1945',
      work: 'A History of Western Philosophy',
    },
    {
      type: 'reinforcement',
      callout: 'Recall where we began.',
      body: 'Socrates claimed wisdom only in knowing he did not know. Fallibilism is that humility, matured: hold your beliefs firmly, but never so tightly that evidence can never pry them loose.',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'What does fallibilism claim about knowledge and certainty?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'You can know something even though you might possibly be wrong', isCorrect: true },
          { id: 'b', text: 'Only absolutely certain beliefs can ever count as knowledge', isCorrect: false },
          { id: 'c', text: 'Since we lack certainty, we know nothing at all', isCorrect: false },
          { id: 'd', text: 'Certainty and knowledge mean exactly the same thing', isCorrect: false },
        ],
        explanation: 'Fallibilism separates knowing from certainty: a belief can be knowledge while still being open to future correction.',
      },
    },
    {
      type: 'question',
      prompt: 'If a fallibilist admits "I might be wrong about this," does that mean they do not really believe it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — admitting you could be wrong cancels the belief', isCorrect: false },
          { id: 'b', text: 'Yes — real belief demands total, doubt-free certainty', isCorrect: false },
          { id: 'c', text: 'No — you can firmly believe and act on a claim while staying open to revising it', isCorrect: true },
          { id: 'd', text: 'No — because fallibilists never actually believe anything', isCorrect: false },
        ],
        explanation: 'Acknowledging possible error is not doubt of the belief; you can commit fully while keeping the door open to evidence.',
      },
    },
    {
      type: 'summary',
      title: 'Knowing With Humility',
      keyPoints: [
        'Fallibilism: knowledge without absolute certainty',
        'Beliefs stay open to revision by evidence',
        'Science thrives on being correctable',
        'Socratic humility, grown wise and usable',
      ],
      closingThought: 'You have circled the whole question of knowledge. The lasting lesson: know boldly, doubt honestly, and never stop asking how you know.',
    },
  ],
};

export default lesson;
