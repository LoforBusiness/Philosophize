import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-15',
  slug: 'kant-on-disinterested-beauty',
  title: "Kant's Strange Idea Of Beauty",
  description: 'Kant said real beauty pleases us without us wanting anything from it at all.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if wanting something ruins its beauty?',
      subtext: 'Kant thought true beauty pleases us only when we crave nothing from it.',
      emoji: '🌹',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw Hume anchor beauty in trained critics.',
      body: 'Hume located a standard of taste in refined judges. Kant asks a deeper question: what kind of pleasure are those judges even reporting? His answer reshapes the whole debate.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Pleasure Without a Stake',
      body: 'Imagine admiring a rose with no urge to pick, sell, or eat it — just delight in how it looks. Kant calls this delight disinterested: pleasure free of any desire to possess or use the thing.',
      visual: '🌼',
      highlight: 'disinterested',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-15-1',
      quote: 'Taste is the faculty of judging an object by means of a delight apart from any interest. The object of such a delight is called beautiful.',
      author: 'Immanuel Kant',
      era: '1790',
      work: 'Critique of the Power of Judgment',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'concept',
      title: 'Beauty That Expects Agreement',
      body: 'Because my delight is not about my private appetite, I do not call the rose beautiful "for me." I speak as if you should see it too. Kant says taste claims a universal voice, even without a rule to prove it.',
      visual: '🗣️',
      highlight: 'universal voice',
    },
    {
      type: 'example',
      title: 'Free vs. Dependent Beauty',
      scenario: 'A swirl of wallpaper or a melody pleases with no purpose attached — Kant calls this free beauty. But a beautiful church or horse is judged partly by what it should be: a fitting church, a sound horse. That is dependent beauty, tied to a purpose.',
      source: 'Kant, Critique of the Power of Judgment',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Kant\'s disinterested beauty means he found beauty cold and unmoving." Why is this a misreading?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '"Disinterested" means free of self-serving desire, not free of pleasure', isCorrect: true },
          { id: 'b', text: 'Kant denied that beauty causes any feeling whatsoever', isCorrect: false },
          { id: 'c', text: 'Kant secretly meant beauty must serve a practical use', isCorrect: false },
          { id: 'd', text: 'Kant thought only experts could feel beautiful objects', isCorrect: false },
        ],
        explanation: 'This is an equivocation fallacy: it slides "disinterested" into "uninterested." For Kant the delight is real and vivid — it is simply not driven by craving or use. The pleasure stays; only the personal stake is removed.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Beauty pleases apart from any desire to possess',
        'Taste claims a universal voice, not "just me"',
        'Free beauty needs no purpose; dependent beauty does',
      ],
      closingThought: 'Hume found beauty in the critic; Kant found it in delight that wants nothing back.',
    },
  ],
};

export default lesson;
