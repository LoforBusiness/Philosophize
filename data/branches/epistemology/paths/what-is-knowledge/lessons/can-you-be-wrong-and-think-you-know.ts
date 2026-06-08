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
      subtext: 'Descartes doubted it all on purpose, then rebuilt knowledge from the rubble.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not the Same as Truth',
      body: 'Here is the crack at the heart of knowing. Feeling certain is a state of mind. Truth is how the world actually stands, with or without you. The two can split apart. So Descartes wants more than confidence: he hunts for beliefs that withstand every possible reason to doubt. That is the test epistemology keeps applying.',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In Meditation One, Descartes supposes a demon of utmost power and cunning rigging his entire reality. Every sight, every memory, even that two plus three make five, could be a planted lie. This is hyperbolic doubt, pushed to the maximum, to clear away every shaky belief and see what is left.',
      source: 'René Descartes, Meditations on First Philosophy (1641), Meditation One',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Doubt as a Tool',
      body: 'Descartes does not doubt to surrender. The demon is a device, not a sincere belief. He tests every idea with one question: could the demon fake this? Most beliefs crack. One refuses. As he puts it in Meditation Two, "I am, I exist" is necessarily true each time he thinks it. Used this way, doubt rebuilds rather than ruins.',
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
          { id: 'a', text: 'To find a belief that survives even the fiercest doubt', isCorrect: true },
          { id: 'b', text: 'To prove that such demons genuinely exist', isCorrect: false },
          { id: 'c', text: 'To show that knowledge is forever out of reach', isCorrect: false },
          { id: 'd', text: 'To argue that mathematics can never be trusted', isCorrect: false },
        ],
        explanation: 'The demon is a deliberate stress test for belief. By cranking deception to the extreme, Descartes spots what still holds, the existence of the thinking self, and lays it down as the foundation to rebuild knowledge.',
      },
    },
    {
      type: 'question',
      prompt: 'Can you feel completely certain about a belief that later turns out to be false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'A feeling of certainty is no guarantee of truth. That is why Descartes does not settle for confidence; he demands beliefs that no possible doubt, even the demon, can shake. A belief can blaze with confidence and still be false.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A feeling of certainty is not proof.',
      body: '"I am, I exist" is the one belief the demon cannot forge. Fake the sky, fake your memories, fake the math, fine, but the very act of doubting still needs a doubter. To be deceived, you must exist to be fooled. On that bedrock, the thinking self, Descartes rebuilds everything.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'What Survives the Demon',
      keyPoints: [
        'Feeling certain is not the same as being true',
        'The evil demon stress-tests beliefs with extreme doubt',
        'Doubt can be a method, not just despair',
        '"I am, I exist" outlasts every doubt',
      ],
      closingThought: 'Doubting boldly is no weakness. It is the first honest stride toward knowledge that actually holds.',
    },
  ],
};

export default lesson;
