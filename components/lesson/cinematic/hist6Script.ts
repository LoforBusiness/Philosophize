import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-6, "Who Really Won?" — the sixth lesson on the History
// road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A TORCH-LIT EGYPTIAN TEMPLE, A GIANT CARVING OF A BATTLE, AND A CLAY TABLET.
//
// Three people talk, and nobody narrates. A visitor (the woman with the bun) is in awe of
// a carving of Ramesses II winning the Battle of Kadesh single-handed; an archaeologist
// (the newsboy cap) has a clay tablet from the Hittite capital that tells it the other way
// round; a historian (the top hat) shows how to weigh two sides' boasts.
//
// A ROAD THAT RAMPS UP (group AU): this road has taught primary and secondary sources,
// causes, change and continuity, and how Athens judged. This lesson is the harder skill
// those lead to: three ideas — every source was made by someone, for a reason · check one
// side's account against the other's · where independent sources agree, trust it more.
// The facts are real: Kadesh (about 1274 BC) had no clear winner, both kings claimed it,
// and years later they signed a peace treaty, found in both Egypt and the Hittite capital.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * awe — the visitor holds her torch up to the carving, gazing at the giant king in his chariot ·
   * tablet — the archaeologist, kneeling at his dig tray, brushes dust off a clay tablet and holds it up ·
   * mud — the visitor waves a hand at the tablet, unimpressed ·
   * reason — the historian walks in and lifts his lamp to the giant king ·
   * boast — he holds the lamp toward the tablet, then back to the carving ·
   * cards — the archaeologist laughs and shrugs ·
   * agree — the historian brings his two hands together ·
   * lovely — the visitor looks up at the king again and clasps her hands ·
   * nil — the archaeologist sets the tablet in the tray with care and pats it ·
   * rest — everyone at ease under the quotation, the torches flickering on the stone.
   */
  act?: 'awe' | 'tablet' | 'mud' | 'reason' | 'boast' | 'cards' | 'agree' | 'lovely' | 'nil' | 'rest';
  /** The historian is in the hall. He walks in on `reason`. */
  sage?: boolean;
  /**
   * First question on the stage — SPOT THE BOAST: three parts of the carving, the giant king
   * in his chariot, his horses and the border of hieroglyphs, are the things to tap.
   */
  boast?: boolean;
  /**
   * Second question on the stage — CHOOSE THE FIND: three finds laid in the archaeologist’s
   * tray, ANOTHER CARVING OF RAMESSES, A TREATY FOUND IN BOTH CAPITALS and A GIFT-SHOP
   * POSTCARD, are the things to tap.
   */
  find?: boolean;
}

export const BEATS: Hist6Beat[] = [
  {
    bed: 'museum',
    act: 'awe',
    speaker: 'bun',
    text: 'Look at him! Ramesses, alone in his chariot, beating the whole Hittite army.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.19, gain: 0.6 }],
    act: 'tablet',
    speaker: 'cap',
    text: 'Funny thing. This tablet from the Hittite capital says the Hittites won.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'mud',
    speaker: 'bun',
    text: 'Then the tablet’s wrong. It’s made of mud.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 3.04, gain: 0.6 }],
    act: 'reason', sage: true,
    speaker: 'tophat',
    text: 'Every source was made by someone, for a reason. Ramesses had this carved on his own temple, for everyone to see.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    sage: true, boast: true,
    interact: {
      prompt: 'Which part of the carving shows it was made to impress?',
      explain: 'The giant king. He’s drawn many times bigger than everyone else, which no battle ever looked like. It’s a picture made to show him mighty, not a record of the day.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'boast', sage: true,
    speaker: 'tophat',
    text: 'And the Hittite king wanted to look good too. So you check one side’s story against the other’s.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'cards', sage: true,
    speaker: 'cap',
    text: 'So both kings claim the win? My brothers do that after a game of cards.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'agree', sage: true,
    speaker: 'tophat',
    text: 'Where the two sides agree, you can trust it more. The battle had no clear winner, and years later the kings signed a peace treaty.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'lovely', sage: true,
    speaker: 'bun',
    text: 'So he drew himself ten times bigger than everyone. I think that’s lovely.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sage: true, find: true,
    interact: {
      prompt: 'Which find would best test Ramesses’s story of a great win?',
      explain: 'The treaty. Copies were found in Egypt and in the Hittite capital, agreed by both sides, so it’s the strongest check. Another carving of Ramesses only repeats his version.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'crate', at: 1.73, gain: 0.6 }],
    act: 'nil', sage: true,
    speaker: 'cap',
    text: 'Mud tablets, one. Giant carvings, nil.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', sage: true,
    quote: {
      id: 'lq-history-foundations-6-1',
      text: 'Study the historian before you begin to study the facts.',
      author: 'E. H. Carr',
      work: 'What Is History?',
      era: '1961',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    sage: true,
    summary: {
      title: 'Who Really Won?',
      points: [
        'Every source was made by someone, for a reason',
        'Check one side’s account against the other’s',
        'Where independent sources agree, trust it more',
      ],
      closing: 'Next time you read a news story, ask who made it, and why.',
    },
    dur: 2.8,
  },
];
