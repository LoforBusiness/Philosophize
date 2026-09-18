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
  /** A rule underlines GLORY IN CRUELTY on the lower panel — the feeling the craft is spent on. */ mark?: boolean;
}

export const BEATS: Aes10Beat[] = [
  {
    p: 164, x: 44, film: 1, panel: 1, shut: 0,
    text: 'Suppose a film is made with the greatest skill. Every frame is composed by a master.',
    dur: 2.6,
  },
  {
    p: 164, x: 44, film: 1, panel: 1, shut: 0, mark: true,
    text: 'Yet all that skill is used to make cruelty look glorious.',
    dur: 1.8,
  },
  {
    p: 5, x: 44, film: 1, panel: 1, shut: 0, verdict: 1,
    text: 'The verdict on its craft is uncontroversial. A second question concerns what the film asks you to feel.',
    cite: 'The craft',
    dur: 4.6,
  },
  {
    p: 13, x: 110, film: 1, panel: 1, shut: 1, verdict: 1,
    text: 'Autonomism holds that art should be judged on its craft alone. Oscar Wilde rules the second question out of aesthetic judgement.',
    cite: 'Autonomism',
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
    p: 389, x: 110, film: 1, panel: 1, shut: 0, verdict: 1,
    text: 'Moralism rejects the restriction. For the moralist, what a work invites you to feel is part of the work itself.',
    cite: 'Moralism',
    dur: 4.6,
  },
  {
    p: 30, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1,
    text: 'A third position, ethicism, connects the two questions. Berys Gaut holds that a work inviting a response you shouldn’t have is, to that extent, flawed as art.',
    cite: 'Ethicism',
    dur: 4.8,
  },
  {
    p: 457, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1, boards: 1,
    interact: {
      prompt: 'Which of these two views holds that glamorising cruelty makes a work worse as art?',
      explain: 'The moralist, who counts feeling too. A moralist grants the film’s skill but treats the feeling it invites as part of its value as art. Wilde denies that link, because for him only the craft can be judged.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 445, x: 110, film: 1, panel: 1, shut: 0, verdict: 2, link: 1,
    interact: {
      prompt: 'When beauty conflicts with the good of the city, which does Plato put first?',
      drag: {
        lo: 'BEAUTY ABOVE ALL',
        hi: 'THE CITY ABOVE ALL',
        start: 0,
        zones: [
          { id: 'beauty', upto: 0.3, reads: 'beauty first, whatever it costs' },
          { id: 'even', upto: 0.62, reads: 'the two weighed against each other' },
          { id: 'city', upto: 1, reads: 'the city first, and beautiful art is most dangerous', correct: true },
        ],
      },
      explain: 'The city first, and beautiful art is most dangerous. Plato ranked the good of the city above beauty, so the Republic proposes censoring poetry. He feared skilful art most, because its charm makes a harmful lesson persuasive.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Should Art Answer to Ethics?',
      points: [
        'Moralism: moral content affects artistic value',
        'Autonomism: judge the craft, nothing else',
        'Ethicism: a moral flaw can be an artistic flaw',
        'The dispute concerns feeling, not skill',
      ],
      closing: 'Beauty and goodness can come apart, and the three positions disagree about what follows for art.',
    },
    dur: 3.2,
  },
];
