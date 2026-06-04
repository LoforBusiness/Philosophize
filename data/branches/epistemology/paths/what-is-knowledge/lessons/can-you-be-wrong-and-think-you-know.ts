import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-3',
  slug: 'can-you-be-wrong-and-think-you-know',
  title: 'Can You Be Wrong About Something You\'re Certain Of?',
  description: 'Meet Descartes\' evil demon and learn why feeling certain is not the same as being right.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if the things you feel sure about are wrong?',
      subtext: 'Descartes asked this question and changed how we think about knowledge.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not the Same as Truth',
      body: 'You can feel completely certain and still be wrong. Certainty is a feeling inside your mind. Truth is about how the world actually is. The two can come apart. Because they can, it always makes sense to ask whether a belief you feel sure of is really true.',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In his Meditations, Descartes imagined a powerful demon feeding him a fake world. Every sight, memory, and even simple math could be a trick. He felt sure the sun had risen, but what if that feeling itself was the deception? He used this idea to test which beliefs could survive serious doubt.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Doubt as a Tool',
      body: 'Descartes did not doubt to give up. He used doubt as a method. By asking again and again "could I be wrong about this?", he searched for any belief that doubt could not shake. He found one: "I think, therefore I am." Used this way, doubt is a careful tool, not a weakness.',
      visual: '⛏️',
      highlight: 'methodological doubt',
    },
    {
      type: 'question',
      prompt: 'What was Descartes really trying to do with his evil demon thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To find the beliefs that survive even the fiercest doubt', isCorrect: true },
          { id: 'b', text: 'To prove that such demons genuinely exist', isCorrect: false },
          { id: 'c', text: 'To show that knowledge is forever out of reach', isCorrect: false },
          { id: 'd', text: 'To argue that mathematics can never be trusted', isCorrect: false },
        ],
        explanation: 'The demon was a tool for doubting everything. By imagining the most extreme deception, Descartes could see which beliefs, like "I am thinking," still hold up, and build on them.',
      },
    },
    {
      type: 'question',
      prompt: 'Can you feel completely certain about a belief that later turns out to be false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Certainty is just a feeling, not proof that something is true. History is full of people who were totally sure of things later shown to be wrong, like the idea that the earth is flat.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Certainty is a feeling, not proof.',
      body: 'Descartes\' conclusion, "I think, therefore I am," is the one belief the demon cannot fake. Even if everything else is an illusion, the act of doubting still needs someone doing the doubting. He used that one solid fact, the thinking self, as the base to rebuild everything else.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'Doubt as a Tool',
      keyPoints: [
        'Certainty is a feeling; truth is how the world is',
        'The evil demon tests beliefs against extreme doubt',
        'Doubt can be a useful method, not just despair',
        '"I think, therefore I am" survives every doubt',
      ],
      closingThought: 'Doubting carefully is not a weakness. It is a first honest step toward knowledge that holds up.',
    },
  ],
};

export default lesson;
