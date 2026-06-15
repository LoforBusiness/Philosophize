import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-25',
  slug: 'possible-worlds',
  title: 'What "Could Have Been" Means',
  description: 'You could have stayed in bed today. What makes that true?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You almost missed the train. What is that "almost"?',
      subtext: 'Talk of what could have happened may point to other worlds.',
      emoji: '🚆',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you separated must-be from might-be.',
      body: 'Lesson 14 split necessary truths (2 + 2 = 4) from contingent ones (you read this today). Philosophers picture that difference with possible worlds: ways things could have gone. Today we ask what those worlds actually are.',
      emoji: '🌐',
    },
    {
      type: 'concept',
      title: 'A Tool for Talking About Maybe',
      body: 'A possible world is a complete way reality could have been. "It is possible you slept in" means: in some possible world, you slept in. "Necessarily 2 + 2 = 4" means it holds in every possible world. The idea turns vague modal talk into something precise and reusable.',
      visual: '🪐',
      highlight: 'possible world',
    },
    {
      type: 'example',
      title: 'The Branching Morning',
      scenario: 'This morning you could have hit snooze, skipped breakfast, or taken a different route. Imagine each option spinning off a complete world identical to ours up to that point, then diverging. In one, you missed the train; in another, you caught it early. "You could have" simply means at least one such world contains it.',
      emoji: '🌳',
    },
    {
      type: 'concept',
      title: 'How Real Are These Worlds?',
      body: 'Here philosophers split. The modal realist says other possible worlds are just as concrete as ours — real places, only causally cut off, where flesh-and-blood counterparts of you live out the roads not taken. Others say worlds are mere abstractions: maximal stories or sets of consistent descriptions, not extra cosmoses.',
      visual: '🔭',
      highlight: 'modal realism',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-25-1',
      quote: 'There are so many other worlds, in fact, that absolutely every way that a world could possibly be is a way that some world is.',
      author: 'David Lewis',
      era: '1986',
      work: 'On the Plurality of Worlds',
    },
    {
      type: 'question',
      prompt: 'Why do many philosophers resist Lewis\'s claim that other possible worlds are concrete, existing places?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It posits a vast unobservable infinity of real worlds — a steep ontological cost', isCorrect: true },
          { id: 'b', text: 'It denies that 2 + 2 = 4 in our world', isCorrect: false },
          { id: 'c', text: 'It says nothing is possible', isCorrect: false },
          { id: 'd', text: 'Because possible worlds cannot be described in language', isCorrect: false },
        ],
        explanation: 'The standard worry is the "incredulous stare": Lewis buys easy talk of possibility at the price of believing in infinitely many concrete worlds, full of real donkeys and people, none of which we can observe. Many prefer to keep worlds as abstract stories — paying with bookkeeping instead of with new cosmoses.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'You say truthfully, "I could have become a musician." Everyone agrees it is true. But what in reality makes it true, given that you did not?',
      prompt: 'What grounds the truth of "could have"?',
      choices: [
        { id: 'a', label: 'A real other world where a counterpart of you is a musician' },
        { id: 'b', label: 'An abstract consistent story; no extra world exists' },
        { id: 'c', label: 'Nothing real — "could have" is just loose talk' },
      ],
      views: [
        {
          thinker: 'Modal realism',
          stance: 'A concrete other world makes it true.',
          why: 'Possibility is existence somewhere in logical space. Your statement is true because, in some equally real world, a counterpart of you took up music. The worlds are not stories — they are flesh-and-blood places, merely disconnected from ours.',
        },
        {
          thinker: 'Abstractionism',
          stance: 'An abstract maximal state of affairs makes it true.',
          why: 'Possible worlds are ways things could be — abstract objects, like numbers or stories, not parallel universes. The musician-world exists only as a consistent description. That is cheaper, and it still grounds the truth.',
        },
        {
          thinker: 'Modal skeptic',
          stance: '"Could have" carries no deep commitment.',
          why: 'Modal talk is useful but need not point at anything extra. Saying you could have been a musician expresses that nothing in your nature or the laws ruled it out — no hidden worlds required to make it true.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Maps of the Might-Have-Been',
      keyPoints: [
        'Possible world: a complete way things could be',
        'Possible = true in some world; necessary = in all',
        'Lewis: other worlds are concrete, real places',
        'Rivals: worlds are abstract stories, not cosmoses',
      ],
      closingThought: 'You now know that one small word — "could" — may hide an entire universe of debate.',
    },
  ],
};

export default lesson;
