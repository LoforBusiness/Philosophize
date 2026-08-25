import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-10, "Art and Morality" — Wilde the autonomist,
// the moralist, and Gaut's ethicism.
//
// THE ONE PICTURE: a SCREEN showing a masterfully-made film, and directly beneath
// it a second panel reading WHAT IT ASKS YOU TO FEEL. A shutter can slide across
// that lower panel and hide it. The whole lesson is whether the shutter is allowed
// to stay shut — Wilde draws it across (judge the craft, that is all there is), the
// moralist shoves it back open, and ethicism is the third state: the shutter open
// AND a line drawn from the lower panel up into the craft verdict above. One
// shutter, three positions, and the third one has an arrow in it.
//
// Q1 is answered ON the stage (which camp does the line belong on — two boards in
// the left column). Q2 is the nuanced one and lives in the deck, where the four
// options can actually be read.

export interface Aes10Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 44 = downstage left · 110 = at the shutter's rail. */ x?: number;
  /** The screen and its filmstrip, 0..1. */ film?: number;
  /** The craft verdict strip: 0 none · 1 "CRAFT: MASTERFUL" · 2 "CRAFT: FLAWED AS ART". */ verdict?: number;
  /** The lower panel — WHAT IT ASKS YOU TO FEEL, 0..1. */ panel?: number;
  /** The shutter across the lower panel: 0 open (run off to the right) · 1 closed. */ shut?: number;
  /** The line drawn from the lower panel up into the craft verdict, 0..1. */ link?: number;
  /** 1 = the two camp boards are live in the left column (Q1). */ boards?: number;
}

export const BEATS: Aes10Beat[] = [
  {
    p: 25, x: 44, film: 1, panel: 1, shut: 0,
    text: 'Two hours of the finest film-making you have ever sat through. Every frame placed by a master. And all of that skill is working to make cruelty look glorious.',
    dur: 4.4,
  },
  {
    p: 5, x: 44, film: 1, panel: 1, shut: 0, verdict: 1,
    text: 'Nobody disputes the skill, so the craft verdict is easy to write. Underneath it sits a second question — what all that skill is asking you to feel.',
    cite: 'The craft',
    dur: 4.6,
  },
  {
    p: 13, x: 110, film: 1, panel: 1, shut: 1, verdict: 1,
    text: 'Oscar Wilde draws the shutter across that second question. A book is well written or badly written, and there is nothing else on the paper to judge.',
    cite: 'Wilde slides it shut',
    dur: 4.8,
  },
  {
    p: 137, x: 110, film: 1, panel: 1, shut: 1, verdict: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-10-1',
      text: 'There is no such thing as a moral or an immoral book. Books are well written, or badly written. That is all.',
      author: 'Oscar Wilde',
      work: 'The Picture of Dorian Gray',
      era: '1891',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 29, x: 110, film: 1, panel: 1, shut: 0, verdict: 1,
    text: 'The moralist shoves the shutter back. What a work invites you to feel is not a footnote about it — it is part of what the work already is.',
    cite: 'The moralist opens it',
    dur: 4.6,
  },
  {
    p: 30, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1,
    text: 'A third camp draws a line between the two. Berys Gaut: if a work asks you to feel what you should not, that failure counts against it as art.',
    cite: 'Ethicism',
    dur: 4.8,
  },
  {
    p: 4, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1, boards: 1,
    interact: {
      prompt: 'A work that glamorises cruelty is worse AS art. Which board does that line belong on?',
      explain: 'The trap: everyone agrees the film is superbly made, so calling it worse AS art sounds like a confusion. It is not. The moralist grants the skill and says what a work asks you to feel is part of its worth as art — the exact link Wilde denies.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 9, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1,
    interact: {
      prompt: '"Plato wanted art controlled, so he must have prized beauty above moral concern." Assess it.',
      cards: [
        { text: 'Wrong, morality came first', correct: true },
        { text: 'Right, he prized beauty', correct: false },
      ],
      explain: 'The trap reverses Plato. He policed art precisely because he ranked the good of the city ABOVE beauty — and he feared beautiful art most, since beauty is what makes a bad lesson persuasive.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Should Art Answer to Ethics?',
      points: [
        'Moralism: judge art by what it does to us',
        'Autonomism: judge the craft, nothing else',
        'Ethicism: a moral flaw can be an artistic flaw',
        'The skill was never what was in dispute',
      ],
      closing: 'Beauty and goodness can pull apart, and the gap between them is the unsettling part.',
    },
    dur: 3.2,
  },
];
