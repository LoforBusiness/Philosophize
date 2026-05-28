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
      headline: 'Every culture in history has had music and stories.',
      subtext: 'This is not a coincidence — it is one of philosophy\'s deepest puzzles.',
      emoji: '🎵',
    },
    {
      type: 'concept',
      title: 'Catharsis: Stories as Emotional Gym',
      body: 'Aristotle noticed that Greek tragedies made audiences feel fear and pity — then left them feeling purged and calm. He called this catharsis. Stories let us rehearse powerful emotions in a safe space. We grieve with characters, face our fears through theirs, and emerge having processed something real without real danger.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle and the Audience',
      scenario: 'At an Athenian tragedy, thousands watched Oedipus discover he had unknowingly killed his father and married his mother. The audience wept — yet they chose to be there. Aristotle argued they left feeling lighter, not heavier. The horror had moved through them and been released. Story had done what therapy could not yet name.',
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
        explanation: 'Catharsis is Aristotle\'s term for the emotional purging that tragedy produces. After experiencing fear and pity through fiction, audiences feel cleansed and restored rather than drained.',
      },
    },
    {
      type: 'concept',
      title: 'Music Bypasses Reason',
      body: 'Music is strange. You cannot argue with it. A minor chord does not explain why it makes you feel melancholy — it just does. Music reaches directly into emotion before thought can intercept it. Philosophers from Plato to Schopenhauer saw this as either music\'s greatest power or its greatest danger.',
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
          { id: 'a', text: 'It stirs emotions before reason can evaluate them', isCorrect: true },
          { id: 'b', text: 'It distracted workers from their duties', isCorrect: false },
          { id: 'c', text: 'It was too expensive to produce', isCorrect: false },
          { id: 'd', text: 'It required training the average citizen could not afford', isCorrect: false },
        ],
        explanation: 'Plato was genuinely alarmed that music bypasses rational thought and moves emotions directly. In the Republic, he wanted strict control over which musical modes citizens could hear, because the wrong music could corrupt character before the mind could object.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw that art transmits emotion across time.',
      body: 'Music and stories do this most powerfully — not because they are the prettiest art forms, but because they work with time itself. A melody unfolds in seconds. A story unfolds over hours. Both take you somewhere and bring you back changed. That journey is what makes them universal.',
      emoji: '🌍',
    },
    {
      type: 'summary',
      title: 'We Are Story-Telling, Song-Loving Animals',
      keyPoints: [
        'Aristotle: stories provide safe emotional rehearsal via catharsis',
        'Music bypasses reason and hits emotion directly',
        'Both are universal because they serve deep human needs',
      ],
      closingThought: 'The next song that moves you is 2,400 years of philosophy in action.',
    },
  ],
};

export default lesson;
