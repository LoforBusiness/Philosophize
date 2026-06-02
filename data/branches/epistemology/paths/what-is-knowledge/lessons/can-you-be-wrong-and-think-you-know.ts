import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-3',
  slug: 'can-you-be-wrong-and-think-you-know',
  title: 'Can You Be Wrong About Something You\'re Certain Of?',
  description: 'Meet Descartes\' evil demon and discover why certainty and truth are not the same thing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if everything you feel most certain of is simply false?',
      subtext: 'Descartes dared to ask this — and philosophy was never quite the same.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not the Same as Truth',
      body: 'You can feel utterly certain and still be wrong. Certainty is a feeling — a weather pattern within the mind. Truth concerns the world as it actually stands. That quiet gap between them is what makes radical doubt possible, and the very seam Descartes pried open to rebuild knowledge from nothing.',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In his Meditations, Descartes conjured an all-powerful demon feeding him a flawless counterfeit world. Every sensation, every memory, even arithmetic, might be staged. He felt sure the sun had risen — but what if that very feeling was the deception? With this thought experiment he set out to discard any belief the slightest doubt could touch.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Why Doubt Is a Tool, Not a Wound',
      body: 'Descartes did not doubt in order to despair. He wielded doubt as a method, a sieve. Asking again and again "could I be wrong here?", he reached the one belief no doubt could dissolve: I think, therefore I am. Doubt was how he struck bedrock. To question well is the mark of care, not weakness.',
      visual: '⛏️',
      highlight: 'methodological doubt',
    },
    {
      type: 'question',
      prompt: 'What was Descartes truly after in his evil demon thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To find the beliefs that survive even the fiercest doubt', isCorrect: true },
          { id: 'b', text: 'To prove that such demons genuinely exist', isCorrect: false },
          { id: 'c', text: 'To show that knowledge is forever out of reach', isCorrect: false },
          { id: 'd', text: 'To argue that mathematics can never be trusted', isCorrect: false },
        ],
        explanation: 'The demon was Descartes\' instrument of methodical doubt. By imagining the most total deception conceivable, he could see which beliefs — like "I am thinking" — still stand, and build on that solid ground.',
      },
    },
    {
      type: 'question',
      prompt: 'Can you feel entirely certain of a belief that later proves to be false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Certainty is an inner feeling, never a warrant of truth. History brims with people utterly sure of what time would overturn — a flat earth, a settled cure, a confident error worn as fact.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have seen it now: certainty is a feeling, not a proof.',
      body: 'Descartes\' conclusion — I think, therefore I am — is the single belief the demon cannot counterfeit. Let everything else be illusion; the very act of doubting still requires a doubter. On that one undeniable fact, the thinking self, he chose to rebuild all the rest.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'Doubt as Quiet Power',
      keyPoints: [
        'Certainty is a feeling; truth is how the world stands',
        'The evil demon tests every belief to its breaking point',
        'Methodical doubt is a tool, not lasting despair',
        '"I think, therefore I am" outlasts every doubt',
      ],
      closingThought: 'To doubt with care is no weakness — it is the first honest step toward the knowledge that truly holds.',
    },
  ],
};

export default lesson;
