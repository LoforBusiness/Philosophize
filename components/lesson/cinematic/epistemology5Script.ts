import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-5, "Why Are Humans Driven to Know?"
// Theme: A STUDY AT NIGHT, A LADDER OF KNOWLEDGE, A WINDOW, AND THE HILL UNDER THE MOON.
//
// In a study at night he reads Aristotle's book, and the library ladder by the
// bookcase takes the names of its rungs, WISDOM at the top. He opens the window and a
// bird on the sill flies off into the night; he leans on the sill for the joy of
// seeing, and SENSATION lights on the bottom rung. Then the camera goes into the moon
// in the window and comes out of it over a hill: under the stars wonder turns to
// perplexity and the stars join into a question mark, and for Bacon a windmill on the
// far hill starts to turn.
//
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every line, citation, quotation and summary point is copied from
// the previous script by a generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi5Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 224 by the side table and 262 at the window in the study · 190 on the hill. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'read' | 'pages' | 'ladder' | 'free' | 'gaze' | 'sense' | 'enter' | 'ask' | 'mill' | 'compare';
  /** He holds Aristotle's book. */ book?: boolean;
  /** The ladder's rungs are named, WISDOM at the top. */ rungs?: boolean;
  /** The window is open and the bird has flown: FREE, beside WISDOM. */ free?: boolean;
  /** SENSATION, the bottom rung, is lit. */ sense?: boolean;
  /** He is on the hill under the moon, not in the study (the scene change is the beat that sets it). */ hill?: boolean;
  /** The stars have joined into a question mark. */ ask?: boolean;
  /** The windmill is turning and lit: POWER. */ mill?: boolean;
  /** The last question, on the stage: the moon for Aristotle, the windmill for Bacon. */ q2?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Epi5Beat[] = [
  {
    p: 158, x: 224, act: 'read', book: true,
    text: 'Aristotle opens his Metaphysics with a claim about human nature. He writes that “all men by nature desire to know”.',
    dur: 2.6,
  },
  {
    p: 158, x: 224, act: 'pages', book: true,
    text: 'On this view, nobody needs to be taught to want knowledge. The desire comes with being human.',
    dur: 1.8,
  },
  {
    p: 158, x: 224, act: 'ladder', rungs: true,
    text: 'Aristotle ranks the kinds of knowledge. The highest, wisdom, isn’t valued for its usefulness but is sought for its own sake.',
    cite: 'Aristotle, Metaphysics, Book One',
    dur: 3.2,
  },
  {
    p: 158, x: 262, act: 'free', rungs: true, free: true,
    text: 'Aristotle calls wisdom the only free science. Just as a free person exists for their own sake, so does wisdom.',
    dur: 1.8,
  },
  {
    p: 158, x: 262, act: 'gaze', rungs: true, free: true,
    text: 'Aristotle offers evidence from ordinary life: people delight in their senses, and above all in sight.',
    cite: 'The joy of sight',
    dur: 1.8,
  },
  {
    p: 158, x: 262, act: 'sense', rungs: true, free: true, sense: true,
    text: 'People enjoy seeing even when it serves no purpose. Sensation is the lowest rung of Aristotle’s ladder of knowledge.',
    dur: 3,
  },
  {
    p: 158, x: 190, act: 'enter', rungs: true, free: true, sense: true, hill: true, tour: [],
    text: 'Plato and Aristotle both hold that philosophy begins in wonder. Plato says so in the Theaetetus, Aristotle in the Metaphysics.',
    cite: 'Thaumazein — wonder',
    dur: 2.2,
  },
  {
    p: 158, x: 190, act: 'ask', rungs: true, free: true, sense: true, hill: true, ask: true,
    text: 'Aristotle links wonder to perplexity. Someone puzzled by what they can’t explain becomes aware of their own ignorance.',
    dur: 2.6,
  },
  {
    p: 158, x: 190, act: 'mill', rungs: true, free: true, sense: true, hill: true, ask: true, mill: true,
    text: 'Nearly two thousand years later, Francis Bacon gave knowledge a new purpose. For Bacon, knowledge is worth having for the power it gives over nature.',
    cite: 'Knowledge as power',
    dur: 3.4,
  },
  {
    p: 167, x: 190, act: 'compare', rungs: true, free: true, sense: true, hill: true, ask: true, mill: true,
    text: 'Aristotle prized understanding nature for its own sake. Bacon prized knowledge that could be used to control nature.',
    dur: 1.8,
  },
  {
    p: 263, x: 190, rungs: true, free: true, sense: true, hill: true, ask: true, mill: true,
    quote: {
      id: 'lq-epistemology-knowledge-5-1',
      text: 'Knowledge itself is power.',
      author: 'Francis Bacon',
      philosopherId: 'francis-bacon',
      work: 'Meditationes Sacrae',
      era: '1597',
      branchSlugs: ['epistemology'],
    },
    dur: 3,
  },
  {
    p: 260, x: 190, rungs: true, free: true, sense: true, hill: true, ask: true, mill: true,
    interact: {
      prompt: 'As a person grows, which shape does the desire to know take?',
      plot: {
        cols: ['INFANT', 'CHILD', 'ADULT'],
        axis: 'THE DESIRE TO KNOW',
        start: [
          0.3,
          0.3,
          0.3,
        ],
        shapes: [
          { id: 'born', profile: [0.85, 0.88, 0.86, 0.89, 0.87], reads: 'there from the start', correct: true },
          { id: 'taught', profile: [0.05, 0.25, 0.5, 0.75, 0.95], reads: 'put there by teaching' },
          { id: 'mixed', profile: [0.4, 0.5, 0.6, 0.7, 0.8], reads: 'a little innate, mostly taught' },
        ],
      },
      explain: 'There from the start. Aristotle opens the Metaphysics with the claim that all human beings by nature desire to know, and offers the delight taken in the senses for its own sake as evidence. Teaching shapes it; it doesn\'t install it.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 190, rungs: true, free: true, sense: true, hill: true, ask: true, mill: true, q2: true,
    interact: {
      prompt: 'Which of these thinkers valued knowledge as a means of controlling nature?',
      explain: 'Francis Bacon. He valued knowledge for the power it gives over nature. Aristotle held the opposite view: the highest knowledge is sought for its own sake, whatever its use.',
      xp: 5,
    },
    dur: 1,
  },
  {
    rungs: true, free: true, sense: true, hill: true, ask: true, mill: true,
    summary: {
      title: 'The Human Drive to Know',
      points: [
        'Aristotle: the desire to know is part of human nature',
        'Wisdom, sought for its own sake, is the free science',
        'Philosophy begins in wonder, or thaumazein',
        'Bacon valued knowledge for its power over nature',
      ],
      closing: 'The question remains whether knowledge is valuable in itself, as Aristotle held, or for its uses, as Bacon held.',
    },
    dur: 2.8,
  },
];
