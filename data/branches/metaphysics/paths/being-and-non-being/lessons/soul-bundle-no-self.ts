import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-12',
  slug: 'soul-bundle-no-self',
  title: 'Is There a "Self" at All?',
  description: 'Three answers to one question: are you a soul, a bundle of experiences, or no self at all?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Look inward for the "you" behind your thoughts. Is anyone there?',
      subtext: 'Three philosophers searched — and found three very different answers.',
      emoji: '🪞',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked: what makes you the same person over time?',
      body: 'Earlier you used Locke\'s memory criterion to track identity across years. But that quietly assumes there is a self to track. Now we widen the question: is there any persisting self there at all?',
      emoji: '🧵',
    },
    {
      type: 'concept',
      title: 'Answer One: The Soul',
      body: 'Recall Descartes: behind every thought sits a single thinking thing that owns it. On this view, the self is an immaterial soul — unchanging, indivisible, the one "I" that persists no matter how your body or memories change.',
      visual: '👤',
      highlight: 'a single thinking thing',
    },
    {
      type: 'concept',
      title: 'Answer Two: Just a Bundle',
      body: 'David Hume went looking for that self by introspecting — and never found it. He met only perceptions: a warmth, a sound, a memory. The self, he argued, is just a bundle of fleeting experiences, with no owner standing behind them.',
      visual: '🎞️',
      highlight: 'a bundle of fleeting experiences',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-12-1',
      quote: 'I never can catch myself at any time without a perception, and never can observe anything but the perception.',
      author: 'David Hume',
      era: '1739',
      work: 'A Treatise of Human Nature, I.iv.6',
      philosopherId: 'david-hume',
    },
    {
      type: 'concept',
      title: 'Answer Three: No Self',
      body: 'Buddhism reaches a similar place by a different road. Its doctrine of anatta says the unchanging self is an illusion we cling to. Seeing through that fiction, it claims, loosens our grip and eases suffering.',
      visual: '☸️',
      highlight: 'anatta',
    },
    {
      type: 'dilemma',
      scenario: 'Pause and introspect right now. There are thoughts, sensations, a stream of awareness. But ask: what exactly is the "I" that is having them? Try to point to it directly, underneath the experiences themselves.',
      prompt: 'When you look for the self behind your thoughts, what do you find?',
      choices: [
        { id: 'a', label: 'A single soul that owns every thought' },
        { id: 'b', label: 'Only passing perceptions, no owner' },
        { id: 'c', label: 'A self I cling to, but cannot find' },
      ],
      views: [
        {
          thinker: 'Descartes',
          stance: 'A single thinking soul owns every thought',
          why: 'Doubt all you like — someone must be doing the doubting. That thinker is one immaterial soul, the same "I" persisting beneath each changing experience.',
        },
        {
          thinker: 'Hume',
          stance: 'Only a bundle of perceptions, no owner',
          why: 'Introspect honestly and you catch sensations and feelings, never a self holding them. So "the self" is just the bundle of perceptions — there is no extra thing underneath.',
        },
        {
          thinker: 'Buddhism (anatta)',
          stance: 'The unchanging self is a useful fiction',
          why: 'We feel a solid, permanent "me," but it cannot be located. Seeing this self as illusion loosens craving and clinging, and so eases suffering.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'Hume and the Buddhist anatta view both deny a permanent owner. So both must conclude the self is utterly unreal. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'This is the false dilemma: treating "no permanent soul" as if it meant "nothing at all." Both deny an unchanging owner, yet both still grant a real stream — Hume\'s bundle of perceptions, the Buddhist flow of experience. Denying a soul is not denying the experiences.',
      },
    },
    {
      type: 'question',
      prompt: 'On Hume\'s account, what is it that is having your experiences?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The stream of perceptions itself — there is no one behind it', isCorrect: true },
          { id: 'b', text: 'A soul, which owns each perception in turn', isCorrect: false },
          { id: 'c', text: 'Nothing whatever — the experiences are an illusion too', isCorrect: false },
          { id: 'd', text: 'The body, which produces them', isCorrect: false },
        ],
        explanation: 'C is the overreach the view is most often accused of. Hume denies an owner, not the experiences: introspect and you find perceptions in abundance, just never anything holding them.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'The self has three rival theories, not one',
        'Descartes: a single, unchanging soul',
        'Hume: only a bundle of perceptions',
        'Buddhist anatta: the fixed self is illusion',
      ],
      closingThought: 'You once asked what keeps the self the same; now you can ask whether there is a self to keep at all.',
    },
  ],
};

export default lesson;
