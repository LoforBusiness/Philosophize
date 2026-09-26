import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-2, "Where Political Power Comes From".
// Theme: A HARBOUR: A MUGGER ON THE DOCK, A HARBOURMASTER THE BOATS OBEY.
//
// On the dock a mugger takes a merchant's purse by force, while the harbourmaster
// waves a boat in and it comes: power against authority. A lone pirate ship sails in,
// then Alexander's whole fleet — Augustine's pirate, and a kingdom without justice.
// Three flags go up the harbour poles for Weber's three sources, and for the third
// the harbourmaster hangs his signal flag on the harbour office: the office
// keeps it when the holder goes.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts). Every line, citation, quotation and summary point is copied
// from the previous script by a generator, word for word and beat for beat; both
// questions are asked on the stage.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol2Beat extends BaseBeat {
  /** The harbourmaster's pose under his act. Bands per N2: <100 rig, 100+ held, 300+ played. */ h?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'mug' | 'wave' | 'power' | 'authority' | 'pirate' | 'fleet' | 'crown' | 'office';
  /** Tags up: 1 POWER over the mugger · 2 AUTHORITY over the harbourmaster. */ tags?: number;
  /** The pirate ship and the fleet are in the harbour (they sail in on b4, out on b7). */ ships?: boolean;
  /** LEGITIMATE is stamped under the harbourmaster's AUTHORITY. */ legit?: boolean;
  /** How many of the three flags are up: 1 the crown · 3 and the portrait and the law. */ flags?: number;
  /** The signal flag hangs on the harbour office, not in his hand. */ hung?: boolean;
  /** Q1 on the stage: the three flags. */ poles?: boolean;
  /** Q2 on the stage: three bollards. */ bollards?: boolean;
}

export const BEATS: Pol2Beat[] = [
  {
    h: 261, act: 'mug',
    text: 'Force can compel obedience. Can force alone make people accept that a command is rightful?',
    dur: 1.8,
  },
  {
    h: 158, act: 'wave',
    text: 'Power controls bodies through the threat of force. Authority also commands minds, because the people who obey accept it as rightful.',
    dur: 2,
  },
  {
    h: 165, act: 'power', tags: 1,
    text: 'Max Weber distinguished power from authority. Power is carrying out your will despite resistance, as a mugger does.',
    cite: 'Power and authority',
    dur: 3.1,
  },
  {
    h: 158, act: 'authority', tags: 2,
    text: 'Authority is power that people accept as legitimate. They obey because they believe the ruler is entitled to command.',
    dur: 1.8,
  },
  {
    h: 158, act: 'pirate', tags: 2, ships: true,
    text: 'Augustine tells of a pirate captured by Alexander the Great. The pirate said that a lone ship makes a man a robber, while a whole fleet makes him an emperor.',
    cite: 'Augustine, The City of God',
    dur: 3.3,
  },
  {
    h: 167, act: 'fleet', tags: 2, ships: true, legit: true,
    text: 'Without justice, Augustine says, a kingdom is a band of robbers. Both take by threat, and only legitimacy tells them apart.',
    dur: 1.8,
  },
  {
    h: 263, tags: 2, ships: true, legit: true,
    quote: {
      id: 'lq-political-political-2-1',
      text: 'A state is a human community that claims the monopoly of the legitimate use of physical force within a given territory.',
      author: 'Max Weber',
      work: 'Politics as a Vocation',
      era: '1919',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    h: 158, act: 'crown', tags: 2, legit: true, flags: 1,
    text: 'Weber named three sources of legitimate power. One kind rests on custom and birth, as in a hereditary monarchy.',
    cite: 'Weber’s three types',
    dur: 1.8,
  },
  {
    h: 158, act: 'office', tags: 2, legit: true, flags: 3, hung: true,
    text: 'Charisma rests on devotion to one person. Rational-legal authority rests on law, so it stays with the office when the holder goes.',
    dur: 3.2,
  },
  {
    h: 260, tags: 2, legit: true, flags: 3, hung: true, poles: true,
    interact: {
      prompt: 'Which flag does an elected president fly under?',
      explain: 'The law. A president is obeyed because of the office and the vote that filled it, not because of custom, bloodline or devotion. When the term ends the office passes on, as the signal flag stays with the harbour office.',
      xp: 5,
    },
    dur: 1,
  },
  {
    h: 260, tags: 2, legit: true, flags: 3, hung: true, bollards: true,
    interact: {
      prompt: 'A charismatic mayor wins a landslide election. What makes the mayor’s commands legitimate?',
      explain: 'The office. Charisma may win the votes, but it doesn’t make the orders binding; that comes from the lawful office. Weber’s types are ideal types that real leaders combine, and the question is which one grounds the duty to obey.',
      xp: 5,
    },
    dur: 1,
  },
  {
    tags: 2, legit: true, flags: 3, hung: true,
    summary: {
      title: 'Where Political Power Comes From',
      points: [
        'Power compels, but authority is obeyed as legitimate',
        'Weber’s types: tradition, charisma, rational-legal',
        'Real regimes blend these ideal types',
        'Charisma is unstable until routinised into rules',
      ],
      closing: 'For Weber, stable rule depends on belief in its legitimacy, not on force alone.',
    },
    dur: 2.8,
  },
];
