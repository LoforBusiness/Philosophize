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
}

export const BEATS: Ethics8Beat[] = [
  {
    p: 12, x: 80,
    text: 'A friend goes quiet for two weeks. You could work out what you owe them, fairly and impartially. Or you could just go and sit with them. For a long time, only the first one counted as ethics.',
    dur: 4.6,
  },
  {
    p: 47, x: 80, grid: 1,
    text: 'Most big theories start the same way. Step back, be impartial, and find the rule or the total that covers everyone equally. Tidy boxes — and nobody’s name in any of them.',
    cite: 'The usual method',
    dur: 4.8,
  },
  {
    p: 45, x: 146, grid: 1, oth: 1,
    text: 'Then you look up. Someone is on the floor by their bed, and no box fits them. Not a case, not a number. The one you know.',
    cite: 'Someone actually there',
    dur: 4.4,
  },
  {
    // 49 (down on one knee), not 43 (setting a load down while standing): the line
    // is "get down beside them", so the figure has to actually get down.
    p: 49, x: 182, grid: 1, oth: 1,
    text: 'You cross the room and get down beside them. No theory has said a word yet. Something else is already telling you what to do.',
    cite: 'Getting closer',
    dur: 4.2,
  },
  {
    // Stays 49: the prompt says "You are down on the floor beside them", so the
    // figure must still BE down. It was 30 (offer-up), which stood them back up
    // in the same breath as the sentence saying they were down.
    p: 49, x: 182, grid: 0.85, oth: 1, pick: 1,
    interact: {
      prompt: 'You are down on the floor beside them. Tap the question this way of thinking asks FIRST.',
      explain: 'It starts with the person, not the rulebook. Notice who needs you and what they actually need — and only then work out what to do. Attention comes before judgement.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 39, x: 182, grid: 0.5, oth: 1, thread: 1,
    text: 'That move has a name. Carol Gilligan kept hearing people reason through bonds and care, and the textbooks had no word for it. She called the pattern a different voice.',
    cite: 'Carol Gilligan · 1982',
    dur: 5.2,
  },
  {
    p: 137, x: 182, grid: 0.4, oth: 1, thread: 1,
    quote: {
      id: 'lq-ethics-ethics-8-1',
      text: 'The moral problem arises from conflicting responsibilities rather than from competing rights.',
      author: 'Carol Gilligan',
      work: 'In a Different Voice',
      era: '1982',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 4, x: 112, grid: 0.34, oth: 1, thread: 1,
    interact: {
      prompt: 'So is caring just being nice — soft, warm and without any real standards?',
      cards: [
        { text: 'No, it is a method', correct: true },
        { text: 'Yes, feelings are not method', correct: false },
      ],
      explain: 'The trap: care sounds like a mood, so it is easy to file under "nice" instead of "reasoning". But it makes demands — pay attention, accept the responsibility, respond to who is actually there — and you can fail every one of them. Impartial rules never even ask.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 38, x: 112, grid: 0.3, oth: 1, thread: 1,
    text: 'Nel Noddings built that into a full ethics. Morality, she argued, grows out of the bond between the one caring and the one cared for. You learned right and wrong on a kitchen floor, long before any rulebook.',
    cite: 'Nel Noddings · 1984',
    dur: 5.0,
  },
  {
    p: 21, x: 172, grid: 0.28, oth: 1, thread: 1,
    text: 'Critics feared care would trap people in endless self-sacrifice. Gilligan’s answer: care and justice are two lenses, not rivals. Rules stop you being cruel. Care notices the person the rules never mention.',
    cite: 'Two voices, not rivals',
    dur: 4.8,
  },
  {
    p: 0, x: 172, grid: 0.28, oth: 1, thread: 1,
    summary: {
      title: 'Morality as Relationship',
      points: [
        'Care ethics starts from bonds, not rules',
        'Gilligan named a long-ignored moral voice',
        'Noddings turned caring into a method',
        'Justice and care work as partners',
      ],
      closing: 'Long before you ever weighed a rule, someone sat down beside you.',
    },
    dur: 3.0,
  },
];
