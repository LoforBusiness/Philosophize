import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-31, "Do Holes Exist?"
//
// THE PICTURE: a slab with three holes in it, and a tally counting them. Answer the
// question and the CHEESE FADES AWAY, leaving three rings hanging in the air — which
// is the whole argument in one move: what you counted is still there when the gaps
// are gone, because what you counted was never the gaps (H64).
//
// STAGING: the three answers are NESTED INSIDE EACH OTHER — the slab, the ring drawn
// around the big hole, and the empty middle of it. You answer by tapping the rim or
// the gap, which is a distinction no row of cards could put as directly (E33, H65).

export interface Meta31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the holes have opened in the slab. */ holes?: number;
  /** How many tally marks have been counted, 0…3. */ ticks?: number;
  /** 1 = the three candidates are labelled. */ chips?: number;
  /** 1 = the slab and the rings are live targets (Q1). */ pick?: number;
}

export const BEATS: Meta31Beat[] = [
  {
    g: 5, holes: 0, ticks: 0, chips: 0,
    dur: 3.8,
    text: 'One slab of cheese. Solid all the way through, and there is nothing here to argue about yet.',
  },
  {
    g: 45, holes: 1, ticks: 0, chips: 0,
    dur: 1.8,
    text: 'Now three holes. Nothing was added to the cheese.',
    cite: 'Three more things',
  },
  {
    g: 45, holes: 1, ticks: 0, chips: 0,
    dur: 2.6,
    text: 'Something was taken away. And yet there are three more things here than before.',
  },
  {
    g: 3, holes: 1, ticks: 3, chips: 0,
    dur: 3,
    text: 'You can count holes. You can measure one, call it deeper than the next, and be right.',
    cite: 'One, two, three',
  },
  {
    g: 3, holes: 1, ticks: 3, chips: 0,
    dur: 1.8,
    text: 'Everything we do with objects, we do with holes.',
  },
  {
    g: 129, holes: 1, ticks: 3, chips: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-31-1',
      text: 'Shape clay into a vessel; it is the space within that makes it useful.',
      author: 'Laozi',
      philosopherId: 'laozi',
      work: 'Tao Te Ching',
      era: 'c. 400 BC',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 4, holes: 1, ticks: 3, chips: 1,
    dur: 2.3,
    text: 'So what did you count? There are only three things it could be.',
    cite: 'Three candidates',
  },
  {
    g: 4, holes: 1, ticks: 3, chips: 1,
    dur: 2.5,
    text: 'The cheese, the ring of cheese around each gap, or the empty gap itself.',
  },
  {
    g: 2, holes: 1, ticks: 3, chips: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap whatever it is you counted when you counted three.',
      explain: 'The rim. Argle\'s answer, from a famous 1970 dialogue: a hole just is its rim, a bit of cheese bent into a ring. Count the rings and you have counted the holes, and nothing new had to exist.',
      xp: 5,
    },
  },
  {
    g: 8, holes: 1, ticks: 3, chips: 1,
    dur: 1.0,
    interact: {
      prompt: 'Drag to how often rewording can make a hole go away.',
      drag: {
        lo: 'ALWAYS',
        hi: 'NEVER',
        start: 0,
        zones: [
          { id: 'easy', upto: 0.3, reads: 'rewording always works' },
          { id: 'mostly', upto: 0.74, reads: 'rewording works until you count them', correct: true },
          { id: 'never', upto: 1, reads: 'rewording never works' },
        ],
      },
      explain: 'Usually — and the failures are why this is still argued about. Rewording is a fair move, but it has to work every time. Try it on "there are as many holes as pegs" and it breaks. Counting is the one thing "holey" cannot do.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Counting Nothing',
      points: [
        'We count absences all the time and never notice',
        'A hole can be counted, measured and compared',
        'One tidy answer: a hole is its rim, which is real cheese',
        'Rewording an absence away is harder than it sounds',
      ],
      closing: 'Metaphysics is mostly one move. Take an ordinary sentence seriously, then ask what would have to exist for the sentence to be true.',
    },
    dur: 3.0,
  },
];
