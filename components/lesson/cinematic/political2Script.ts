import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-2, "Power and People" — Weber's power vs
// authority. The same pair plays it out: a mugger who threatens and a subject who
// cowers (raw power), versus a legitimate ruler on a podium and a subject who
// bows or adores (authority). Distinct body language every beat.
//
// Both graded questions come from data/.../power-and-people.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol2Beat extends BaseBeat {
  /** Ruler gesture (emote code). */ r?: number;
  /** Subject gesture (emote code). */ sub?: number;
  /** The ruler stands on a podium (legitimacy, not just force). */ podium?: boolean;
}

export const BEATS: Pol2Beat[] = [
  {
    r: 10, sub: 8, podium: false,
    text: 'Force can make you obey. Can it make you agree? Power bends bodies; authority wins minds. They are not the same thing.',
    dur: 3.6,
  },
  {
    r: 13, sub: 18, podium: false,
    text: 'Weber split two ideas we blur. Power imposes your will despite resistance, by threat or force — a mugger has it. Authority is being obeyed because people accept your commands as valid.',
    cite: 'Weber: power vs authority',
    dur: 4.8,
  },
  {
    r: 7, sub: 4, podium: true,
    text: 'Augustine sharpened it. A captured pirate told Alexander: with one ship I am a robber; you with a fleet are an emperor. Both take by threat — only legitimacy tells them apart.',
    cite: 'Augustine, City of God, IV.4',
    dur: 4.8,
  },
  {
    r: 1, sub: 17, podium: true,
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
    r: 3, sub: 0, podium: true,
    text: 'Weber sorted legitimacy into three sources. Traditional authority leans on custom and bloodline. Charismatic flows from devotion to one person. Rational-legal rests on rules, offices, and law.',
    cite: 'Weber’s three types',
    dur: 4.8,
  },
  {
    r: 20, sub: 9, podium: true,
    mc: {
      prompt: 'Which type of authority best fits an elected president?',
      options: [
        { id: 'a', text: 'Traditional authority, rooted in inherited custom', correct: false },
        { id: 'b', text: 'Charismatic authority, rooted in personal magnetism', correct: false },
        { id: 'c', text: 'Rational-legal authority, rooted in office and law', correct: true },
        { id: 'd', text: 'None — elected officials hold only raw power', correct: false },
      ],
      explain:
        'A president commands through a constitutional office and a lawful vote, not inherited custom or personal magnetism. That is Weber’s rational-legal authority.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    r: 16, sub: 19, podium: true,
    mc: {
      prompt: 'A wildly popular, magnetic leader wins a landslide election. Which authority makes their commands legitimate?',
      options: [
        { id: 'a', text: 'Charismatic, since their personal magnetism is obvious', correct: false },
        { id: 'b', text: 'Rational-legal, since legitimacy comes from the elected office, not the charm', correct: true },
        { id: 'c', text: 'Traditional, since landslides become a custom', correct: false },
        { id: 'd', text: 'Pure power, since popularity is just force in disguise', correct: false },
      ],
      explain:
        'Charisma may win the vote, but the legitimacy of the commands flows from the lawful office they now hold. Real leaders blend types; the binding one here is rational-legal.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
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
