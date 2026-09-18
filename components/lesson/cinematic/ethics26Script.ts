import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-26, "Who Counts, And Why?"
// Theme: A ROW OF BEINGS AND A GATE THAT DECIDES WHERE THE CIRCLE STOPS.
//
// Drawing moral status as a CIRCLE is the usual picture and it hides the thing
// that matters: circles have no order, so nothing shows which beings are near the
// line. A rail does. Rock, plant, fish, chimpanzee, person, in the order the
// candidate criteria actually rank them — and one gate, which is the criterion.
//
// The gate is a single object at every setting. Sentience, personhood and species
// are not three different kinds of line, they are one line in three places, and a
// picture with three gates would lose that.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the
//     species-only answer is charged with. On the stage because the gate is
//     already standing at that setting, with almost everything outside it.
//   · beat 8  a SORT — the criterion itself, dropped into a bin. The gate walks to
//     wherever the reader's answer puts it, so choosing a criterion is watching
//     the circle change size.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the five beings stand on the rail, 0…1. */ rail?: number;
  /** 1 = the line is drawn, at the species setting. */ line?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = three faint ticks mark the rail's three candidate lines. */ guess?: number;
  /** 1 = a small dot marks the fish and the chimp: what the other lines add. */ alt?: number;
}

export const BEATS: Ethics26Beat[] = [
  {
    p: 355, x: 28, rail: 0.4,
    text: 'Kicking a rock wrongs nothing, while kicking an animal seems to wrong the animal. Which beings can be wronged?',
    dur: 4.6,
  },
  {
    p: 170, x: 28, rail: 1,
    text: 'A being has moral status if it matters morally for its own sake, not merely as a means for others.',
    dur: 4.8,
  },
  {
    p: 435, x: 28, rail: 1, guess: 1,
    text: 'Three main criteria are defended. They’re the capacity to suffer, the capacity to plan a life, and being human.',
    dur: 5.0,
  },
  {
    p: 258, x: 28, rail: 1, line: 1,
    text: 'On the species criterion, only the person stands inside the line. The chimp, the fish, the plant and the rock all fall outside.',
    dur: 4.6,
  },
  {
    p: 163, x: 28, rail: 1, line: 1, plates: 1, live: 1,
    interact: {
      prompt: 'If membership of the human species decides moral status, what objection does that view face?',
      explain: 'Speciesism. Peter Singer holds that favouring your own species is like favouring your own race. Species is a matter of biology, not of what a being can feel. So a defender must say what about humans matters. Calling human priority a plain fact gives no reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 88, rail: 1, line: 1,
    text: 'Being a person and being human are different properties. A person is a being that plans, reflects and knows it has a future.',
    dur: 4.8,
  },
  {
    p: 430, x: 88, rail: 1, line: 1,
    quote: {
      id: 'lq-ethics-ethics-26-1',
      text: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      philosopherId: 'jeremy-bentham',
      work: 'An Introduction to the Principles of Morals and Legislation',
      era: '1789',
      branchSlugs: ['ethics'],
    },
    dur: 4.8,
  },
  {
    p: 439, x: 88, rail: 1, line: 1, alt: 1,
    text: 'Each criterion puts the line in a different place. Suffering lets in the fish, while planning lets in few beings besides the person.',
    dur: 4.6,
  },
  {
    p: 176, x: 88, rail: 1, line: 1,
    interact: {
      prompt: 'Which criterion should decide which beings have moral status?',
      sort: {
        chip: 'the criterion for moral status',
        bins: [
          { id: 'suffer', label: 'can suffer', reads: 'every being with interests at stake counts', correct: true },
          { id: 'plan', label: 'can plan', reads: 'only beings who know they have a future' },
          { id: 'human', label: 'is human', reads: 'the human species, and nothing else' },
        ],
      },
      explain: 'Can suffer. Bentham and Singer hold that any being that can suffer has interests that count. Planning, the main rival, leaves out some humans, such as newborns. Species alone names no interest that could be harmed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 343, x: 88, rail: 1, line: 1,
    summary: {
      title: 'Who Has Moral Status?',
      points: [
        'Moral status is mattering for your own sake',
        'Suffering, planning and species are the main criteria',
        'Person and human are not the same category',
        'Species alone is a classification, not a morally relevant capacity',
      ],
      closing: 'Where the line falls determines whose interests must be weighed at all.',
    },
    dur: 5.0,
  },
];
