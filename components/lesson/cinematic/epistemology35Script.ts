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
    p: 25, x: 58, pens: 1,
    text: 'A zoo, a pen, a striped animal. You know what that is, and you knew it before you finished looking.',
    dur: 3.6,
  },
  {
    p: 4, x: 58, pens: 1, plaques: 1, scan: 1, live: 1,
    interact: {
      prompt: 'Slide the fence out to where an alternative stops being worth ruling out.',
      drag: {
        lo: 'RULE OUT NOTHING',
        hi: 'RULE OUT EVERYTHING',
        start: 0.2,
        zones: [
          { id: 'lax', upto: 0.3, reads: 'a mule in paint counts' },
          { id: 'ok', upto: 0.72, reads: 'ordinary care is enough', correct: true },
          { id: 'mad', upto: 1, reads: 'and a hologram, and a dream' },
        ],
      },
      explain: 'Everyone slides to roughly the same place, and nobody can say why it stops there. Push the fence out far enough and you know nothing at all. Pull it in and a painted mule is suddenly your problem. The middle is where we live and it has no marked edge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'Here is the rule that makes the puzzle awkward. Know a thing.',
    dur: 1.8,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'Know what the thing rules out. You should know the second thing as well.',
    dur: 2,
  },
  {
    p: 13, x: 58, pens: 1, plaques: 1, chain: 1,
    text: 'Philosophers call the rule closure.',
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
    p: 4, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1, live: 1,
    interact: {
      prompt: 'Tap the plate your evidence does not actually reach.',
      explain: 'The last one. You looked at an animal and got "zebra" for free. Nothing you did looks any harder at the paint, so the chain that should carry you along it gives way at the end.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1,
    text: 'Notice what did not happen. You never checked for paint.',
    dur: 1.8,
  },
  {
    p: 35, x: 58, pens: 1, plaques: 1, chain: 1, gap: 1,
    text: 'You would think it strange to be asked, and you would still say you knew.',
    dur: 2.6,
  },
  {
    p: 47, x: 130, pens: 1, plaques: 1, chain: 1,
    text: 'One way out says the mule was never a live option. Far-fetched enough, and your ordinary looking already counts as ruling it out.',
    dur: 4.6,
  },
  {
    p: 45, x: 130, pens: 1, plaques: 1, chain: 1,
    // UNGRADED (H53). This lesson already asks two graded questions — the drag on
    // beat 2 and the chain on beat 5 — and a third would quietly pay 70 XP where
    // every sibling pays 60. It stays as a tap because the point is worth making
    // and is not worth scoring: there is no trap in it, only a price.
    tap: {
      prompt: 'That fix has a price. Tap what it costs.',
      options: [
        { id: 'define', text: '"Far-fetched" has to be defined', correct: true },
        { id: 'silly', text: 'Nothing — the mule is silly', correct: false },
      ],
      explain: 'Calling it silly is the answer, not a reason for it. Once relevance does the work, someone has to say what makes an alternative relevant. And it moves when the stakes do, which is why a courtroom checks what a zoo never would.',
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Your Evidence Reaches',
      points: [
        'Closure: know it, know what it rules out, know that',
        'Ordinary looking hands you "zebra" at once',
        'The same looking says nothing about paint',
        'Either closure goes, or the mule was never relevant',
      ],
      closing: 'You never checked for paint, and you were right not to. Saying exactly why you were right is most of a century of epistemology.',
    },
    dur: 3.0,
  },
];
