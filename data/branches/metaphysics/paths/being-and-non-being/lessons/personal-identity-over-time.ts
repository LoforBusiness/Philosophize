import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-11',
  slug: 'personal-identity-over-time',
  title: 'What Makes You, You?',
  description: 'Your cells, beliefs, and body all change. So what keeps you the same person?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The person born with your name is now a stranger.',
      subtext: 'Different body, different cells, different beliefs. So why are they still you?',
      emoji: '🪞',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the Ship of Theseus — replace every plank, same ship?',
      body: 'Now point that puzzle at yourself. Your body swaps out nearly all its matter over a lifetime, just like the ship. If sameness of parts cannot keep the ship the same, what keeps you the same person?',
      emoji: '🚢',
    },
    {
      type: 'concept',
      title: 'The puzzle of personal identity',
      body: 'Personal identity over time asks what makes you at 70 the same person you were at 7 — despite total physical and psychological change. Not "what are you like?" but "what makes that later person literally the same one?" The body changes, beliefs change. Something must carry the "you" across the gap.',
      visual: '⏳',
      highlight: 'personal identity over time',
    },
    {
      type: 'example',
      title: 'Locke and the thinking prince',
      scenario:
        'John Locke imagined the soul of a prince, carrying all his memories, entering the body of a cobbler. Who wakes up? Everyone, Locke says, would judge the cobbler to now BE the prince — because he remembers the prince’s life. The same body (the cobbler’s) is not enough. The continuous consciousness is what we follow.',
      source: 'Locke, An Essay Concerning Human Understanding, II.xxvii',
      emoji: '👑',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-11',
      quote:
        'Consciousness makes personal identity... as far as this consciousness can be extended backwards to any past action, so far reaches the identity of that person.',
      author: 'John Locke',
      era: '1694',
      work: 'An Essay Concerning Human Understanding, II.xxvii',
      philosopherId: 'john-locke',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked: is the "you" the body, or something mental?',
      body: 'Locke takes the mental side and sharpens it. Not a soul you can never check on, and not the body that keeps replacing itself — but consciousness: the thread of memory linking your present self to your past actions.',
      emoji: '🧠',
    },
    {
      type: 'question',
      prompt: 'On Locke’s view, what makes the 70-year-old the same person as the 7-year-old?',
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'Continuity of consciousness — the later self can remember the earlier life.',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'They have the same physical body throughout their whole life.',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'They were given the same name and birth certificate at birth.',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'They keep the same personality and never change their beliefs.',
            isCorrect: false,
          },
        ],
        explanation:
          'Locke grounds identity in continuity of consciousness and memory (A). Option B is the tempting bodily-continuity assumption — and it begs the question: the body replaces nearly all its matter (the Ship of Theseus problem), so "same body" cannot do the work without an argument it never gives. D fails too, since beliefs and personality openly change.',
      },
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What you now know',
      keyPoints: [
        'Persons change totally yet stay one self over time.',
        'Same body fails — its matter is replaced, like Theseus’ ship.',
        'Locke grounds identity in continuity of consciousness and memory.',
      ],
      closingThought:
        'You are not your atoms. You are the thread of awareness that remembers being you.',
    },
  ],
};

export default lesson;
