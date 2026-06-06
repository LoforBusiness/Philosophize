import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-3',
  slug: 'can-you-be-wrong-and-think-you-know',
  title: 'Can You Be Wrong About Something You\'re Certain Of?',
  description: 'Descartes unleashes an evil demon to find one belief that doubt can never break.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if everything you\'re sure of is a lie?',
      subtext: 'Descartes dared to doubt it all, then rebuilt knowledge from the rubble.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not the Same as Truth',
      body: 'Here is the crack at the heart of knowing. Certainty is a feeling buzzing inside your head. Truth is how the world actually stands, with or without you. The two can split apart. So feeling sure proves nothing on its own. That is exactly why epistemology, the study of knowledge, keeps asking: how do you know?',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In his Meditations, Descartes imagines a demon of vast power rigging his entire reality. Every sight, every memory, even two plus three, could be a planted lie. He feels sure the sun rose, but what if that feeling is the trick? This is hyperbolic doubt: turn the dial to maximum and see what survives.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Doubt as a Tool',
      body: 'Descartes does not doubt to surrender. Doubt is his method, a chisel, not a wrecking ball. He hammers every belief with one question: could the demon fake this? Most beliefs crack. One refuses. "I think, therefore I am," the Cogito, stands firm. Wielded this way, doubt builds rather than destroys.',
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
        explanation: 'The demon is a stress test for belief. By cranking deception to the extreme, Descartes spots what still holds, the thinking self, and lays it down as the foundation to rebuild knowledge.',
      },
    },
    {
      type: 'question',
      prompt: 'Can you feel completely certain about a belief that later turns out to be false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Certainty is a feeling, not a guarantee. This is why philosophers separate feeling sure from being justified. A belief can blaze with confidence and still be false, which is exactly the gap the demon exploits.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Certainty is a feeling, not proof.',
      body: 'The Cogito is the one belief the demon cannot forge. Fake the sky, fake your memories, fake the math, fine, but the very act of doubting still needs a doubter. To be deceived, you must exist to be fooled. On that bedrock fact, the thinking self, Descartes rebuilds everything.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'What Survives the Demon',
      keyPoints: [
        'Certainty is a feeling; truth is how the world is',
        'The evil demon stress-tests beliefs with extreme doubt',
        'Doubt can be a method, not just despair',
        '"I think, therefore I am" outlasts every doubt',
      ],
      closingThought: 'Doubting boldly is no weakness. It is the first honest stride toward knowledge that actually holds.',
    },
  ],
};

export default lesson;
