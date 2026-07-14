import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-21',
  slug: 'the-ontology-of-art',
  title: 'What Kind of Thing Is an Artwork?',
  description: 'A symphony is performed thousands of times. So where, exactly, is the symphony?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You can burn the Mona Lisa. You cannot burn Hamlet.',
      subtext: 'Some artworks are single objects. Others survive every copy. Why the difference?',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'A Strange Question',
      body: 'Beethoven\'s Fifth was played last night in Tokyo and tonight in Berlin. Both were the Fifth — yet they were different sounds, in different halls. So what is "the Fifth"? Not any single performance, since it outlives them all. Ontology asks: what kind of thing is an artwork, really?',
      visual: '🎼',
      highlight: 'ontology',
    },
    {
      type: 'concept',
      title: 'Types and Tokens',
      body: 'Philosophers borrow a distinction. The word "rose" printed twice is one type with two tokens — two ink-marks of a single abstract pattern. A symphony works the same way: the work is the type; each performance is a token of it. The score is just the recipe.',
      visual: '🌹',
      highlight: 'types and tokens',
    },
    {
      type: 'example',
      title: 'Painting vs Symphony',
      scenario: 'Da Vinci\'s Mona Lisa is one physical panel in the Louvre — a single object, a "particular." Destroy it and the work is gone; every photo is a mere copy. But Beethoven\'s Fifth has no original copy to destroy. It is repeatable: a pattern that any orchestra can instantiate. Two artworks, two kinds of being.',
      emoji: '🖼️',
    },
    {
      type: 'question',
      prompt: 'A fire destroys the only handwritten score of a symphony, but orchestras still play it from memory. Has the symphony been destroyed?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — the score was the artwork, so the work is now gone', isCorrect: false },
          { id: 'b', text: 'No — the symphony is a repeatable type; the score was only one token of its notation', isCorrect: true },
          { id: 'c', text: 'Yes — without a written copy, music cannot exist', isCorrect: false },
          { id: 'd', text: 'No — but only because someone could rewrite it later', isCorrect: false },
        ],
        explanation: 'The trap is treating the symphony like a painting — a single physical particular. It is not. As a repeatable type, the work survives as long as performances or memories of the pattern do. The burnt score was a token of the notation, not the work itself.',
      },
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-21-1',
      quote: 'A musical work is not a pure sound-structure — it is a structure as indicated by a composer at a time. Its history of creation belongs to the work itself.',
      author: 'Jerrold Levinson (paraphrase)',
      era: '1980',
      work: 'What a Musical Work Is',
    },
    {
      type: 'reinforcement',
      callout: 'The kind of thing decides what can happen to it.',
      body: 'Whether an artwork can be forged, performed, copied, or destroyed all depends on its ontology. A novel and a sculpture are not just different works — they are different kinds of being. Ontology is the hidden grammar beneath every other question in aesthetics.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'The Being of Artworks',
      keyPoints: [
        'Ontology asks what kind of thing an artwork is',
        'Some works are single particulars: one panel, one statue',
        'Others are repeatable types with many tokens',
        'A score is the recipe, not the symphony',
      ],
      closingThought: 'You can stand in front of a painting. You can only ever attend a performance.',
    },
  ],
};

export default lesson;
