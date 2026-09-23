import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-7, "Taste and Disagreement" — Hume's standard of
// taste, staged in a small gallery. Two framed works hang side by side: a three-second
// scribble and a thirty-year masterwork. A companion stands stage right shrugging that
// it's all just opinion; the narrator WALKS frame to frame arguing with them.
//
// Q1 is answered on the wall itself — the two frames become two VERDICTS and you tap
// the one that should count for more. Q2 is A/B/C/D, and its trap is the natural
// misreading: that a "standard" must mean beauty is back in the object.
//
// Plain language throughout: "ideal critic" is never said until the reader has already
// decided that the practised eye counts for more.

export interface Aesthetics7Beat extends BaseBeat {
  /** Narrator gesture code. */ p?: number;
  /** Where the narrator stands (stage x). 90 = at the scribble · 250 = at the masterwork. */ x?: number;
  /** The companion's gesture code — they never move, they only react. */ q?: number;
  /** How strongly the two works read, 0..1 (dimmed while the captions carry the question). */ art?: number;
  /** Caption plates: 0 none · 1 the works · 2 the two viewers (live) · 3 the two viewers, verdict settled. */ capt?: number;
  /** The four marks of Hume's true critic, 0..1. */ marks?: number;
  /** 1 = the two frames are live tap targets (Q1). */ pick?: number;
  /** 1 = the line a reason would be written on lies empty under both works. */ grounds?: number;
  /** 1 = the visitors’ chart is struck through: a count is not a verdict. */ popCorrect?: number;
  /** 1 = the beauty travels off the canvas into whoever is looking. */ viewerMind?: number;
  /** 1 = a tiny molehill and mountain appear side by side, Hume's own image. */ molehill?: number;
  /** 1 = one level is laid across both works: the standard their verdicts answer to. */ standard?: number;
  /** 1 = further marks appear inside the masterwork: what practice lets you see in it. */ perceiveMore?: number;
}

export const BEATS: Aesthetics7Beat[] = [
  {
    p: 462, x: 90, q: 8, art: 1, capt: 0,
    text: 'Suppose a friend judges a scribble better than a masterwork. You may want to call the verdict mistaken.',
    dur: 3.5,
  },
  {
    p: 462, x: 90, q: 8, art: 1, capt: 0, grounds: 1,
    text: 'The difficulty is to say on what grounds, if beauty is a matter of feeling.',
    dur: 1.8,
  },
  {
    p: 47, x: 250, q: 9, art: 1, capt: 1,
    text: 'One work took three seconds to make, and the other took thirty years of practice.',
    cite: 'Three seconds · thirty years',
    dur: 1.8,
  },
  {
    p: 267, x: 250, q: 163, art: 1, capt: 1, popCorrect: 1,
    text: 'Nearly all visitors prefer the masterwork, and only a few the scribble. Yet popularity doesn’t make a verdict correct.',
    dur: 2.9,
  },
  {
    p: 7, x: 160, q: 10, art: 1, capt: 1,
    text: 'David Hume held that beauty isn’t a property of the object at all. No measurement of the canvas will find it.',
    cite: 'Not a quality of things',
    dur: 3.6,
  },
  {
    p: 260, x: 160, q: 161, art: 1, capt: 1, viewerMind: 1,
    text: 'Beauty, for Hume, is a sentiment, a feeling that arises in the mind of the viewer.',
    dur: 1.8,
  },
  {
    p: 162, x: 160, q: 22, art: 1, capt: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-7-1',
      text: 'Beauty is no quality in things themselves: it exists merely in the mind which contemplates them; and each mind perceives a different beauty.',
      author: 'David Hume',
      work: 'Of the Standard of Taste',
      era: '1757',
      philosopherId: 'david-hume',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 12, x: 90, q: 7, art: 1, capt: 1,
    text: 'If beauty is only a feeling, your friend’s feeling seems as valid as anyone’s. The scribble would then tie with the masterwork.',
    cite: 'Is every verdict equal?',
    dur: 3.5,
  },
  {
    p: 165, x: 90, q: 260, art: 1, capt: 1, molehill: 1,
    text: 'Hume rejected the tie. Ranking the minor poet Ogilby equal to Milton, he wrote, is like calling a molehill as high as a mountain.',
    dur: 1.8,
  },
  {
    p: 21, x: 170, q: 4, art: 0.22, capt: 2, pick: 1,
    interact: {
      prompt: 'One viewer has seen one painting, the other a thousand. Whose verdict should carry more weight?',
      explain: 'The viewer who has seen a thousand. Neither viewer reads a fact off the canvas, since both report a feeling. But comparison with a thousand works has trained one viewer’s feeling. For Hume, a practised response is a better guide than a first glance.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 170, q: 45, art: 1, capt: 3, marks: 1,
    text: 'Hume listed the qualities of a true critic. They include practice, comparison, freedom from prejudice and good sense.',
    cite: 'Hume · the true critic',
    dur: 3.6,
  },
  {
    p: 459, x: 170, q: 45, art: 1, capt: 3, marks: 1, standard: 1,
    text: 'Hume holds that the joint verdict of such critics is the standard of taste.',
    dur: 1.8,
  },
  {
    p: 275, x: 250, q: 25, art: 1, capt: 3, marks: 1,
    text: 'The standard isn’t snobbery. A trained wine taster detects flavours a novice can’t, because practice reshapes perception itself.',
    cite: 'Practice changes what you see',
    dur: 2.4,
  },
  {
    p: 275, x: 250, q: 25, art: 1, capt: 3, marks: 1, perceiveMore: 1,
    text: 'If you return after studying many works, you’ll perceive more in this canvas than you do today.',
    dur: 2.6,
  },
  {
    p: 165, x: 160, q: 39, art: 1, capt: 3, marks: 1,
    interact: {
      prompt: 'Which of these does not make a better critic?',
      odd: {
        axis: 'THREE MAKE A CRITIC',
        tiles: [
          { id: 'loud', reads: 'A LOUD OPINION', correct: true },
          { id: 'practice', reads: 'PRACTICE' },
          { id: 'compare', reads: 'COMPARISON' },
          { id: 'clear', reads: 'NO PREJUDICE' },
        ],
      },
      explain: 'A loud opinion. Hume denies that beauty sits in the object and then refuses to make every verdict equal: practice, comparison and a mind free of prejudice put a critic in a better position to feel what\'s there. Confidence isn\'t one of them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Why Some Verdicts Count',
      points: [
        'Beauty is in the response, not the object',
        'Yet not every verdict is equally good',
        'Practice, comparison, no prejudice, good sense',
        'A subjective standard still allows better and worse',
      ],
      closing: 'Hume shows that beauty can be subjective while some verdicts remain better than others.',
    },
    dur: 3.0,
  },
];
