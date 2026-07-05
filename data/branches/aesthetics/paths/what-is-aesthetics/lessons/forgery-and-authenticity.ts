import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-13',
  slug: 'forgery-and-authenticity',
  title: 'Why a Perfect Fake Still Bothers Us',
  description: 'If a forgery looks identical to the original, why do we feel cheated?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A flawless fake fools every expert. Still feel cheated?',
      subtext: 'Your eyes find no difference. Yet something in you objects.',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'Autographic Art',
      body: 'Nelson Goodman split art in two. Music is allographic: any correct performance is the real thing. Painting is autographic — the actual object, made by this hand at this time, matters. So a copy is never simply the original.',
      visual: '✍️',
      highlight: 'autographic',
    },
    {
      type: 'example',
      title: 'The Vermeer That Was a Fake',
      scenario: 'In the 1940s Han van Meegeren confessed: the "newly found" Vermeers experts had praised were his own forgeries. The paintings had not changed a brushstroke. But once the deception was known, the same canvases were suddenly seen as cheap imitations, not lost masterpieces.',
      source: 'The Van Meegeren forgery trial, 1947',
      emoji: '🕵️',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-13-1',
      quote: 'The pictures differ aesthetically even if no one will ever be able to tell them apart merely by looking at them.',
      author: 'Nelson Goodman',
      era: '1968',
      work: 'Languages of Art',
      philosopherId: 'nelson-goodman',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw two clues collide here.',
      body: 'Earlier the formalist said only the visible form matters. You also asked whether an artwork’s origin shapes its value. Forgery forces the question: can two identical-looking objects still differ in worth?',
      emoji: '🔍',
    },
    {
      type: 'dilemma',
      scenario:
        'An expert forgery is indistinguishable from a lost Vermeer — no test, no eye can separate them. We learn one is a fake painted last year, the other a genuine 1660s Vermeer. They look exactly alike. The question is whether that hidden difference changes their aesthetic worth at all.',
      prompt: 'Is the forgery aesthetically lesser than the original?',
      choices: [
        { id: 'same', label: 'No — identical to the eye, identical in value' },
        { id: 'lesser', label: 'Yes — knowing it is a fake changes everything' },
      ],
      views: [
        {
          thinker: 'Nelson Goodman',
          stance: 'they are aesthetically different',
          why: 'Knowing one is a forgery trains how you look at both, sharpening attention for the future. Provenance and that knowledge enter the aesthetic experience even before any visible difference appears.',
        },
        {
          thinker: 'A Strict Formalist',
          stance: 'a perfect copy is just as good',
          why: 'As you saw earlier, only the visible arrangement of line and colour can carry aesthetic value. If two canvases look identical, nothing aesthetic separates them — origin is mere history.',
        },
        {
          thinker: 'Alfred Lessing',
          stance: 'the flaw is moral, not perceptual',
          why: 'The forgery looks just as beautiful. Its real failing is deception and a lack of originality — it copied rather than created. That is a moral and historical fault, not an aesthetic one.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'Goodman says even an undetectable forgery can be aesthetically lesser. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'True. For Goodman, knowing a work is a forgery shapes how you look at it going forward, so the two pictures differ aesthetically even when no eye can yet tell them apart.',
      },
    },
    {
      type: 'question',
      prompt: 'Why does the strict formalist deny that a perfect forgery is aesthetically lesser?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because aesthetic value lives only in the visible form, not in origin', isCorrect: true },
          { id: 'b', text: 'Because forgeries are usually more beautiful than originals', isCorrect: false },
          { id: 'c', text: 'Because the forger worked harder than the original artist', isCorrect: false },
          { id: 'd', text: 'Because no expert can ever truly be fooled by a fake', isCorrect: false },
        ],
        explanation: 'Option C tempts you to commit the genetic fallacy — judging a work by where it came from (who made it, how hard they toiled) rather than by what it is. The formalist rejects that move: if the visible form is identical, the aesthetic value is identical, and provenance is just history.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Autographic art ties value to the actual object',
        'Goodman: knowing a forgery changes how you look',
        'Formalists: only visible form carries value',
        'Lessing: the fault is moral, not perceptual',
      ],
      closingThought: 'A perfect fake exposes how much we value history we cannot see.',
    },
  ],
};

export default lesson;
