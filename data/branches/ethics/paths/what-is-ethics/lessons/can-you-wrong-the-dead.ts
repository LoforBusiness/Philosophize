import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-40',
  slug: 'can-you-wrong-the-dead',
  title: 'Can You Wrong the Dead?',
  description: 'You promised a dying friend, and nobody else heard. Break it now and there seems to be no one left to injure.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The only witness is gone. Does the promise stand?',
      subtext: 'Break it and name who is worse off.',
      emoji: '✉️',
    },
    {
      type: 'concept',
      title: 'A Victim With No Address',
      body: 'Being wronged usually means somebody is worse off. Death seems to remove the somebody. If there is no person left to feel the loss, and no moment at which he feels it, then a broken deathbed promise looks like a wrong with nobody on the receiving end.',
      visual: '🕯️',
      highlight: 'a wrong with nobody on the receiving end',
    },
    {
      type: 'example',
      title: 'What Outlives a Person',
      scenario: 'He wanted his letters burned, not published. That want was real while he lived, and it was about how the world would go after him. Publishing them does not reach him. It reaches the thing he cared about, and turns it the other way.',
      source: 'Joel Feinberg on surviving interests',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-40',
      quote: 'That the fortunes of descendants and of all a man\'s friends should not affect his happiness at all seems a very unfriendly doctrine.',
      author: 'Aristotle',
      era: 'c. 340 BCE',
      philosopherId: 'aristotle',
    },
    {
      type: 'question',
      prompt: 'After the death, what is still there to be damaged?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'What he wanted, which was about the world', isCorrect: true },
          { id: 'b', text: 'The man himself, wherever he now is', isCorrect: false },
          { id: 'c', text: 'Nothing at all', isCorrect: false },
          { id: 'd', text: 'The feelings of whoever finds out', isCorrect: false },
        ],
        explanation: 'His wants. They were always about how things would go, and things are still going. Reaching the man is what nobody can do. Answering with the feelings of onlookers changes the subject: it would make a secret betrayal harmless, which is the case that started this.',
      },
    },
    {
      type: 'question',
      prompt: 'So what does the deathbed promise still bind?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Him — his surviving wants can still be defeated', isCorrect: true },
          { id: 'b', text: 'You alone — it is about the sort of person you are', isCorrect: false },
          { id: 'c', text: 'Nobody — the duty died with him', isCorrect: false },
          { id: 'd', text: 'His family, who may still be embarrassed', isCorrect: false },
        ],
        explanation: 'Him. Feinberg\'s point is that an interest is not a feeling but a stake in how things go, and a stake can be defeated by events its owner never sees. The character answer is not wrong so much as thin — it makes the promise about you, when you made it about him.',
      },
    },
    {
      type: 'summary',
      title: 'What Survives',
      keyPoints: [
        'A wrong seems to need somebody left to injure',
        'Wants reach beyond the life that held them',
        'Defeating a surviving want is a real setback',
        'Aristotle refused to call the dead untouchable',
      ],
      closingThought: 'The letters case is the clean one because nobody would ever know. If the promise still holds there, it was never held up by an audience.',
    },
  ],
};

export default lesson;
