import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-12',
  slug: 'intentional-fallacy-interpretation',
  title: 'Who Decides What Art Means?',
  description: 'Does a poem mean what its author intended — or does intention not get to decide?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You finish a poem. The poet says it means the opposite.',
      subtext: 'Do you believe the poem, or the poet?',
      emoji: '🖋️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked what makes something art.',
      body: 'Lesson 11 fixed when a thing counts as art. A new question follows: once it is art, who fixes what it means — the maker, or the work itself?',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'The Intentional Fallacy',
      body: 'Wimsatt and Beardsley argued it is a mistake to settle a work\'s meaning by appealing to the author\'s private intention. Meaning lives in the public text everyone can read — not in the hidden, unverifiable wishes inside the author\'s head.',
      visual: '🗝️',
      highlight: 'intentional fallacy',
    },
    {
      type: 'example',
      title: 'The Misread Line',
      scenario: 'A famous poet swears a celebrated line was meant as a joke. But the words on the page carry no hint of it — readers, critics, and the rhythm all read it as grief. Wimsatt and Beardsley would say the poem means what the text supports, not what the poet now claims.',
      source: 'Wimsatt & Beardsley, The Intentional Fallacy (1946)',
      emoji: '📜',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-12-1',
      quote: 'The design or intention of the author is neither available nor desirable as a standard for judging the success of a work of literary art.',
      author: 'W. K. Wimsatt & Monroe Beardsley',
      era: '1946',
      work: 'The Intentional Fallacy',
    },
    {
      type: 'question',
      prompt: 'A reader insists: "The poem means whatever the author says they intended." What is wrong with this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It commits the intentional fallacy — meaning lives in the public text, not private intention', isCorrect: true },
          { id: 'b', text: 'Nothing — the author always has the final word on meaning', isCorrect: false },
          { id: 'c', text: 'It is wrong because beauty, not meaning, is what counts', isCorrect: false },
          { id: 'd', text: 'It is wrong because no work of art has any meaning at all', isCorrect: false },
        ],
        explanation: 'The tempting answer is the intentional (genetic) fallacy: confusing how a work was produced with what it means. Intention is private and unverifiable; meaning must be read off the public work everyone can actually examine.',
      },
    },
    {
      type: 'question',
      prompt: 'Wimsatt and Beardsley claim a private intention you cannot inspect can still settle a poem\'s meaning.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. Their whole point is the reverse: intention is "neither available nor desirable" as the standard. What you cannot inspect cannot anchor a public meaning — only the text can.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'This sharpens what you saw in beauty versus meaning.',
      body: 'Earlier, meaning could carry a work where beauty did not. Now ask where that meaning is located: not sealed in the artist\'s mind, but out in the work, open to every reader.',
      emoji: '🔎',
    },
    {
      type: 'summary',
      title: 'Meaning Lives in the Work',
      keyPoints: [
        'Intention is private and unverifiable',
        'The intentional fallacy lets it decide meaning',
        'Meaning is read from the public text',
      ],
      closingThought: 'The author opens a door, then the work walks through without them.',
    },
  ],
};

export default lesson;
