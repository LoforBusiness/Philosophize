import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-23',
  slug: 'persistence-and-composition',
  title: 'When Do Parts Make a Whole?',
  description: 'Replace every plank of a ship and you reopen a 2,000-year-old puzzle.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Swap every plank, one by one. Is it the same ship?',
      subtext: 'Now rebuild the old ship from the cast-offs. Which is the real one?',
      emoji: '⛵',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you watched a river change yet stay one river.',
      body: 'Earlier you met Heraclitus and the puzzle of identity through change. Now we sharpen it into two questions: when does a thing survive change over time, and when do many parts add up to a single thing at all?',
      emoji: '🌊',
    },
    {
      type: 'example',
      title: 'The Ship of Theseus',
      scenario: 'Athens preserves Theseus\'s ship. As each plank rots, they replace it, until no original plank remains. Call this the Repaired Ship. Meanwhile a collector gathers every discarded plank and reassembles them into a ship. Call this the Reassembled Ship. Now there are two vessels — and each has a claim to be the original. They cannot both be it.',
      emoji: '🪵',
      source: 'Plutarch, Life of Theseus (c. 75 CE)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-23-1',
      quote: 'One side held that the ship remained the same, and the other contended that it was not the same.',
      author: 'Plutarch',
      era: 'c. 75 CE',
      work: 'Life of Theseus',
    },
    {
      type: 'concept',
      title: 'Two Rival Answers',
      body: 'One view tracks continuity: the Repaired Ship is original because it kept functioning and changed gradually. Another tracks matter: the Reassembled Ship is original because it holds the very planks Theseus sailed. The case shows our word "same" hides two different criteria pulling apart.',
      visual: '🔀',
      highlight: 'two criteria of "same"',
    },
    {
      type: 'concept',
      title: 'The Composition Question',
      body: 'Step back to a deeper puzzle. When do some things compose a further thing? Planks in a pile are not a ship; arranged and joined, they are. Some philosophers say composition happens only sometimes; others say always; a few say never — there are only the planks, never a "ship" over and above them.',
      visual: '🧩',
      highlight: 'the composition question',
    },
    {
      type: 'question',
      prompt: 'A friend insists the Ship of Theseus "has one true answer we just haven\'t found." Why might that miss the point?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'There is a hidden fact about ship-atoms we could measure', isCorrect: false },
          { id: 'b', text: 'The puzzle exposes that "same ship" packs two criteria that can conflict', isCorrect: true },
          { id: 'c', text: 'Ships cannot really persist through any change', isCorrect: false },
          { id: 'd', text: 'Only the newest ship can count as real', isCorrect: false },
        ],
        explanation: 'The mistake is assuming a single hidden fact settles it. The puzzle reveals our concept of identity bundles two criteria — spatiotemporal continuity and same-matter — that usually agree but here come apart. The "right answer" depends on which criterion our word "same" is tracking, not on a missing measurement.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'Both ships now float in the harbour. The city must hang one plaque reading "The Ship of Theseus." Officials argue. One points to unbroken use and gradual repair; another points to the original timber.',
      prompt: 'Which ship deserves the plaque?',
      choices: [
        { id: 'a', label: 'The Repaired Ship — it never stopped being in service' },
        { id: 'b', label: 'The Reassembled Ship — it has the original planks' },
        { id: 'c', label: 'Neither — there is no fact of the matter' },
      ],
      views: [
        {
          thinker: 'Continuity view',
          stance: 'The Repaired Ship is the original.',
          why: 'Identity over time is unbroken functional and spatiotemporal continuity. Like a body that replaces its cells, the ship stayed one thing through gradual change. The planks are just material it passed through.',
        },
        {
          thinker: 'Same-matter view',
          stance: 'The Reassembled Ship is the original.',
          why: 'A thing is the stuff it is made of. The planks Theseus sailed are the ship; gather them again and the original returns. The Repaired Ship is a replica that grew up around the name.',
        },
        {
          thinker: 'Deflationary view',
          stance: 'There is no further fact to find.',
          why: 'Both ships exist; both have a claim. "Which is really it?" asks for a fact beyond all the physical and historical facts, and there is none. The dispute is about how to use a word, not about reality.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Same Through Change?',
      keyPoints: [
        'Persistence: surviving change over time',
        'Continuity and same-matter can conflict',
        'Composition: when parts make one whole',
        'Some puzzles have no single hidden answer',
      ],
      closingThought: 'You now know that "the same thing" can quietly mean two things at once.',
    },
  ],
};

export default lesson;
