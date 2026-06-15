import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-23',
  slug: 'music-and-emotion',
  title: 'Can Music Mean Anything?',
  description: 'A melody sounds sad — but can pure sound actually represent or refer to a thing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A wordless tune can move you. But can it tell you anything?',
      subtext: 'A photo shows a thing. A sentence states a fact. What, if anything, does a melody do?',
      emoji: '🎵',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier: music sounds sad by resembling grief.',
      body: 'Lesson 18 explained why a slow adagio feels sad — it mirrors slow, drooping human movement. That was about expression: how music has a mood. This lesson asks the harder question next door: beyond feeling sad, can music mean, refer to, or represent anything at all?',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Expression vs Representation',
      body: 'These come apart. To express is to have a mood — the music sounds sorrowful. To represent is to be about something — to point at an object beyond itself, the way a painting depicts an apple. Most pure music expresses readily but represents almost nothing. A C-minor chord refers to no apple.',
      visual: '🍎',
      highlight: 'representation',
    },
    {
      type: 'example',
      title: 'When Music Paints',
      scenario: 'In Vivaldi\'s "Spring," trilling violins imitate birdsong; rumbling strings stage a storm. This is program music — sound mimicking the world. Yet without Vivaldi\'s written titles, would you hear birds, or just lively trills? The labels do much of the pointing. Strip them away and the representation grows thin.',
      source: 'Antonio Vivaldi, The Four Seasons (1725)',
      emoji: '🐦',
    },
    {
      type: 'concept',
      title: 'Absolute Music',
      body: 'Most instrumental music is "absolute" — it refers to nothing outside itself. A Bach fugue is not about anything; it is a structure of tones unfolding. The Romantics disagreed: Schopenhauer held that music does represent something, not objects but the inner will itself — feeling\'s raw motion, beneath all images.',
      visual: '🌀',
      highlight: 'absolute music',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-23-1',
      quote: 'Music... is by no means like the other arts the copy of the Ideas, but the copy of the will itself.',
      author: 'Arthur Schopenhauer',
      era: '1818',
      work: 'The World as Will and Representation',
      philosopherId: 'arthur-schopenhauer',
    },
    {
      type: 'question',
      prompt: 'A trumpet fanfare opens a film and you "hear victory." What best explains how the music seems to mean victory?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The notes literally contain the concept of victory, like a word in a dictionary', isCorrect: false },
          { id: 'b', text: 'It expresses a triumphant mood and leans on learned associations, not genuine reference to an object', isCorrect: true },
          { id: 'c', text: 'Music can represent any object as precisely as a sentence can', isCorrect: false },
          { id: 'd', text: 'It proves all music is secretly program music about real events', isCorrect: false },
        ],
        explanation: 'The trap is treating sound like language, where a symbol denotes a fixed meaning. Music has no such code. The fanfare expresses triumph and triggers cultural associations (fanfares accompany victories), but it does not refer to victory the way the word "victory" does.',
      },
    },
    {
      type: 'summary',
      title: 'Sound Without Sentences',
      keyPoints: [
        'Expressing a mood differs from representing an object',
        'Program music imitates the world; titles help it point',
        'Absolute music refers to nothing outside itself',
        'Schopenhauer: music copies the will, not things',
      ],
      closingThought: 'Music may say nothing in particular — and reach you exactly because it doesn\'t.',
    },
  ],
};

export default lesson;
