import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-8, "Form Versus Expression" — formalism (Clive
// Bell's "significant form") against expression theory (Tolstoy, Collingwood),
// taught with ONE canvas and TWO pairs of glasses.
//
// The figure walks between a lens rack on the wall (stage left) and a spot out in
// front of the canvas (stage right). Put on the first pair and the canvas redraws
// itself as clean geometric blocks on a grid; swap pairs and the same canvas
// redraws as loose sweeping strokes. That crossfade IS the lesson: one object,
// two true descriptions.
//
// Q1 is answered on the two lens cards in the stage — tapping one actually
// switches the canvas rendering. Q2 is A/B/C/D. Both theories are named only AFTER
// the reader has already looked through both pairs.

export interface Aes8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 68 = at the lens rack · 148 = out front of the canvas. */ x?: number;
  /** How the canvas renders: 0 plain · 1 geometric FORM · 2 loose FEELING · 3 both at once. */ mode?: number;
  /** Which pair is off the rack: 0 none · 1 shapes · 2 feeling. */ lens?: number;
  /** The mode the canvas switches to once THIS beat's question is answered. */ modeAns?: number;
  /** 1 = the two lens cards are live in the stage (Q1). */ pick?: number;
  /** 1 = a leader runs from each reading back to the one canvas both are judging. */ sameTag?: number;
  /** 1 = each branch of the diagram is enclosed: each reason is a theory of its own. */ theoryTag?: number;
  /** 1 = a viewfinder stands on one region of the canvas: what you attend to, not what is there. */ attendTag?: number;
  /** 1 = what the picture depicts is struck out under the canvas: it plays no part. */ ignoredTag?: number;
  /** 1 = a "not equal" mark stands between the two readings: two paintings, one canvas. */ differentTag?: number;
  /** 1 = an arrow carries the feeling off the canvas toward whoever is looking. */ moodTag?: number;
  /** 1 = the canvas is measured across and down: the arrangement is what is left. */ irrelevantTag?: number;
  /** 1 = a mark is found ON the canvas, where the painter came upon the feeling. */ discoveredTag?: number;
}

export const BEATS: Aes8Beat[] = [
  {
    p: 164, x: 148, mode: 0, lens: 0,
    text: 'Two people admire the same painting. One says it succeeds because of how its shapes are arranged.',
    dur: 2.2,
  },
  {
    p: 164, x: 148, mode: 0, lens: 0, sameTag: 1,
    text: 'The other says it succeeds because it expresses a feeling. Both are judging the same canvas.',
    dur: 1.8,
  },
  {
    p: 164, x: 148, mode: 0, lens: 0, theoryTag: 1,
    text: 'Each reason corresponds to a different theory of what makes art valuable.',
    dur: 1.8,
  },
  {
    p: 275, x: 68, mode: 0, lens: 1,
    text: 'Each view can be pictured as a pair of glasses, and a pair for each hangs on the wall. Consider the first pair.',
    cite: 'The first pair',
    dur: 2.4,
  },
  {
    p: 275, x: 68, mode: 0, lens: 1, attendTag: 1,
    text: 'The glasses change nothing in the painting. They change which of its features you attend to.',
    dur: 1.8,
  },
  {
    p: 47, x: 148, mode: 1, lens: 1,
    text: 'Through the first pair, the painting is pure arrangement. What matters is how blocks, edges and shapes relate to one another.',
    cite: 'Through the first pair',
    dur: 3.1,
  },
  {
    p: 267, x: 148, mode: 1, lens: 1, ignoredTag: 1,
    text: 'What the picture represents plays no part in this way of seeing.',
    dur: 1.8,
  },
  {
    p: 273, x: 68, mode: 0, lens: 2,
    text: 'A second pair of glasses hangs on the same wall, for the second viewer.',
    cite: 'The second pair',
    dur: 1.8,
  },
  {
    p: 273, x: 68, mode: 0, lens: 2, differentTag: 1,
    text: 'This pair picks out different features, so the same canvas presents a different painting.',
    dur: 2.2,
  },
  {
    p: 130, x: 148, mode: 2, lens: 2,
    text: 'Through the second pair, the blocks dissolve into expressive strokes. Proportions and edges no longer matter.',
    cite: 'Through the second pair',
    dur: 1.8,
  },
  {
    p: 130, x: 148, mode: 2, lens: 2, moodTag: 1,
    text: 'What matters now is the feeling the strokes convey, as if the painter had passed on a mood.',
    dur: 2.8,
  },
  {
    p: 165, x: 68, mode: 0, lens: 0, pick: 1,
    interact: {
      prompt: 'A viewer can’t tell what a mosaic depicts, yet calls it great art. Which pair is she using?',
      explain: 'Look at the shapes. The viewer can’t tell what the mosaic depicts, so its subject can’t explain her verdict. The arrangement of lines and blocks can, and the first pair picks that out.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 168, x: 148, mode: 1, lens: 1,
    text: 'The first way of looking is called formalism. Clive Bell claimed that all genuine works of visual art share a single quality.',
    cite: 'Formalism · Clive Bell',
    dur: 2.6,
  },
  {
    p: 418, x: 148, mode: 1, lens: 1, irrelevantTag: 1,
    text: 'Bell called it significant form, an arrangement of lines and colours that stirs aesthetic emotion. Subject matter is irrelevant.',
    dur: 2.6,
  },
  {
    p: 456, x: 148, mode: 1, lens: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-8-1',
      text: 'These relations and combinations of lines and colours, these aesthetically moving forms, I call Significant Form.',
      author: 'Clive Bell',
      work: 'Art',
      era: '1914',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 272, x: 68, mode: 2, lens: 2,
    text: 'The second way of looking is the expression theory. Tolstoy held that art transmits a feeling from one person to others.',
    cite: 'Expression theory · Tolstoy',
    dur: 2.9,
  },
  {
    p: 272, x: 68, mode: 2, lens: 2, discoveredTag: 1,
    text: 'Collingwood developed a different version. A painter, he held, often discovers the feeling only in the act of painting.',
    dur: 2.1,
  },
  {
    p: 447, x: 148, mode: 2, lens: 2, modeAns: 3,
    interact: {
      prompt: 'What is the relation between formalism and the expression theory?',
      sort: {
        chip: 'formalism and expression',
        bins: [
          { id: 'form', label: 'formalism alone', reads: 'formalism is right and expression is wrong' },
          { id: 'expr', label: 'expression alone', reads: 'expression is right and formalism is wrong' },
          { id: 'both', label: 'different questions', reads: 'they answer two different questions', correct: true },
        ],
      },
      explain: 'Different questions. Formalism asks how a work’s lines and colours are arranged. The expression theory asks what feeling the work conveys. As complete definitions of art they conflict, but as ways of looking they can both apply to one canvas.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Formalism and Expression',
      points: [
        'Formalism: art is significant form',
        'Bell: subject matter is irrelevant to art',
        'Expression theory: art conveys a feeling',
        'One canvas can be read both ways',
      ],
      closing: 'When a painting moves you, ask whether you’re responding to its form or to its feeling.',
    },
    dur: 3,
  },
];
