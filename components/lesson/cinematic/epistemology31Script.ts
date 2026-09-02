import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-31, "Why Trust Your Memory?"
//
// THE PICTURE: a cabinet of drawers, and a door on the other side of the room. Every
// drawer the reader opens to verify the last one is ANOTHER MEMORY, and the cabinet
// is where the whole search happens. The door has been standing there the entire
// lesson and nobody has walked over to it.
//
// STAGING: a cabinet whose DRAWERS SLIDE OUT one at a time — a stack of nested
// containers rather than a row of cards — and the answer targets are the three
// drawers plus the door, so the reader answers by choosing which container to open.

export interface Epis31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many drawers are pulled out, 0…3. */ open?: number;
  /** 1 = the drawers and the door are live targets (Q1). */ pick?: number;
}

export const BEATS: Epis31Beat[] = [
  {
    g: 4, open: 0,
    dur: 2.9,
    text: 'You are already down the road when it hits you: did you lock the door? You can picture doing it.',
  },
  {
    g: 4, open: 0,
    dur: 1.8,
    text: 'That picture is the only evidence you have.',
  },
  {
    g: 1, open: 1,
    dur: 3.9,
    text: 'So you check. You open the memory and there it is — the key, the turn, the pull on the handle.',
    cite: 'The first drawer',
  },
  {
    g: 1, open: 1,
    dur: 1.8,
    text: 'Clear as anything.',
  },
  {
    g: 3, open: 2,
    dur: 2.1,
    text: 'But how do you know that memory is any good? You remember checking it.',
    cite: 'The second drawer',
  },
  {
    g: 3, open: 2,
    dur: 2.5,
    text: 'That is a second drawer, in the same cabinet, made of the same stuff as the first.',
  },
  {
    g: 128, open: 2,
    dur: 3.6,
    quote: {
      id: 'lq-epistemology-knowledge-31-1',
      text: 'Great is the power of memory, a fearful thing, O my God, a deep and boundless manifoldness.',
      author: 'Augustine of Hippo',
      philosopherId: 'augustine',
      work: 'Confessions',
      era: '397 AD',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 8, open: 3,
    dur: 2.2,
    text: 'And a third. Every certificate memory can issue is signed by memory.',
    cite: 'And a third',
  },
  {
    g: 8, open: 3,
    dur: 2.2,
    text: 'Meanwhile the door itself has been standing over there the whole time.',
  },
  {
    g: 2, open: 3, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the card that could check a memory from outside memory.',
      explain: 'The door. Every drawer in that cabinet is another memory, and a memory cannot vouch for itself. Only the world breaks the circle. A minute after you look, that too is a memory.',
      xp: 5,
    },
  },
  {
    g: 11, open: 3,
    dur: 1.0,
    interact: {
      prompt: 'Set the lever to how you should hold a memory.',
      lever: {
        start: 0,
        stops: [
          { id: 'prove', reads: 'prove it first, against something outside memory' },
          { id: 'trust', reads: 'trust it until you get a reason not to', correct: true },
          { id: 'doubt', reads: 'treat every memory as suspect until it is confirmed' },
        ],
      },
      explain: 'The middle. The first setting cannot be carried out: nothing outside memory is available to you, because any check you make is itself remembered a moment later. Memory is a floor to stand on rather than a conclusion to prove.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Floor, Not a Conclusion',
      points: [
        'Nearly all of your past is held up by memory alone',
        'Checking a memory usually means consulting another one',
        'Only the world breaks the circle, and only for a moment',
        'Basic trust is not the same as blind trust',
      ],
      closing: 'Some beliefs are not conclusions you reached. They are the ground you were standing on.',
    },
    dur: 3.0,
  },
];
