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
    r: 10, sub: 8, podium: false, chart: 1,
    text: 'Force can make you obey. Can it make you agree?',
    dur: 1.8,
  },
  {
    r: 10, sub: 8, podium: false, chart: 1,
    text: 'Power bends bodies; authority wins minds. They are not the same thing.',
    dur: 2,
  },
  {
    r: 13, sub: 18, podium: false, chart: 2,
    text: 'Weber split two ideas we blur together. Power gets its way despite resistance, by threat or force, and a mugger has it.',
    cite: 'Weber: power vs authority',
    dur: 3.1,
  },
  {
    r: 13, sub: 18, podium: false, chart: 2,
    text: 'Authority is being obeyed because people think you are entitled to be.',
    dur: 1.8,
  },
  {
    r: 7, sub: 4, podium: true, chart: 2,
    text: 'Augustine sharpened it. A captured pirate told Alexander: with one ship I am a robber; you with a fleet are an emperor.',
    cite: 'Augustine, City of God, IV.4',
    dur: 3.3,
  },
  {
    r: 7, sub: 4, podium: true, chart: 2,
    text: 'Both take by threat — only legitimacy tells them apart.',
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
    r: 3, sub: 0, podium: true, chart: 2, ledger: true,
    text: 'Weber sorted legitimacy into three sources. Tradition leans on custom and bloodline.',
    cite: 'Weber’s three types',
    dur: 1.8,
  },
  {
    r: 3, sub: 0, podium: true, chart: 2, ledger: true,
    text: 'Charisma runs on devotion to one person. The third kind rests on rules and offices, where power sits in the job rather than the holder.',
    dur: 3.2,
  },
  {
    r: 20, sub: 9, podium: true, chart: 2, ledger: true,
    // Answered ON the ledger: the four rows are the four options, so the reader
    // picks a source of legitimacy rather than reading a list of sentences.
    interact: {
      prompt: 'Which type of authority best fits an elected president?',
      explain:
        'A president is obeyed because of the office and the vote that put them in it. Not because of family, and not because of charm. Weber called that rational-legal authority.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    r: 16, sub: 19, podium: true, chart: 2, ledger: true,
    interact: {
      prompt: 'Set the lever to what makes their commands binding.',
      lever: {
        start: 0,
        stops: [
          { id: 'person', reads: 'the person, who is magnetic' },
          { id: 'custom', reads: 'the way it has always been done' },
          { id: 'office', reads: 'the lawful office they now hold', correct: true },
        ],
      },
      explain: 'The far setting. Charisma may well have won the vote, and it is not what makes an order binding afterwards: that flows from the office. Real leaders blend all three, so the question is always which one is doing the work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    ledger: true,
    summary: {
      title: 'Where Political Power Comes From',
      points: [
        'Power forces action; authority is obeyed as legitimate',
        'Weber’s types: tradition, charisma, rational-legal',
        'They are ideal types; real regimes blend them',
        'Charisma is unstable until routinized into law',
      ],
      closing: 'Rule that lasts rests on being accepted, not on force alone.',
    },
    dur: 2.8,
  },
];
