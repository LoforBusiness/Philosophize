import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-32',
  slug: 'the-map-is-not-the-territory',
  title: 'The Map Is Not the Territory',
  description: 'Why the most detailed model of the world is the most useless one.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A perfect map would be the size of the country.',
      subtext: 'And nobody could use it for anything.',
      emoji: '🗺️',
    },
    {
      type: 'concept',
      title: 'Leaving Things Out Is the Job',
      body: 'Every map, model and theory is a deliberate simplification. It is not a failed copy of the world — it is a tool built for a task, and what it omits is chosen as carefully as what it shows. Detail past that point makes it worse, not truer.',
      visual: '📐',
      highlight: 'Omission is the design',
    },
    {
      type: 'example',
      title: 'Four Maps of One Coast',
      scenario: 'At one scale the coast is a single line. At another, every bay. At another, every rock. At one-to-one it is the coast itself — and standing on it, the only thing you can see is the stone under your boot.',
      source: 'After Borges, "On Exactitude in Science"',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-32',
      quote: 'A map is not the territory it represents, but, if correct, it has a similar structure to the territory.',
      author: 'Alfred Korzybski',
      era: '1933',
    },
    {
      type: 'question',
      prompt: 'You are sailing this coast tonight. Which map do you take?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one showing the shape of the coast and its bays', isCorrect: true },
          { id: 'b', text: 'The one showing the whole country as a single line', isCorrect: false },
          { id: 'c', text: 'The one showing every individual rock', isCorrect: false },
          { id: 'd', text: 'The one-to-one map, which leaves nothing out', isCorrect: false },
        ],
        explanation: 'The first cannot be sailed by and the third cannot be read in the dark. The fourth omits nothing at all, which is exactly why it can only ever show you the rock you are already standing on.',
      },
    },
    {
      type: 'question',
      prompt: 'So what kind of thing is a model?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A deliberate simplification, right for some purposes and wrong for others', isCorrect: true },
          { id: 'b', text: 'An approximation that gets truer the more detail you add', isCorrect: false },
          { id: 'c', text: 'A fiction, since it is never the thing itself', isCorrect: false },
          { id: 'd', text: 'A true description of the world\'s underlying structure', isCorrect: false },
        ],
        explanation: 'B is the trap, and the one-to-one map refutes it: add detail without limit and you get the coastline back at coastline size. C over-corrects, since a model can still be plainly wrong. Fit to purpose is the standard.',
      },
    },
    {
      type: 'summary',
      title: 'Built for a Task',
      keyPoints: [
        'Every model leaves things out on purpose',
        'More detail is not the same as more accuracy',
        'A map is judged by the job, not by resemblance',
        'Ask what a model omits before you trust it',
      ],
      closingThought: 'The question is never whether your picture of the world is complete. It is whether it leaves out the right things.',
    },
  ],
};

export default lesson;
