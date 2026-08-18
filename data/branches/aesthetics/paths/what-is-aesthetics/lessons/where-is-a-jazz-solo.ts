import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-37',
  slug: 'where-is-a-jazz-solo',
  title: 'Where Is a Jazz Solo?',
  description: 'A symphony survives its performance. A solo is the performance.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Burn every copy of a symphony and it still exists.',
      subtext: 'Do that to an improvisation.',
      emoji: '🎷',
    },
    {
      type: 'concept',
      title: 'The Work and the Performance',
      body: 'A composed piece is usually treated as a structure that performances instantiate — get it wrong and you played the piece badly. An improvisation has no structure standing behind it, so there is nothing to get wrong and nothing left over.',
      visual: '🎼',
      highlight: 'nothing left over',
    },
    {
      type: 'example',
      title: 'What the Recording Changed',
      scenario: 'Once solos could be recorded, players began learning them note for note. A thing meant to happen once became a text with a canonical version — and playing it correctly became possible, which it had never been before.',
      source: 'Gould & Keaton, "The Essential Role of Improvisation" (2000)',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-37',
      quote: 'The improviser makes the work in the act of performing it.',
      author: 'Philip Alperson',
      era: '1984',
    },
    {
      type: 'question',
      prompt: 'What is the key difference the improvisation case exposes?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whether the work exists independently of any particular performance', isCorrect: true },
          { id: 'b', text: 'Whether the music was written down before it was played', isCorrect: false },
          { id: 'c', text: 'Whether the performer is also the composer', isCorrect: false },
          { id: 'd', text: 'Whether the audience can tell it was improvised', isCorrect: false },
        ],
        explanation: 'Notation and authorship usually travel with the distinction but neither is it. The question is ontological: is there something the performance is a performance OF, or is the performance the whole of it?',
      },
    },
    {
      type: 'question',
      prompt: 'Someone transcribes a famous solo and plays it perfectly. What are they playing?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A composed piece now — the improvising is exactly what cannot be repeated', isCorrect: true },
          { id: 'b', text: 'The same improvisation, performed again', isCorrect: false },
          { id: 'c', text: 'A forgery of the original performance', isCorrect: false },
          { id: 'd', text: 'Nothing at all — it is a copy, not a work', isCorrect: false },
        ],
        explanation: 'The notes survive the transcription and the making-it-up does not. What they play is a piece with an unusual history: it began as a thing being decided and is now a thing being followed.',
      },
    },
    {
      type: 'summary',
      title: 'Made While You Watch',
      keyPoints: [
        'A score stands behind its performances',
        'An improvisation has nothing standing behind it',
        'So the performance is the work, not a copy of it',
        'Transcribing it makes it a composition',
      ],
      closingThought: 'It is the only art form where being present at the making is not a privilege but the only way the thing exists at all.',
    },
  ],
};

export default lesson;
