import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-3',
  slug: 'why-humans-love-music-and-stories',
  title: 'Why Humans Love Music and Stories',
  description: 'Uncover why music and stories appear in every human culture — and what that reveals about us.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every culture that ever lived has sung and told stories.',
      subtext: 'That is no accident — it is one of philosophy\'s most haunting puzzles.',
      emoji: '🎵',
    },
    {
      type: 'concept',
      title: 'Catharsis: Stories as Emotional Gym',
      body: 'Aristotle saw that tragedy stirred fear and pity in its audience — then sent them home strangely calm, unburdened. He named this catharsis. Stories let us rehearse our fiercest emotions where nothing can wound us. We grieve through a character, brave our fears in theirs, and return having felt something real without facing any danger.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle and the Audience',
      scenario: 'In an Athenian theater, thousands watched Oedipus learn he had killed his father and married his mother. They wept — and yet they had come freely to weep. Aristotle saw them leave lighter, not heavier: the horror had passed through them and been released. Story was doing, long before, the quiet work that therapy would one day try to name.',
      source: 'Aristotle, Poetics (c. 335 BCE)',
      emoji: '🏟️',
    },
    {
      type: 'question',
      prompt: 'What did Aristotle call the emotional release audiences feel after a tragic story?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Catharsis', isCorrect: true },
          { id: 'b', text: 'Mimesis', isCorrect: false },
          { id: 'c', text: 'Logos', isCorrect: false },
          { id: 'd', text: 'Eudaimonia', isCorrect: false },
        ],
        explanation: 'Catharsis is Aristotle\'s word for the cleansing that tragedy works in us. Having lived through fear and pity by way of fiction, the audience departs not drained but restored — emptied of something and quietly made whole.',
      },
    },
    {
      type: 'concept',
      title: 'Music Bypasses Reason',
      body: 'Music is a strange power: you cannot argue with it. A minor chord offers no reasons for the sorrow it summons — it simply summons it. Music slips past the watchful mind and reaches the feelings before thought can intervene. From Plato to Schopenhauer, philosophers saw in this either its deepest glory or its gravest danger.',
      visual: '🎸',
      highlight: 'pre-rational emotion',
    },
    {
      type: 'question',
      prompt: 'Why did Plato worry about music\'s power in a just society?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It moves the passions before reason can judge them', isCorrect: true },
          { id: 'b', text: 'It lured workers away from their duties', isCorrect: false },
          { id: 'c', text: 'It cost too much to produce', isCorrect: false },
          { id: 'd', text: 'It demanded training the common citizen could not afford', isCorrect: false },
        ],
        explanation: 'Plato was sincerely uneasy that music slips past reason and stirs the passions directly. In the Republic he urged strict rule over which modes citizens might hear, fearing the wrong music could shape character before the mind had any chance to object.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw that art carries emotion across time.',
      body: 'Music and stories carry it most powerfully of all — not because they are the prettiest of the arts, but because they live inside time itself. A melody unfurls in seconds, a tale across hours. Each takes you somewhere and returns you altered. That small journey is why they belong to everyone.',
      emoji: '🌍',
    },
    {
      type: 'summary',
      title: 'We Are Story-Telling, Song-Loving Animals',
      keyPoints: [
        'Aristotle: tragedy lets us rehearse emotion safely, through catharsis',
        'Music slips past reason and strikes feeling directly',
        'Both are universal because they answer something deep in us',
      ],
      closingThought: 'The next song that moves you carries 2,400 years of philosophy inside it.',
    },
  ],
};

export default lesson;
