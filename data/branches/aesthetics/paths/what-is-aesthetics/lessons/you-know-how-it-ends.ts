import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-38',
  slug: 'you-know-how-it-ends',
  title: 'You Know How It Ends',
  description: 'You have seen this film. You know he gets out. Your shoulders are up round your ears anyway, and that should not be possible.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You have seen it. You are still tense.',
      subtext: 'Suspense is supposed to need not knowing.',
      emoji: '🎞️',
    },
    {
      type: 'concept',
      title: 'The Paradox of Suspense',
      body: 'Three things look true and cannot all be. You know how it ends. You feel the suspense anyway. And suspense requires uncertainty about the ending. Something in that list has to go, and the first two are things you can check on yourself tonight.',
      visual: '😬',
      highlight: 'Something in that list has to go',
    },
    {
      type: 'example',
      title: 'The Second Watch',
      scenario: 'Greek audiences knew every myth before the play began. Nobody in the theatre wondered whether Oedipus would find out. The tension was not in the news of what happened; it was in watching it arrive. Whatever suspense runs on, it kept running on a story that had been finished for centuries.',
      source: 'the audiences of Athens, and yours on a rewatch',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-38',
      quote: 'That willing suspension of disbelief for the moment, which constitutes poetic faith.',
      author: 'Samuel Taylor Coleridge',
      era: '1817',
    },
    {
      type: 'question',
      prompt: 'Which of the three claims has to go?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Suspense requires uncertainty about the ending', isCorrect: true },
          { id: 'b', text: 'You know how it ends', isCorrect: false },
          { id: 'c', text: 'You feel the suspense anyway', isCorrect: false },
          { id: 'd', text: 'All three can be kept if you try', isCorrect: false },
        ],
        explanation: 'The theory goes, because the other two are observations. You can check that you know the ending, and you can feel your own shoulders. When a paradox holds two facts and one assumption, the assumption is what gives.',
      },
    },
    {
      type: 'question',
      prompt: 'So what is suspense actually running on?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Something at stake, attended to as it unfolds', isCorrect: true },
          { id: 'b', text: 'Genuinely forgetting the ending each time', isCorrect: false },
          { id: 'c', text: 'A mistake your brain keeps making', isCorrect: false },
          { id: 'd', text: 'Nothing — the feeling is only remembered', isCorrect: false },
        ],
        explanation: 'Caring about an outcome, held in front of you moment by moment. Forgetting is the tempting answer and it fails a simple test: you can recite the ending during the scene and still feel it. And calling the feeling a memory does not explain why it arrives on cue.',
      },
    },
    {
      type: 'summary',
      title: 'Knowing and Feeling',
      keyPoints: [
        'Suspense survives knowing exactly what happens',
        'Two of the three claims are things you can check',
        'So the theory of suspense is what gives way',
        'Stakes and attention do the work uncertainty was credited with',
      ],
      closingThought: 'It explains why a story you love holds up on a fifth reading, and why a spoiler ruins less than people fear. What you lose is surprise, and surprise was never the same thing.',
    },
  ],
};

export default lesson;
