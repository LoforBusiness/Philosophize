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
}

export const BEATS: Aesthetics7Beat[] = [
  {
    p: 25, x: 90, q: 8, art: 1, capt: 0,
    text: 'Someone glances at the scribble on this wall, then at the painting beside it, and says the scribble is better. You want to tell them they are wrong. On what grounds?',
    dur: 4.0,
  },
  {
    p: 47, x: 250, q: 9, art: 1, capt: 1,
    text: 'Three seconds made one of these. Thirty years made the other. Nearly everyone who walks in here feels the gap — but a feeling is not yet a reason.',
    cite: 'Three seconds · thirty years',
    dur: 4.6,
  },
  {
    p: 7, x: 160, q: 10, art: 1, capt: 1,
    text: 'Hume went looking for the beauty in the paint and came back empty. Scrape the canvas, weigh it, measure it: no beauty comes off. It happens in the mind doing the looking.',
    cite: 'Nobody can find the beauty',
    dur: 4.8,
  },
  {
    p: 44, x: 160, q: 22, art: 1, capt: 1,
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
    text: 'If beauty only happens in minds, then your friend’s mind is as full of it as anyone’s, and the scribble ties with the masterwork. Something in you refuses that. Hume refused it too.',
    cite: 'So the scribble wins?',
    dur: 4.8,
  },
  {
    p: 21, x: 170, q: 4, art: 0.22, capt: 2, pick: 1,
    interact: {
      prompt: 'Two people look at these works and give a verdict. Whose should carry more weight? Tap it.',
      explain: 'Neither one is reading a fact off the canvas — both just report how the work hits them. But one of them has a thousand works to compare against, so their reaction is trained. A first glance and a practised eye are not the same thing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 3, x: 170, q: 45, art: 1, capt: 3, marks: 1,
    text: 'So Hume set a bar. A verdict counts when it comes from long practice, wide comparison, no personal grudges, and plain good sense. Where people like that agree, you have a standard.',
    cite: 'Hume · the true critic',
    dur: 5.0,
  },
  {
    p: 24, x: 250, q: 25, art: 1, capt: 3, marks: 1,
    text: 'This is not snobbery. A wine taster really does taste notes you cannot; practice reshapes perception itself. Stand here again after a hundred galleries and this canvas will show you more than it does today.',
    cite: 'Practice changes what you see',
    dur: 5.0,
  },
  {
    p: 4, x: 160, q: 39, art: 1, capt: 3, marks: 1,
    interact: {
      prompt: '"Hume gave us a standard of taste. So is beauty a real property of the object?"',
      cards: [
        { text: 'False, beauty stays in response', correct: true },
        { text: 'True, a standard measures it', correct: false },
      ],
      explain: 'The trap: "a standard" sounds like a ruler you hold against the canvas. Hume never put beauty back into the paint. He kept it in the response. And a response can be practised, compared, and free of grudges. That is why criticism is not just noise.',
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
        'Subjective still leaves room for better and worse',
      ],
      closing: 'Next time someone shrugs "it is all opinion" — ask how many they have seen.',
    },
    dur: 3.0,
  },
];
