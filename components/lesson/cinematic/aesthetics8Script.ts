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
}

export const BEATS: Aes8Beat[] = [
  {
    p: 164, x: 148, mode: 0, lens: 0,
    text: 'Two people stare at the same painting. One says it works because of the shapes.',
    dur: 2.2,
  },
  {
    p: 164, x: 148, mode: 0, lens: 0,
    text: 'The other says it works because it aches. Same canvas.',
    dur: 1.8,
  },
  {
    p: 164, x: 148, mode: 0, lens: 0,
    text: 'Two completely different reasons.',
    dur: 1.8,
  },
  {
    p: 24, x: 68, mode: 0, lens: 1,
    text: 'Luckily there is a pair of glasses on the wall for each of them. Take the first pair down.',
    cite: 'The first pair',
    dur: 2.4,
  },
  {
    p: 24, x: 68, mode: 0, lens: 1,
    text: 'Nothing mystical — they just change what you notice.',
    dur: 1.8,
  },
  {
    p: 47, x: 148, mode: 1, lens: 1,
    text: 'Through these, the painting is pure arrangement. A block here, an edge there, one shape leaning on another.',
    cite: 'Through the first pair',
    dur: 3.1,
  },
  {
    p: 47, x: 148, mode: 1, lens: 1,
    text: 'Whatever it is a picture OF has gone completely quiet.',
    dur: 1.8,
  },
  {
    p: 31, x: 68, mode: 0, lens: 2,
    text: 'Hang those up. There is a second pair on the same wall.',
    cite: 'The second pair',
    dur: 1.8,
  },
  {
    p: 31, x: 68, mode: 0, lens: 2,
    text: 'It is about to show you a different painting, on exactly the same canvas.',
    dur: 2.2,
  },
  {
    p: 130, x: 148, mode: 2, lens: 2,
    text: 'Now the blocks dissolve into strokes. You are not measuring anything.',
    cite: 'Through the second pair',
    dur: 1.8,
  },
  {
    p: 130, x: 148, mode: 2, lens: 2,
    text: 'You are catching a mood, as if the painter handed you what they were feeling that afternoon.',
    dur: 2.8,
  },
  {
    p: 4, x: 68, mode: 0, lens: 0, pick: 1,
    interact: {
      prompt: 'She cannot read what the mosaic shows, yet calls it great art. Tap the pair she uses.',
      explain: 'She has no idea what the story is, so the story cannot be what moved her. Whatever did the work was the arrangement itself — the lines, the blocks, and the way they sit against each other.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 148, mode: 1, lens: 1,
    text: 'That way of looking has a name: formalism. Clive Bell claimed every real work of visual art shares one thing.',
    cite: 'Formalism · Clive Bell',
    dur: 2.6,
  },
  {
    p: 418, x: 148, mode: 1, lens: 1,
    text: 'Bell called it significant form: an arrangement of line and colour that moves you. The subject is beside the point.',
    dur: 2.6,
  },
  {
    p: 137, x: 148, mode: 1, lens: 1,
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
    p: 37, x: 68, mode: 2, lens: 2,
    text: 'The second pair has a name too. Tolstoy said art is one person handing a feeling to another.',
    cite: 'Expression theory · Tolstoy',
    dur: 2.9,
  },
  {
    p: 37, x: 68, mode: 2, lens: 2,
    text: 'Collingwood added that the painter often only finds the feeling by painting it.',
    dur: 2.1,
  },
  {
    p: 45, x: 148, mode: 2, lens: 2, modeAns: 3,
    interact: {
      prompt: 'Set the lever to what to say about the two theories.',
      lever: {
        start: 0,
        stops: [
          { id: 'form', reads: 'formalism is right and expression is wrong' },
          { id: 'expr', reads: 'expression is right and formalism is wrong' },
          { id: 'both', reads: 'they are answering two different questions', correct: true },
        ],
      },
      explain: 'The far setting. Rival theories sound like a fight, so it feels as though somebody has to win. Formalism asks how a work is put together. Expression asks what got carried across. Same canvas, different questions — which is why good critics use both in a paragraph.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Pairs of Glasses',
      points: [
        'Formalism: art is significant form',
        'Bell: the subject barely matters',
        'Expression: art hands over a feeling',
        'One canvas answers to both readings',
      ],
      closing: 'Next time a painting grips you, ask which pair you had on.',
    },
    dur: 3,
  },
];
