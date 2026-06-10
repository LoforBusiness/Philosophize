import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-9',
  slug: 'what-is-truth',
  title: 'What Is Truth, Anyway?',
  description: 'Knowledge needs truth. But what does it mean for something to be true?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You want the truth. But what is truth?',
      subtext: 'Knowledge requires it, yet thinkers fiercely disagree on what "true" means.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Correspondence Theory',
      body: 'The oldest answer: a belief is true when it matches reality. "Snow is white" is true because snow really is white. Truth is the fit between words and the world.',
      visual: '🪞',
      highlight: 'correspondence',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-9-1',
      quote: 'To say of what is that it is, and of what is not that it is not, is true.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Metaphysics',
    },
    {
      type: 'concept',
      title: 'Coherence and Pragmatism',
      body: 'Rivals push back. Coherence theory: truth is fitting a consistent system of beliefs. Pragmatism, from Peirce and James: a belief is true if it works — if it reliably guides action.',
      visual: '🔧',
      highlight: 'coherence and pragmatism',
    },
    {
      type: 'example',
      title: 'The Useful and the True',
      scenario: 'James said the true is "what proves itself good in the way of belief." Critics object: a comforting lie can feel useful yet stay false. Pragmatists reply that, long run, only truth keeps working.',
      source: 'William James, Pragmatism (1907)',
      emoji: '🧪',
    },
    {
      type: 'question',
      prompt: 'According to the correspondence theory, what makes a belief true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It accurately matches the way the world actually is', isCorrect: true },
          { id: 'b', text: 'It feels deeply convincing to the person holding it', isCorrect: false },
          { id: 'c', text: 'A majority of people happen to agree with it', isCorrect: false },
          { id: 'd', text: 'It has never once been questioned or challenged', isCorrect: false },
        ],
        explanation: 'Correspondence ties truth to reality itself: a claim is true when it fits how things really are, not how they feel.',
      },
    },
    {
      type: 'question',
      prompt: 'The pragmatist says truth is what "works." So is any belief that feels useful automatically true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — if a belief is useful to you, that makes it true', isCorrect: false },
          { id: 'b', text: 'Yes — pragmatism means truth is simply personal opinion', isCorrect: false },
          { id: 'c', text: 'No — pragmatists mean what reliably works under inquiry over the long run, not mere comfort', isCorrect: true },
          { id: 'd', text: 'No — because pragmatists secretly accept only correspondence', isCorrect: false },
        ],
        explanation: 'Pragmatism means beliefs that hold up across rigorous inquiry, not whatever happens to feel pleasant or convenient.',
      },
    },
    {
      type: 'summary',
      title: 'Three Faces of Truth',
      keyPoints: [
        'Correspondence: truth matches reality',
        'Coherence: truth fits a consistent system',
        'Pragmatism: truth is what reliably works',
        'Knowledge needs truth, however we define it',
      ],
      closingThought: 'You cannot know something false. So every theory of knowledge quietly depends on a theory of truth.',
    },
  ],
};

export default lesson;
