import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-2, "Power and People" — Weber's power vs
// authority. The same pair plays it out: a mugger who threatens and a subject who
// cowers (raw power), versus a legitimate ruler on a podium and a subject who
// bows or adores (authority). Distinct body language every beat.
//
// The stage carries two pieces of information design:
//   · a BODIES / MINDS bar matrix — power fills only the bodies column, authority
//     fills both, which is beat 1's sentence drawn rather than said;
//   · a four-row LEGITIMACY LEDGER of Weber's sources, which becomes the tap
//     target for the first graded question (answered IN the scene).
//
// Both graded questions come from data/.../power-and-people.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol2Beat extends BaseBeat {
  /** Ruler gesture (emote code). */ r?: number;
  /** Subject gesture (emote code). */ sub?: number;
  /** The ruler stands on a podium (legitimacy, not just force). */ podium?: boolean;
  /** Bar matrix rows shown: 0 none · 1 POWER · 2 POWER + AUTHORITY. */ chart?: number;
  /** The legitimacy ledger is on stage (and the subject steps out). */ ledger?: boolean;
}

export const BEATS: Pol2Beat[] = [
  {
    r: 161, sub: 8, podium: false, chart: 1,
    text: 'Force can compel obedience. Can force alone make people accept that a command is rightful?',
    dur: 1.8,
  },
  {
    r: 161, sub: 8, podium: false, chart: 1,
    text: 'Power controls bodies through the threat of force. Authority also commands minds, because the people who obey accept it as rightful.',
    dur: 2,
  },
  {
    r: 13, sub: 18, podium: false, chart: 2,
    text: 'Max Weber distinguished power from authority. Power is carrying out your will despite resistance, as a mugger does.',
    cite: 'Power and authority',
    dur: 3.1,
  },
  {
    r: 13, sub: 18, podium: false, chart: 2,
    text: 'Authority is power that people accept as legitimate. They obey because they believe the ruler is entitled to command.',
    dur: 1.8,
  },
  {
    r: 7, sub: 4, podium: true, chart: 2,
    text: 'Augustine tells of a pirate captured by Alexander the Great. The pirate said that a lone ship makes a man a robber, while a whole fleet makes him an emperor.',
    cite: 'Augustine, The City of God',
    dur: 3.3,
  },
  {
    r: 7, sub: 4, podium: true, chart: 2,
    text: 'Without justice, Augustine says, a kingdom is a band of robbers. Both take by threat, and only legitimacy tells them apart.',
    dur: 1.8,
  },
  {
    r: 1, sub: 17, podium: true, chart: 2,
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
    r: 168, sub: 0, podium: true, chart: 2, ledger: true,
    text: 'Weber named three sources of legitimate power. One kind rests on custom and birth, as in a hereditary monarchy.',
    cite: 'Weber’s three types',
    dur: 1.8,
  },
  {
    r: 409, sub: 0, podium: true, chart: 2, ledger: true,
    text: 'Charisma rests on devotion to one person. Rational-legal authority rests on law, so it stays with the office when the holder goes.',
    dur: 3.2,
  },
  {
    r: 20, sub: 9, podium: true, chart: 2, ledger: true,
    // Answered ON the ledger: the four rows are the four options, so the reader
    // picks a source of legitimacy rather than reading a list of sentences.
    interact: {
      prompt: 'Which type of authority best fits an elected president?',
      explain:
        'Rational-legal. A president is obeyed because of the office and the vote that filled it. The orders don’t bind because of custom, bloodline or devotion. Raw force isn’t authority at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    r: 16, sub: 19, podium: true, chart: 2, ledger: true,
    interact: {
      prompt: 'A charismatic mayor wins a landslide election. What makes the mayor’s commands legitimate?',
      sort: {
        chip: 'the mayor',
        bins: [
          { id: 'person', label: 'charisma', reads: 'devotion to the mayor as a person' },
          { id: 'custom', label: 'tradition', reads: 'custom, the way things have always been done' },
          { id: 'office', label: 'the office', reads: 'the lawful office the mayor now holds', correct: true },
        ],
      },
      explain: 'The office. Charisma may help a candidate win votes, but it doesn’t make the mayor’s orders binding. That legitimacy comes from the lawful office. Weber’s types are ideal types, pure models that real leaders combine. The question is which one grounds the obligation.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    ledger: true,
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
