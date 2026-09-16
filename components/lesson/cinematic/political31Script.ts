import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-31, "The Tragedy of the Commons".
//
// THE PICTURE: a field of grass that dies while you watch, with more animals arriving
// on it. Then the arithmetic behind it is laid over the top — a whole gain against a
// quartered cost — and the reader can see that nothing in the picture is anybody
// misbehaving (H64).
//
// STAGING: a FIELD OF TWENTY-ONE BLADES that shrink together, which is the first mass
// animation in the app; the answer targets are the two halves of the sum plus a plate
// under the herder, so the reader chooses between an explanation and a culprit (E33).

export interface Pol31Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How much grass is left, 1 down to 0.18. */ grass?: number;
  /** Animals on the field, 0…4. */ herd?: number;
  /** 1 = the arithmetic is laid over the field. */ sums?: number;
  /** 1 = the sum and the plate are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol31Beat[] = [
  {
    g: 433, grass: 1, herd: 1, sums: 0,
    dur: 4.0,
    text: 'Consider a commons: a pasture that no one owns and everyone may use. Four herders have an equal right to graze animals on it.',
  },
  {
    g: 2, grass: 0.66, herd: 2, sums: 0,
    dur: 2.8,
    text: 'Suppose you add one more animal. You keep the whole gain from it, but the damage to the grass is shared by all four herders.',
    cite: 'One more animal',
  },
  {
    g: 266, grass: 0.66, herd: 2, sums: 0,
    dur: 1.8,
    text: 'For you, the gain outweighs your share of the cost, so adding the animal is rational.',
  },
  {
    g: 387, grass: 0.22, herd: 4, sums: 0,
    dur: 4.6,
    text: 'Every other herder reasons the same way. The pasture is stripped bare and all are worse off, though no one acted unreasonably.',
    cite: 'Every herder reasons alike',
  },
  {
    g: 456, grass: 0.22, herd: 4, sums: 0,
    dur: 3.6,
    quote: {
      id: 'lq-political-political-31-1',
      text: 'That which is common to the greatest number has the least care bestowed upon it.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Politics',
      era: 'c. 350 BC',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 459, grass: 0.22, herd: 4, sums: 1,
    dur: 2.7,
    text: 'Each herder weighs the same calculation. The gain from one more animal is a whole unit, and the herder keeps all of it.',
    cite: 'Each herder’s calculation',
  },
  {
    g: 459, grass: 0.22, herd: 4, sums: 1,
    dur: 2.1,
    text: 'The cost is also a whole unit. Four herders share it, so each bears only a quarter.',
  },
  {
    g: 467, grass: 0.22, herd: 4, sums: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What makes overgrazing the rational choice for each herder?',
      explain: 'Shared four ways. A herder who bore the whole cost would gain nothing from another animal. Bearing only a quarter, each herder makes a net gain. Greed isn’t needed to explain the result.',
      xp: 5,
    },
  },
  {
    g: 165, grass: 0.22, herd: 4, sums: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which remedy can stop the pasture being stripped bare?',
      sort: {
        chip: 'saving the pasture',
        bins: [
          { id: 'ask', label: 'ask for restraint', reads: 'ask each herder to take less' },
          { id: 'shame', label: 'shame overgrazers', reads: 'publicly shame those who take too much' },
          { id: 'rules', label: 'change the cost', reads: 'change what taking too much costs', correct: true },
        ],
      },
      explain: 'Change the cost. A herder who alone takes less loses out, and the pasture is still ruined. Garrett Hardin, who named the tragedy in 1968, predicted ruin. Elinor Ostrom found commons that lasted, because users set and enforced their own limits.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Why Shared Resources Are Overused',
      points: [
        'Private gain against shared cost ruins shared things',
        'Everyone can act rationally and still lose together',
        'Restraint alone does not save a commons',
        'Ostrom: communities can set and enforce their own limits',
      ],
      closing: 'When rational choices produce a collective disaster, the remedy lies in changing the incentives, not in blaming individuals.',
    },
    dur: 3.0,
  },
];
