import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-6',
  slug: 'identity-and-change',
  title: 'Can a Thing Survive Change?',
  description: 'Replace every plank of a ship and is it still the same ship?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Swap every plank. Same ship, or a new one?',
      subtext: 'A puzzle the Greeks could not let go of.',
      emoji: '🚢',
    },
    {
      type: 'concept',
      title: 'The Ship of Theseus',
      body: 'Athens preserved Theseus\'s ship, swapping rotted planks for new ones. After centuries, no original wood remained. Plutarch reports the debate: is it still the ship that sailed, or another entirely?',
      visual: '⚓',
      highlight: 'Ship of Theseus',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-6-1',
      quote: 'All things move and nothing remains still; you cannot step twice into the same stream.',
      author: 'Heraclitus, reported by Plato',
      era: 'c. 500 BCE',
      work: 'Plato, Cratylus 402a',
    },
    {
      type: 'concept',
      title: 'Two Senses of Sameness',
      body: 'Philosophers split the word. Qualitative identity: sharing all the same features. Numerical identity: being one and the same thing over time. The ship may lose the first while keeping the second.',
      visual: '🔁',
      highlight: 'numerical identity',
    },
    {
      type: 'example',
      title: 'You Are the Living Proof',
      scenario: 'Nearly every cell in your body has been replaced since childhood. The toddler in old photos shares almost no matter with you now. Yet you call that child yourself. The ship is your own riddle.',
      emoji: '🧬',
    },
    {
      type: 'question',
      prompt: 'Why does the Ship of Theseus threaten our idea of identity over time?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Wooden ships rot too quickly to last', isCorrect: false },
          { id: 'b', text: 'A thing\'s parts can all change while we still call it the same thing', isCorrect: true },
          { id: 'c', text: 'Theseus never actually owned a ship', isCorrect: false },
          { id: 'd', text: 'Ships cannot be repaired without sinking', isCorrect: false },
        ],
        explanation: 'If something keeps its identity even after every part is replaced, then identity cannot rest on the parts alone — which is exactly what makes the case so puzzling.',
      },
    },
    {
      type: 'question',
      prompt: 'Someone hoards the old planks and rebuilds them into a ship. Which one is the real Ship of Theseus?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Obviously the rebuilt one — it has the original matter', isCorrect: false },
          { id: 'b', text: 'Obviously the repaired one — it never stopped sailing', isCorrect: false },
          { id: 'c', text: 'There is no automatic answer; "same" depends on whether we track matter or continuity', isCorrect: true },
          { id: 'd', text: 'Both are fakes, since neither is unchanged', isCorrect: false },
        ],
        explanation: 'Each ship has a strong claim — one keeps the original matter, the other keeps unbroken continuity — so the case shows identity depends on which criterion we choose, not on a single fact.',
      },
    },
    {
      type: 'summary',
      title: 'Identity Is Stranger Than It Looks',
      keyPoints: [
        'Theseus\'s ship: parts replaced, identity questioned',
        'Qualitative versus numerical sameness',
        'Heraclitus: all things flow',
        'You change matter yet stay you',
      ],
      closingThought: 'Maybe a thing is not its stuff but its story — the unbroken thread that ties each stage to the next.',
    },
  ],
};

export default lesson;
