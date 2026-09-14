import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-35, "The Zebra and the Painted Mule"
// Theme: TWO PENS, ONE PICTURE, AND A QUESTION THAT ONLY LOOKS EASY.
//
// The reader sees two animals in two pens. They are drawn IDENTICALLY — same
// stripes, same body — because that is the whole point: the evidence a visitor
// actually has does not distinguish them. Only the plaques differ, and the
// plaques are what the reader is asked to trust.
//
// The chain of closure is then drawn as three plates linked in a row, and the
// middle link is the one that will not hold.
//
// GAMIFIED SHAPE, three different asks:
//   · beat 2  a DRAG — how far-fetched does an alternative have to be before your
//     evidence counts as excluding it? The readout is the lesson.
//   · beat 5  a SCENE TARGET — tap the link in the chain that gives way.
//   · beat 7  two CARDS — keep closure, or keep the easy "zebra".
//
// The drag comes FIRST here on purpose. Every other lesson in this round asks a
// pick before a slide, and a reader doing several in a row should not be able to
// predict the shape of the next one.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two pens are drawn. */ pens?: number;
  /** 1 = the plaques under the pens are legible. */ plaques?: number;
  /** 1 = the three-plate closure chain is drawn above. */ chain?: number;
  /** 1 = the middle link is shown parting. */ gap?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = the drag rail drives how far the "relevant" fence stands. */ scan?: number;
}

export const BEATS: Epistemology35Beat[] = [
  {
    p: 172, x: 58, pens: 1,
    text: 'Suppose you see a striped animal in a zoo pen labelled “zebra”. You know at a glance that it’s a zebra.',
    dur: 3.6,
  },
  {
    p: 467, x: 58, pens: 1, plaques: 1, scan: 1, live: 1,
    interact: {
      prompt: 'How far-fetched must an alternative be before you needn’t rule it out?',
      drag: {
        lo: 'RULE OUT NOTHING',
        hi: 'RULE OUT EVERYTHING',
        start: 0.2,
        zones: [
          { id: 'lax', upto: 0.3, reads: 'a painted mule needn’t be ruled out' },
          { id: 'ok', upto: 0.72, reads: 'rule out only the likely alternatives', correct: true },
          { id: 'mad', upto: 1, reads: 'rule out holograms and dreams too' },
        ],
      },
      explain: 'Rule out only the likely alternatives. Requiring every alternative to be ruled out would leave no knowledge at all. Requiring none would make knowledge too easy. The hard part is saying where the line falls.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'Fred Dretske used this case to test a principle about knowledge.',
    dur: 1.8,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'If you know a claim and know that it rules out another, you know that the other is false.',
    dur: 2,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'The principle is called epistemic closure, because knowledge is closed under known entailment.',
    dur: 1.8,
  },
  {
    p: 21, x: 58, pens: 1, plaques: 1, chain: 1,
    quote: {
      id: 'lq-epistemology-knowledge-35-1',
      text: 'To know is to have evidence that rules out relevant alternatives.',
      author: 'Fred Dretske',
      work: 'Epistemic Operators',
      era: '1970',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 160, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1, live: 1,
    interact: {
      prompt: 'Which claim does your evidence fail to reach?',
      explain: 'Not a painted mule. Looking at the animal supports “it is a zebra”, but nothing in that look tests for paint. So the chain that closure promises breaks at its last link.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1,
    text: 'Yet you never checked whether the animal was a painted mule.',
    dur: 1.8,
  },
  {
    p: 167, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1,
    text: 'The question would strike you as strange, and you’d still say you knew it was a zebra.',
    dur: 2.6,
  },
  {
    p: 386, x: 130, pens: 1, plaques: 1, chain: 1,
    text: 'One way out treats the painted mule as an irrelevant alternative. On this view, ordinary looking counts as ruling it out.',
    dur: 4.6,
  },
  {
    p: 379, x: 130, pens: 1, plaques: 1, chain: 1,
    // UNGRADED (H53). This lesson already asks two graded questions — the drag on
    // beat 2 and the chain on beat 5 — and a third would quietly pay 70 XP where
    // every sibling pays 60. It stays as a tap because the point is worth making
    // and is not worth scoring: there is no trap in it, only a price.
    tap: {
      prompt: 'What does appealing to relevance leave unexplained?',
      options: [
        { id: 'define', text: '“Far-fetched” has to be defined', correct: true },
        { id: 'silly', text: 'Nothing, since the mule is absurd', correct: false },
      ],
      explain: '“Far-fetched” has to be defined. Calling the mule absurd restates the verdict without giving a reason. A theory of relevance must say what makes an alternative relevant, and relevance seems to shift with the stakes.',
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Your Evidence Reaches',
      points: [
        'Closure: knowledge extends to what a known claim rules out',
        'Ordinary looking supports “it is a zebra” at once',
        'The same looking doesn’t test for paint',
        'Either closure goes, or the mule was never relevant',
      ],
      closing: 'You never checked for paint, and you were right not to. Explaining why has occupied epistemology since Dretske’s 1970 paper.',
    },
    dur: 3.0,
  },
];
