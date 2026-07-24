import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-6, "The Trolley Problem and Its Cousins" — the footbridge.
// A trolley bears down on five; on a bridge above the track stand the decider and a
// large stranger. Shove him and his body stops the trolley — same math as the lever,
// but it feels monstrous. Questions are A/B/C/D (nuanced); the scene carries the pull.

export interface Ethics6Beat extends BaseBeat {
  /** Decider gesture. */ d?: number;
  /** The large stranger's gesture. */ str?: number;
  /** Trolley position along the track. */ tx?: number;
  /** The shove tension 0..1 (decider reaches for the stranger). */ shove?: number;
}

export const BEATS: Ethics6Beat[] = [
  {
    d: 2, str: 0, tx: 70,
    text: 'Five lives saved. So why does this one feel wrong? Same numbers, different hands — your gut splits where the math does not.',
    dur: 3.6,
  },
  {
    d: 1, str: 0, tx: 110,
    text: 'Earlier you met the lever: divert the trolley, one dies instead of five. Philosophers then twisted it — each version keeps the five-for-one math but changes how the one dies.',
    cite: 'One dilemma, many versions',
    dur: 5.0,
  },
  {
    d: 13, str: 15, tx: 150, shove: 0.5,
    text: 'Thomson’s 1985 twist: you stand on a bridge beside a large stranger. Shove him onto the track and his body stops the trolley, saving five. Most who would pull the lever refuse to push.',
    cite: 'The footbridge twist',
    dur: 5.2,
  },
  {
    d: 22, str: 18, tx: 180,
    text: 'The arithmetic is identical — five lives for one. Yet the switch and the shove split us. Foot: diverting redirects a threat; shoving makes a person your instrument.',
    cite: 'Doing vs using',
    dur: 4.8,
  },
  {
    d: 0, str: 0, tx: 180,
    quote: {
      id: 'lq-ethics-ethics-6-1',
      text: 'It takes more to justify an interference than to justify the withholding of goods and service.',
      author: 'Philippa Foot',
      work: 'Killing and Letting Die',
      era: '1984',
      branchSlugs: ['ethics'],
    },
    dur: 3.4,
  },
  {
    d: 4, str: 0, tx: 180,
    mc: {
      prompt: 'Why do most people permit the switch but refuse the footbridge shove?',
      options: [
        { id: 'a', text: 'The shove uses a person as a means; the switch redirects a threat', correct: true },
        { id: 'b', text: 'The shove kills more people than the switch does', correct: false },
        { id: 'c', text: 'The footbridge case saves fewer than five lives', correct: false },
        { id: 'd', text: 'Pushing is illegal, while flipping a switch is not', correct: false },
      ],
      explain: 'Both cases trade one life for five. What shifts is treating the stranger as a tool — which the doctrine of double effect and Foot both flag.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 21, str: 0, tx: 180,
    mc: {
      prompt: 'A strict utilitarian must judge the lever and footbridge cases exactly alike. True?',
      options: [
        { id: 't', text: 'True', correct: true },
        { id: 'f', text: 'False', correct: false },
      ],
      explain: 'It feels off, but pure utilitarianism counts only outcomes: five saved for one lost is identical in both, so the cases get the same verdict.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Trolley Family',
      points: [
        'Switch and shove share the same math',
        'Our gut still treats them differently',
        'Means versus side effect drives the split',
        'Foot: not harming outweighs helping',
      ],
      closing: 'The puzzle is not what to do, but why our intuitions refuse to line up.',
    },
    dur: 2.8,
  },
];
