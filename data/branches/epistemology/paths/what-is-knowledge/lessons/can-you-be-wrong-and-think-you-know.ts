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
      headline: 'What if everything you\'re certain of is completely wrong?',
      subtext: 'Descartes asked this question and it changed philosophy forever.',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Certainty Is Not the Same as Truth',
      body: 'You can feel absolutely certain about something and still be wrong. Certainty is a feeling — a psychological state inside your mind. Truth is about how the world actually is. The gap between them is what makes radical doubt possible and what Descartes exploited to rebuild knowledge from scratch.',
      visual: '🪞',
      highlight: 'certainty vs truth',
    },
    {
      type: 'example',
      title: 'Descartes\' Evil Demon',
      scenario: 'In his Meditations, Descartes imagined an all-powerful evil demon feeding him a completely false reality. Every sensation, every memory, every mathematical truth could be an illusion. He felt certain the sun rose this morning — but what if that certainty was manufactured? Descartes used this thought experiment to strip away every belief that could possibly be doubted.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'Why Doubt Is a Tool, Not a Problem',
      body: 'Descartes didn\'t doubt everything to become a skeptic forever. He used doubt as a method — a filter. By asking "could I be wrong about this?", he found the one belief that survives all doubt: "I think, therefore I am." Doubt is how he found bedrock. Healthy doubt is a sign of careful thinking, not weakness.',
      visual: '⛏️',
      highlight: 'methodological doubt',
    },
    {
      type: 'question',
      prompt: 'What was the main purpose of Descartes\' evil demon thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To find beliefs that survive even extreme doubt', isCorrect: true },
          { id: 'b', text: 'To prove that demons exist', isCorrect: false },
          { id: 'c', text: 'To show that knowledge is impossible', isCorrect: false },
          { id: 'd', text: 'To explain why math cannot be trusted', isCorrect: false },
        ],
        explanation: 'Descartes used the evil demon as a tool for methodological doubt — by imagining the most extreme possible deception, he could identify which beliefs (like "I am thinking") survive even that scenario and form a secure foundation for knowledge.',
      },
    },
    {
      type: 'question',
      prompt: 'Can you feel completely certain about a belief that turns out to be false?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Certainty is a subjective feeling, not a guarantee of truth. History is full of people who were completely certain about things that were later shown to be false — from flat-earth beliefs to medical misconceptions.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen that certainty is a feeling, not a proof.',
      body: 'Descartes\' conclusion — "I think, therefore I am" — is the one belief the evil demon cannot fake. Even if everything else is an illusion, the very act of doubting proves there is a doubter. This is the foundation he built all knowledge upon: the undeniable existence of the thinking self.',
      emoji: '🧩',
    },
    {
      type: 'summary',
      title: 'Doubt as a Superpower',
      keyPoints: [
        'Certainty is a feeling; truth is how the world is',
        'Descartes\' evil demon tests every belief to its limit',
        'Methodological doubt is a tool, not permanent despair',
        '"I think, therefore I am" survives all possible doubt',
      ],
      closingThought: 'Doubting carefully is not a sign of weakness — it is the first step toward the knowledge that actually holds.',
    },
  ],
};

export default lesson;
