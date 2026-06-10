import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-10',
  slug: 'the-hidden-premise',
  title: 'The Premise Nobody Said',
  description: 'Most arguments hide a premise. Drag it into the light to judge it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Most arguments leave a key premise unsaid.',
      subtext: 'Find the hidden assumption and you find where to push back.',
      emoji: '🕵️',
    },
    {
      type: 'concept',
      title: 'The Enthymeme',
      body: 'An enthymeme is an argument with a premise left unstated — usually one too obvious or too convenient to say. "Socrates is a man, so he\'s mortal" hides "all men are mortal."',
      visual: '🧩',
      highlight: 'a premise left unstated',
    },
    {
      type: 'example',
      title: 'Dragging It Into the Light',
      scenario: '"He\'s rich, so he must be happy." Stated like that, it sounds plausible. But the hidden premise is "all rich people are happy" — and once you say it aloud, you can challenge it.',
      source: 'Aristotle, Rhetoric, c. 350 BCE',
      emoji: '💡',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-10',
      quote: 'The enthymeme is a kind of syllogism, and the body of all proof.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Rhetoric',
    },
    {
      type: 'question',
      prompt: '"You should sleep more — you look exhausted." What premise is hidden?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Looking exhausted means you need more sleep', isCorrect: true },
          { id: 'b', text: 'Everyone should sleep eight hours', isCorrect: false },
          { id: 'c', text: 'You never sleep enough', isCorrect: false },
          { id: 'd', text: 'Sleep is good for health', isCorrect: false },
        ],
        explanation: 'The unstated bridge is that looking tired signals a sleep need — supply that and the inference stands or falls.',
      },
    },
    {
      type: 'question',
      prompt: 'An argument leaves one premise unstated. Does that alone make it a fallacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — a true, obvious hidden premise can be perfectly valid', isCorrect: true },
          { id: 'b', text: 'Yes — every missing premise is a logical error', isCorrect: false },
          { id: 'c', text: 'Yes — hiding a premise is always deceptive', isCorrect: false },
          { id: 'd', text: 'Yes — only fully stated arguments can be valid', isCorrect: false },
        ],
        explanation: 'Enthymemes are normal and often sound; the danger is only when the hidden premise is false — so surface it and check.',
      },
    },
    {
      type: 'summary',
      title: 'The Hidden Premise Revealed',
      keyPoints: [
        'Enthymemes leave one premise unstated',
        'The hidden premise is where weakness hides',
        'Say it aloud, then judge if it\'s true',
        'A missing premise isn\'t automatically a fallacy',
      ],
      closingThought: 'You can now dissect any argument — stated or not. Logic mastered, link by link.',
    },
  ],
};

export default lesson;
