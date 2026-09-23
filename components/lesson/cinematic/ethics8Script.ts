import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-8, "The Ethics of Care" — the theory that starts from
// the person in front of you instead of the rulebook. The figure begins across
// the room framing a rigid grid of empty rule-boxes, WALKS over to someone
// slumped by their bed, gets down beside them, and a thread of connection draws
// between the two while the grid dims. Q1 is answered in the scene (tap the
// question care asks FIRST); Q2 is A/B/C/D in the deck.
//
// ASK BEFORE TELL: the "who needs me" question is never stated in narration
// before Q1 asks for it, and the three-part method (attention, responsibility,
// responsiveness) arrives only AFTER Q2 has tempted the reader with "it's just
// being nice".

export interface Ethics8Beat extends BaseBeat {
  /** Narrator gesture code. */ p?: number;
  /** Where the narrator stands (stage x). 80 = across the room, 208 = beside them. */ x?: number;
  /** The rigid grid of empty rule-boxes up top, 0..1 — it fades as the bond grows. */ grid?: number;
  /** The slumped figure and their bed, 0..1. */ oth?: number;
  /** The thread of connection between the two, 0..1. */ thread?: number;
  /** 1 = the three question cards are live in the scene (Q1). */ pick?: number;
  /**
   * A one-shot flash in the neutral strip above the walk band, timed to this
   * beat's own claim. 0 none · 1 "OR: SIT WITH THEM" (the neglected response) ·
   * 2 a dashed empty circle + "NO ONE IN PARTICULAR" (the grid's own blankness) ·
   * 3 a filled circle + "SOMEONE, NOT A NUMBER" (the counterpoint) · 4 a bent
   * arrow + "SOMETHING ELSE" (guidance that isn't a rule) · 5 a speech-bubble
   * outline + "A DIFFERENT VOICE" (Gilligan's own name for it) · 6 a small
   * sprout + "GROWS FROM CARING" (Noddings' natural caring) · 7 "≡ + ●"
   * (justice's rule beside care's person, working together).
   */ note?: number;
}

export const BEATS: Ethics8Beat[] = [
  {
    p: 12, x: 80,
    text: 'Suppose a friend has been withdrawn for two weeks. You could work out impartially what you owe them.',
    dur: 2.2,
  },
  {
    p: 165, x: 80, note: 1,
    text: 'Or you could go and sit with them. Care ethicists argue that moral theory long neglected the second response.',
    dur: 2.4,
  },
  {
    p: 47, x: 80, grid: 1,
    text: 'Most major theories begin from impartiality. They seek a rule or a welfare total that applies to everyone equally.',
    cite: 'The usual method',
    dur: 3.3,
  },
  {
    p: 267, x: 80, grid: 1, note: 2,
    text: 'Their categories apply to anyone and name no particular person.',
    dur: 1.8,
  },
  {
    p: 159, x: 146, grid: 1, oth: 1,
    text: 'Now suppose a person is on the floor beside their bed. No general category fits their situation.',
    cite: 'A particular person',
    dur: 2.8,
  },
  {
    p: 159, x: 146, grid: 1, oth: 1, note: 3,
    text: 'To you, this person isn’t a case or a number. This is someone with whom you have a relationship.',
    dur: 1.8,
  },
  {
    // 49 (down on one knee), not 43 (setting a load down while standing): the line
    // is "get down beside them", so the figure has to actually get down.
    p: 49, x: 182, grid: 1, oth: 1,
    text: 'You cross the room and kneel beside them. You haven’t yet consulted any theory.',
    cite: 'Getting closer',
    dur: 2.7,
  },
  {
    // 49 (down on one knee), not 43 (setting a load down while standing): the line
    // is "get down beside them", so the figure has to actually get down.
    p: 280, x: 182, grid: 1, oth: 1, note: 4,
    text: 'Something other than a principle is already guiding what you do.',
    dur: 1.8,
  },
  {
    // Stays 49: the prompt says "You are down on the floor beside them", so the
    // figure must still BE down. It was 30 (offer-up), which stood them back up
    // in the same breath as the sentence saying they were down.
    p: 49, x: 182, grid: 0.85, oth: 1, pick: 1,
    interact: {
      prompt: 'Beside the person in need, which question does this approach ask first?',
      explain: '“Who needs me, and how?” Care ethics starts from the particular person, not from a general rule. It attends first to who needs you and what they need, then decides what to do.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 39, x: 182, grid: 0.5, oth: 1, thread: 1,
    text: 'Carol Gilligan studied people who reasoned through relationships and care. Kohlberg’s influential scale ranked such reasoning as less mature.',
    cite: 'Carol Gilligan · 1982',
    dur: 4,
  },
  {
    p: 169, x: 182, grid: 0.5, oth: 1, thread: 1, note: 5,
    text: 'Gilligan called this a different moral voice, centred on responsibility and relationships.',
    dur: 1.8,
  },
  {
    p: 465, x: 182, grid: 0.4, oth: 1, thread: 1,
    quote: {
      id: 'lq-ethics-ethics-8-1',
      text: 'The moral problem arises from conflicting responsibilities rather than from competing rights.',
      author: 'Carol Gilligan',
      philosopherId: 'carol-gilligan',
      work: 'In a Different Voice',
      era: '1982',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 380, x: 112, grid: 0.34, oth: 1, thread: 1,
    interact: {
      prompt: 'Which of these cannot be done badly?',
      odd: {
        axis: 'THREE CAN BE DONE BADLY',
        tiles: [
          { id: 'notice', reads: 'NOTICING A NEED' },
          { id: 'listen', reads: 'LISTENING PROPERLY' },
          { id: 'follow', reads: 'FOLLOWING THROUGH' },
          { id: 'feel', reads: 'FEELING WARMLY', correct: true },
        ],
      },
      explain: 'Feeling warmly. The other three are things you can attempt and get wrong, which is what makes care a practice with standards rather than a mood. A carer who feels a great deal and notices nothing has failed at it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 38, x: 112, grid: 0.3, oth: 1, thread: 1,
    text: 'Nel Noddings developed a full ethics of care. Its basis is the relation between the one caring and the cared-for.',
    cite: 'Nel Noddings · 1984',
    dur: 3.3,
  },
  {
    p: 266, x: 112, grid: 0.3, oth: 1, thread: 1, note: 6,
    text: 'Noddings holds that ethical caring grows from natural caring, such as a parent’s care for a child.',
    dur: 1.8,
  },
  {
    p: 176, x: 172, grid: 0.28, oth: 1, thread: 1,
    text: 'Claudia Card warned that care ethics could make a virtue of women’s oppression. Gilligan held that care and justice work together.',
    cite: 'Two voices, not rivals',
    dur: 2.9,
  },
  {
    p: 176, x: 172, grid: 0.28, oth: 1, thread: 1, note: 7,
    text: 'Justice requires treating everyone equally. Care notices the person the rules never mention.',
    dur: 2,
  },
  {
    p: 461, x: 172, grid: 0.28, oth: 1, thread: 1,
    summary: {
      title: 'Morality as Relationship',
      points: [
        'Care ethics starts from relationships, not rules',
        'Gilligan identified a moral voice centred on care',
        'Noddings grounded ethics in the caring relation',
        'Justice and care complement each other',
      ],
      closing: 'Care ethics holds that moral life begins in relationships, before any rule is learned.',
    },
    dur: 3.0,
  },
];
