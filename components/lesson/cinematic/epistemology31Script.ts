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
    g: 467, open: 0,
    dur: 2.9,
    text: 'Suppose you’ve left home and wonder whether you locked the door. You can recall locking it.',
  },
  {
    g: 467, open: 0,
    dur: 1.8,
    text: 'That memory of locking the door is your only evidence.',
  },
  {
    g: 459, open: 1,
    dur: 3.9,
    text: 'To check, you consult the memory. It seems vivid: the key, the turn, the pull on the handle.',
    cite: 'The first drawer',
  },
  {
    g: 459, open: 1,
    dur: 1.8,
    text: 'Yet a memory’s vividness doesn’t show that it’s accurate.',
  },
  {
    g: 168, open: 2,
    dur: 2.1,
    text: 'How do you know that this memory is reliable? You recall having checked it before.',
    cite: 'The second drawer',
  },
  {
    g: 168, open: 2,
    dur: 2.5,
    text: 'That recollection is a second memory, so it relies on the same faculty it’s meant to check.',
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
    text: 'A third memory would face the same question. Any check that memory can provide depends on memory itself.',
    cite: 'And a third',
  },
  {
    g: 8, open: 3,
    dur: 2.2,
    text: 'Only the door itself lies outside memory, so only the door could check the memory independently.',
  },
  {
    g: 466, open: 3, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of these could check a memory without relying on memory?',
      explain: 'The door. Every drawer holds another memory, and no memory can vouch for itself. Only looking at the world breaks the circle, and a moment later that look is a memory too.',
      xp: 5,
    },
  },
  {
    g: 165, open: 3,
    dur: 1.0,
    interact: {
      prompt: 'How should you treat your own memory?',
      sort: {
        chip: 'your own memory',
        bins: [
          { id: 'prove', label: 'prove it first', reads: 'prove it first, against something outside memory' },
          { id: 'trust', label: 'trust it', reads: 'trust it unless you have a reason to doubt', correct: true },
          { id: 'doubt', label: 'suspect it', reads: 'treat every memory as suspect until it is confirmed' },
        ],
      },
      explain: 'Trust your memory unless there’s a reason to doubt it. Any argument that memory works uses remembered evidence, such as past checks that came out right. So proving memory first is circular, and doubting every memory leaves nothing to check one against.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Trusting Memory Without Proof',
      points: [
        'Nearly all knowledge of your past rests on memory',
        'Checking a memory usually means consulting another one',
        'Perception can check a memory, but only in the present',
        'Basic trust is not the same as blind trust',
      ],
      closing: 'Trust in memory is a starting point for reasoning, not a conclusion reached by it.',
    },
    dur: 3.0,
  },
];
