import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-37',
  slug: 'why-a-promise-binds',
  title: 'Why a Promise Binds',
  description: 'You said four words. Now you have to do something you would rather not.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Say "I promise" and an obligation appears from nowhere.',
      subtext: 'Where did it come from?',
      emoji: '🤝',
    },
    {
      type: 'concept',
      title: 'Hume\'s Puzzle',
      body: 'Making a promise is uttering a form of words. Yet afterwards you must do the thing, and before you said it you need not have. Hume called this the most mysterious operation in morals: a sound that creates a duty.',
      visual: '🗝️',
      highlight: 'a sound that creates a duty',
    },
    {
      type: 'example',
      title: 'Two Repairs',
      scenario: 'One answer: keeping promises is a useful practice, so it survives because it pays. Another, from Scanlon: the wrong is to the person who relied on you. They arranged their life around your word, and you left them there.',
      source: 'Scanlon, "What We Owe to Each Other" (1998)',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-37',
      quote: 'A promise would not be intelligible before human conventions had established it.',
      author: 'David Hume',
      era: '1740',
    },
    {
      type: 'question',
      prompt: 'What is Hume\'s puzzle about promising, exactly?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Uttering words seems to create a duty that did not exist before', isCorrect: true },
          { id: 'b', text: 'That people frequently break their promises', isCorrect: false },
          { id: 'c', text: 'That promises to oneself do not count', isCorrect: false },
          { id: 'd', text: 'That we cannot know whether someone is sincere', isCorrect: false },
        ],
        explanation: 'Breaking and sincerity are separate questions. The puzzle is that a duty appears from a speech act — nothing about the world changed except that a sentence was said out loud.',
      },
    },
    {
      type: 'question',
      prompt: 'On the reliance account, why is a secret broken promise still wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They still arranged their life around it, whether or not they find out', isCorrect: true },
          { id: 'b', text: 'Because you might be discovered later', isCorrect: false },
          { id: 'c', text: 'Because it weakens the practice for everyone', isCorrect: false },
          { id: 'd', text: 'It is not wrong if nobody is ever harmed by it', isCorrect: false },
        ],
        explanation: 'The risk of discovery and the damage to the practice are the other account\'s answers. Reliance says the wrong is already complete: they acted on your word, and being unaware of it does not undo it.',
      },
    },
    {
      type: 'summary',
      title: 'Four Words and a Duty',
      keyPoints: [
        'A promise makes an obligation out of a sentence',
        'Hume: only a convention can explain that',
        'Scanlon: the wrong is to whoever relied on you',
        'Secrecy does not repair it',
      ],
      closingThought: 'The strangest part is how ordinary it feels. You do it several times a week and it never once seems mysterious that it works.',
    },
  ],
};

export default lesson;
