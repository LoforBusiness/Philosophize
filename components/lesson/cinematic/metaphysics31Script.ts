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
    dur: 4.2,
    text: 'Now three holes. Nothing has been added to the slab. Something has been taken out of it. And yet the picture plainly holds three more things than it did.',
    cite: 'Three more things',
  },
  {
    g: 3, holes: 1, ticks: 3, chips: 0,
    dur: 4.6,
    text: 'You can count holes. You can measure one, call it deeper than the next, and be right. Everything we do with objects, we do with holes.',
    cite: 'One, two, three',
  },
  {
    g: 129, holes: 1, ticks: 3, chips: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-31-1',
      text: 'Shape clay into a vessel; it is the space within that makes it useful.',
      author: 'Laozi',
      work: 'Tao Te Ching',
      era: 'c. 400 BC',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 4, holes: 1, ticks: 3, chips: 1,
    dur: 4.8,
    text: 'So say what you counted. There are only three candidates. The cheese, the ring of cheese bent around each gap, and the gap in the middle.',
    cite: 'Three candidates',
  },
  {
    g: 2, holes: 1, ticks: 3, chips: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap whatever it is you counted when you counted three.',
      explain: 'The rim. Argle\'s answer, from a famous 1970 dialogue: a hole just is its lining, a bit of cheese bent into a ring. Count the linings and you have counted the holes without adding one immaterial thing to the world.',
      xp: 5,
    },
  },
  {
    g: 8, holes: 1, ticks: 3, chips: 1,
    dur: 1.0,
    interact: {
      prompt: 'Why does it matter what a hole is?',
      cards: [
        { text: 'We count and measure absences', correct: true },
        { text: 'Just say perforated instead', correct: false },
      ],
      explain: 'The other card is respectable: paraphrase the hole-talk away and the problem dissolves. It only has to work — and "there are as many holes as pegs" has resisted paraphrase for fifty years. That is why this is still live.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Counting Nothing',
      points: [
        'We quantify over absences constantly and never notice',
        'A hole can be counted, measured and compared',
        'One tidy answer: a hole is its lining, a material thing',
        'Paraphrasing absences away is harder than it sounds',
      ],
      closing: 'Metaphysics is mostly one move. Take an ordinary sentence seriously, then ask what would have to exist for the sentence to be true.',
    },
    dur: 3.0,
  },
];
