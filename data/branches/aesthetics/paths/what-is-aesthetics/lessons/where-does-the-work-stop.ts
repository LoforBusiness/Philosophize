import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-41',
  slug: 'where-does-the-work-stop',
  title: 'Where Does the Work Stop?',
  description: 'The painting ends somewhere. The frame is the obvious candidate, and it is the one thing that refuses to be inside or out.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Point at the edge of the painting.',
      subtext: 'Now say whether your finger is on it or off it.',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Add-On',
      body: 'Kant had a word for things like frames and drapery. They are not parts of the work, since the work would still be that work without them. They are not simply outside it either, since they change how it is seen. He called them parerga — the things beside the work.',
      visual: '📏',
      highlight: 'the things beside the work',
    },
    {
      type: 'example',
      title: 'Everything Round the Edge',
      scenario: 'Once you start looking, the border keeps widening. The frame, the title, the wall card, the height it is hung at, the room, the fact that it is a museum at all. Each of them alters the picture, and none of them is paint.',
      source: 'Derrida on the parergon',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-41',
      quote: 'Even what is called ornamentation does not belong internally to the complete representation of the object, but only externally, as a complement.',
      author: 'Immanuel Kant',
      era: '1790',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'question',
      prompt: 'Which of these did Kant call a parergon?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The frame', isCorrect: true },
          { id: 'b', text: 'The painted canvas', isCorrect: false },
          { id: 'c', text: 'The wall behind it', isCorrect: false },
          { id: 'd', text: 'The gallery visitors', isCorrect: false },
        ],
        explanation: 'The frame. The canvas is the work, and the wall is plainly outside it — neither is puzzling. A parergon is precisely the thing that will not settle into either box, and a frame is the clearest case there is.',
      },
    },
    {
      type: 'question',
      prompt: 'So what is the frame?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Neither in nor out, and that is what it is for', isCorrect: true },
          { id: 'b', text: 'Part of the work, since it shapes how you see it', isCorrect: false },
          { id: 'c', text: 'Part of the room, since a curator can change it', isCorrect: false },
          { id: 'd', text: 'Irrelevant, since only the paint matters', isCorrect: false },
        ],
        explanation: 'Neither. Put it inside and a reframing becomes a new artwork, which nobody believes. Put it outside and you cannot explain why a gilt frame and a steel one make the same canvas read differently. Its job is to mark a boundary, and a boundary is not on either side of itself.',
      },
    },
    {
      type: 'summary',
      title: 'The Edge',
      keyPoints: [
        'Kant called frames and drapery parerga',
        'They are neither in the work nor simply outside it',
        'The border keeps widening — title, wall, museum',
        'A boundary cannot sit on one side of itself',
      ],
      closingThought: 'Next time something moves you in a gallery, ask how much of the effect was hung on the wall and how much was the wall.',
    },
  ],
};

export default lesson;
