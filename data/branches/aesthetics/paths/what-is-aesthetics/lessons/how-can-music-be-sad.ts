import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-18',
  slug: 'how-can-music-be-sad',
  title: 'How Can Music Be Sad?',
  description: 'A song has no feelings — so where does its sadness actually live?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A song has no heart. So how is it sad?',
      subtext: 'The notes feel nothing — yet a slow adagio can make you ache.',
      emoji: '🎻',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw expression theory.',
      body: 'Earlier you saw expression theory — art transmits the artist\'s feeling: a sad composer pours sadness into the work, and we catch it. Music is the hardest test of that simple "transmission" picture. Pure sound, no words — yet still drenched in mood.',
      emoji: '📡',
    },
    {
      type: 'concept',
      title: 'The Pathetic Fallacy',
      body: 'The easy answer: the music itself feels sad and hands us its emotion. But a melody has no mind. Treating a feelingless thing as if it had feelings is the pathetic fallacy — like calling a storm "angry." The sadness cannot literally live in the chords.',
      visual: '🌧️',
      highlight: 'pathetic fallacy',
    },
    {
      type: 'concept',
      title: 'Sounding Sad by Resembling Us',
      body: 'So Kivy and Davies offer the resemblance theory: music sounds sad because it mirrors sad human behaviour — slow, low, drooping, quiet, like a grieving voice or heavy walk. We hear that shape and recognise sadness, the way a basset hound\'s face simply looks sad.',
      visual: '🐶',
      highlight: 'resemblance theory',
    },
    {
      type: 'example',
      title: 'Hanslick Says: Not So Fast',
      scenario: 'In 1854 Eduard Hanslick attacked the whole idea. Music, he argued, expresses no definite emotion at all — only motion: rising, falling, hurrying, slowing. Its beauty is purely musical, tones in combination. We supply the "sadness"; the sounding forms themselves are just that, sounding forms in motion.',
      source: 'Eduard Hanslick, On the Musically Beautiful (1854)',
      emoji: '🎼',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-18-1',
      quote: 'Tonally moving forms are the sole content and object of music.',
      author: 'Eduard Hanslick',
      era: '1854',
      work: 'On the Musically Beautiful',
    },
    {
      type: 'question',
      prompt: 'A friend insists: "The music is sad because it literally feels sadness and passes that feeling to us." What is the best correction?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right — the melody feels sad and transmits its emotion to you', isCorrect: false },
          { id: 'b', text: 'No — music has no mind; it sounds sad by resembling slow, drooping human expression', isCorrect: true },
          { id: 'c', text: 'No — only the lyrics can ever be sad, never the music', isCorrect: false },
          { id: 'd', text: 'Right — every sad song proves the composer was sad while writing it', isCorrect: false },
        ],
        explanation: 'The trap is the pathetic fallacy: projecting feelings onto a thing that has none. A melody has no mind, so it cannot feel or "pass on" sadness. On the resemblance theory it merely sounds sad — by mirroring slow, low, quiet human movement and voice.',
      },
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'Sad music moves you. Where is the sadness?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'In the listener — the notes carry only a shape', isCorrect: true },
          { id: 'b', text: 'Inside the music itself, which is sad', isCorrect: false },
          { id: 'c', text: 'In the composer, at the moment of writing', isCorrect: false },
          { id: 'd', text: 'Nowhere; people only say they are moved', isCorrect: false },
        ],
        explanation: 'In the listener. A tune has contour, pace and direction, and those resemble how a person behaves when sad — that is what you recognise. But there is nobody inside the notes to be having an experience. It also explains why sad music is bearable and even sought out: you get the shape of grief without anything having gone wrong in your life.',
      },
    },
    {
      type: 'summary',
      title: 'Where the Sadness Lives',
      keyPoints: [
        'Music has no mind; it cannot literally feel',
        'Pathetic fallacy: feelings projected onto feelingless things',
        'Resemblance theory: it sounds sad like a grieving voice',
        'Hanslick: music expresses motion, not definite emotion',
      ],
      closingThought: 'The next adagio that moves you isn\'t mourning — it just moves like mourning does.',
    },
  ],
};

export default lesson;
