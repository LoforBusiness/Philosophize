import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-3',
  slug: 'why-humans-love-music-and-stories',
  title: 'Why Humans Love Music and Stories',
  description: 'Why music and stories show up in every culture, and what that tells us.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every human culture has made music and told stories.',
      subtext: 'That is not a coincidence. Philosophers have long asked what need they meet.',
      emoji: '🎵',
    },
    {
      type: 'concept',
      title: 'Catharsis: Why Sad Stories Feel Good',
      body: 'Aristotle noticed that tragedy makes audiences feel fear and pity, yet they leave feeling calmer, not worse. He called this "catharsis," a kind of emotional release. Stories let us feel strong emotions safely. We grieve through a character and face fears that are not really ours, then return unharmed.',
      visual: '🎭',
      highlight: 'catharsis',
    },
    {
      type: 'example',
      title: 'Aristotle and the Audience',
      scenario: 'In ancient Athens, thousands watched the play where Oedipus learns he has killed his father and married his mother. They cried, even though they chose to come. Aristotle saw them leave feeling lighter, not heavier. The strong emotions had been felt and released. Stories were already doing work we now expect from therapy.',
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
        explanation: 'Catharsis is Aristotle\'s word for the release tragedy gives us. After feeling fear and pity through the story, the audience leaves feeling cleared out and calmer, not drained.',
      },
    },
    {
      type: 'concept',
      title: 'Music Skips Past Reason',
      body: 'Music affects us in a way we cannot really argue with. A sad chord does not give reasons for the sadness it creates; it just creates it. Music reaches our feelings before our thinking can step in. Philosophers from Plato to Schopenhauer saw this as either music\'s greatest strength or its biggest risk.',
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
          { id: 'a', text: 'It stirs emotions before reason can judge them', isCorrect: true },
          { id: 'b', text: 'It lured workers away from their duties', isCorrect: false },
          { id: 'c', text: 'It cost too much to produce', isCorrect: false },
          { id: 'd', text: 'It required training most citizens could not afford', isCorrect: false },
        ],
        explanation: 'Plato worried that music reaches the emotions directly, before reason can weigh in. In the Republic he argued for controlling which kinds of music citizens heard, fearing the wrong music could shape their character without their noticing.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Art carries emotion, and so do music and stories.',
      body: 'Music and stories do this especially well because they unfold over time. A melody plays out in seconds, a story over hours. Both take you somewhere and bring you back a little changed. That experience is part of why every culture has them.',
      emoji: '🌍',
    },
    {
      type: 'summary',
      title: 'We Love Songs and Stories',
      keyPoints: [
        'Aristotle: tragedy lets us feel emotion safely, through catharsis',
        'Music reaches feeling before reason steps in',
        'Both are universal because they meet a real human need',
      ],
      closingThought: 'The next song that moves you connects to questions 2,400 years old.',
    },
  ],
};

export default lesson;
