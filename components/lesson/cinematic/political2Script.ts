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
    text: 'Force can make you obey. Can it make you agree? Power bends bodies; authority wins minds. They are not the same thing.',
    dur: 3.6,
  },
  {
    r: 13, sub: 18, podium: false, chart: 2,
    text: 'Weber split two ideas we blur. Power imposes your will despite resistance, by threat or force — a mugger has it. Authority is being obeyed because people accept your commands as valid.',
    cite: 'Weber: power vs authority',
    dur: 4.8,
  },
  {
    r: 7, sub: 4, podium: true, chart: 2,
    text: 'Augustine sharpened it. A captured pirate told Alexander: with one ship I am a robber; you with a fleet are an emperor. Both take by threat — only legitimacy tells them apart.',
    cite: 'Augustine, City of God, IV.4',
    dur: 4.8,
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
    text: 'Weber sorted legitimacy into three sources. Traditional authority leans on custom and bloodline. Charismatic flows from devotion to one person. Rational-legal rests on rules, offices, and law.',
    cite: 'Weber’s three types',
    dur: 4.8,
  },
  {
    r: 20, sub: 9, podium: true, chart: 2, ledger: true,
    // Answered ON the ledger: the four rows are the four options, so the reader
    // picks a source of legitimacy rather than reading a list of sentences.
    interact: {
      prompt: 'Which type of authority best fits an elected president?',
      explain:
        'A president commands through a constitutional office and a lawful vote, not inherited custom or personal magnetism. That is Weber’s rational-legal authority.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    r: 16, sub: 19, podium: true, chart: 2, ledger: true,
    interact: {
      prompt: 'A wildly popular, magnetic leader wins a landslide election. Which authority makes their commands legitimate?',
      cards: [
        { text: 'Rational-legal, from the office', correct: true },
        { text: 'Charismatic, from the person', correct: false },
      ],
      explain: 'Charisma may win the vote, but the legitimacy of the commands flows from the lawful office they now hold. Real leaders blend types; the binding one here is rational-legal.',
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
      closing: 'Lasting rule rests on accepted legitimacy, not sheer force alone.',
    },
    dur: 2.8,
  },
];
