// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK — the colour, the tiers, and the mascot's ladder.
//
//   npm run check:streak
//
// constants/streak.ts has claimed since it was written that "npm run check:streak
// re-derives every one of them so this comment cannot drift into fiction". No such
// script existed. That is the same failure as the `openForTargets` note in H60 — a
// safety property asserted under a name nobody can grep — and it is worse here,
// because the numbers it describes are CONTRAST RATIOS. A colour that quietly drops
// below 4.5:1 is unreadable for the readers least able to complain about it.
//
// So this actually computes them, from the hex values the app ships.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './lib/loadts.mjs';

let fails = 0;
const ok = (msg, detail) => console.log(`  ok    ${msg}${detail ? `  ${detail}` : ''}`);
const bad = (msg, detail) => { fails++; console.log(`  FAIL  ${msg}${detail ? `  ${detail}` : ''}`); };
const head = (t) => console.log(`\n${t}\n`);

// ── WCAG relative luminance, the real formula and not an approximation ───────
//
// The sRGB channels are gamma-encoded, so averaging the raw bytes gives an answer
// that is wrong in the direction that matters: it flatters mid-tones, which is
// exactly where a "surely that is dark enough" colour sits.
const lum = (hex) => {
  const c = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAPER = '#FAFAF7';
const CREAM = '#F5F1E8';
const INK = '#1A1A1A';

const streak = await loadTs(path.join('constants', 'streak.ts'));
const mood = await loadTs(path.join('lib', 'utils', 'streakMood.ts'));

head('THE EMBER, MEASURED');
{
  // The numbers written into constants/streak.ts's comments, re-derived. A comment
  // that states a ratio is a claim; this is the check that it is still true.
  const claims = [
    ['EMBER on paper', streak.EMBER, PAPER, 4.5],
    ['EMBER_DEEP on paper', streak.EMBER_DEEP, PAPER, 4.5],
    ['EMBER_DEEP carrying cream', streak.EMBER_DEEP, CREAM, 4.5],
    ['ink on EMBER_SOFT', INK, streak.EMBER_SOFT, 4.5],
    ['ASH on paper', streak.ASH, PAPER, 4.5],
  ];
  for (const [name, fg, bg, floor] of claims) {
    const r = ratio(fg, bg);
    if (r >= floor) ok(`${name} is ${r.toFixed(2)}:1`, `floor ${floor}`);
    else bad(`${name} is only ${r.toFixed(2)}:1`, `needs ${floor} — see the ASH note`);
  }
  // A LAPSED STREAK MUST NOT READ AS A DIM LIVE ONE — and the first version of this
  // check measured the wrong thing, which is worth keeping written down because the
  // wrong thing was the obvious thing.
  //
  // It compared LUMINANCE, and reported a failure at 0.012 apart. That is not a
  // defect, it is the design: both colours are chosen to land near 5:1 on paper so
  // that either can carry the streak number, so their luminance MUST be close. What
  // separates them is warmth — a hot orange against a cool grey — and a checker that
  // could not see the distinction the whole palette is built on was measuring
  // brightness because brightness is easy to measure.
  //
  // So: CIELAB ΔE, which is the distance a person would describe.
  const lab = (hex) => {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    // sRGB → XYZ (D65) → Lab
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  };
  const [L1, a1, b1] = lab(streak.EMBER);
  const [L2, a2, b2] = lab(streak.ASH);
  const dE = Math.hypot(L1 - L2, a1 - a2, b1 - b2);
  if (dE > 20) ok('ember and ash are different colours, not two brightnesses',
    `ΔE ${dE.toFixed(1)}, and only ${Math.abs(L1 - L2).toFixed(1)} of it is lightness`);
  else bad('ember and ash are too close to tell apart', `ΔE ${dE.toFixed(1)}`);

  // AND THE COROLLARY, since the separation is almost entirely chroma: a reader who
  // cannot see the hue difference has nothing left. Alive and lapsed must therefore
  // differ by something that is not colour at all — the copy, the mascot's pose, a
  // broken bar in the calendar — and this records the reason rather than testing it,
  // because "the screen says something different" is not a thing a hex value knows.
  if (Math.abs(L1 - L2) < 8) {
    ok('lightness alone does not carry the state, so the screen must not rely on it',
      `only ${Math.abs(L1 - L2).toFixed(1)} L apart — the mascot and the copy carry it too`);
  }
}

head('THE SOCIETY');
{
  const tiers = streak.STREAK_TIERS;
  const miles = streak.STREAK_MILESTONES;
  ok(`${tiers.length} tiers`, tiers.map((t) => `${t.at} ${t.name}`).join(' · '));
  // ONE LADDER, NOT TWO. If a tier sits somewhere the reward screen does not
  // celebrate, the reader is told they have joined something by a screen they had
  // to go looking for, on a day nothing else marked.
  const off = tiers.filter((t) => !miles.includes(t.at));
  if (off.length) bad(`${off.length} tier(s) do not land on a milestone`, off.map((t) => t.at).join(', '));
  else ok('every tier lands on a STREAK_MILESTONE');

  let rising = true;
  for (let i = 1; i < tiers.length; i++) if (tiers[i].at <= tiers[i - 1].at) rising = false;
  if (rising) ok('tiers ascend'); else bad('tiers are out of order');

  // The lookup has to agree with the table at, and either side of, every threshold.
  let lookup = true;
  for (const t of tiers) {
    if (streak.tierFor(t.at)?.name !== t.name) lookup = false;
    if (streak.tierFor(t.at - 1)?.name === t.name) lookup = false;
  }
  if (streak.tierFor(0) !== null) lookup = false;
  if (lookup) ok('tierFor agrees with the table at every boundary');
  else bad('tierFor disagrees with the table at a boundary');
}

head('THE MASCOT');
{
  // EVERY MOOD MUST BE REACHABLE. A ladder with an unreachable rung is a character
  // trait nobody ever sees, and the escalation is the entire feature — if 'urgent'
  // cannot be produced then the app never actually leans on anyone.
  const seen = new Map();
  for (const alive of [true, false]) {
    for (const fedToday of [true, false]) {
      for (const restSpent of [0, 1]) {
        for (let hour = 0; hour < 24; hour++) {
          const m = mood.moodFor({ streak: 12, alive, fedToday, hour, restSpent, dayKey: '2026-08-14' });
          seen.set(m.mood, (seen.get(m.mood) ?? 0) + 1);
        }
      }
    }
  }
  const want = ['proud', 'waiting', 'impatient', 'urgent', 'rescued', 'lapsed'];
  const missing = want.filter((m) => !seen.has(m));
  if (missing.length) bad(`${missing.length} mood(s) unreachable`, missing.join(', '));
  else ok('all six moods are reachable', [...seen.entries()].map(([k, v]) => `${k} ${v}`).join(' · '));

  // Every pose the ladder names must exist in the rig's emote table, or the mascot
  // renders as whatever code 46 happens to mean this month.
  const rig = fs.readFileSync(path.join('components', 'lesson', 'cinematic', 'rig.ts'), 'utf8');
  const table = rig.slice(rig.indexOf('The settled pose for gesture'), rig.indexOf('The settled pose for gesture') + 1600);
  // EACH MOOD DRIVEN BY ITS OWN INPUTS, not by one set with the name changed. The
  // first version passed hour: 12 for all six, so 'impatient' and 'urgent' silently
  // resolved to 'waiting' and their poses were never checked at all — it reported
  // "4 poses, all present" for a ladder of six and looked like a pass.
  const INPUTS = {
    proud: { alive: true, fedToday: true, hour: 12, restSpent: 0 },
    waiting: { alive: true, fedToday: false, hour: 10, restSpent: 0 },
    impatient: { alive: true, fedToday: false, hour: 19, restSpent: 0 },
    urgent: { alive: true, fedToday: false, hour: 22, restSpent: 0 },
    rescued: { alive: true, fedToday: false, hour: 12, restSpent: 1 },
    lapsed: { alive: false, fedToday: false, hour: 12, restSpent: 0 },
  };
  let posesOk = true;
  const named = new Map();
  for (const m of want) {
    const st = mood.moodFor({ streak: 12, dayKey: '2026-08-14', ...INPUTS[m] });
    if (st.mood !== m) { posesOk = false; bad(`inputs for '${m}' actually produce '${st.mood}'`); continue; }
    named.set(m, st.pose);
    if (!new RegExp(`\\b${st.pose}\\s+[a-z-]`).test(table)) { posesOk = false; bad(`pose ${st.pose} is not in the rig's emote table`); }
  }
  const distinct = new Set(named.values());
  if (posesOk) ok(`${named.size} moods → ${distinct.size} poses, all present in the rig`,
    [...named.entries()].map(([m, p]) => `${m} ${p}`).join(' · '));
  // Six moods sharing three poses would make the escalation invisible, which is the
  // only part of it the reader sees before reading a word.
  if (distinct.size >= 5) ok('the ladder looks different at each rung');
  else bad(`only ${distinct.size} distinct poses across ${named.size} moods`);

  // THE EMBER DECAYS, AND NEVER TO NOTHING WHILE THE STREAK LIVES. A flame that
  // looks dead while it is still savable costs the reader the streak it was meant
  // to protect.
  const at = (hour) => mood.emberFor({ streak: 5, alive: true, fedToday: false, hour, restSpent: 0, dayKey: 'x' });
  let falling = true;
  for (let h = mood.EVENING_HOUR; h < 23; h++) if (at(h + 1) > at(h) + 1e-9) falling = false;
  if (falling && at(23) < at(mood.EVENING_HOUR)) ok('the ember sinks across the evening',
    `${at(mood.EVENING_HOUR).toFixed(2)} at ${mood.EVENING_HOUR}:00 → ${at(23).toFixed(2)} at 23:00`);
  else bad('the ember does not decay across the evening');
  if (at(23) >= mood.EMBER_FLOOR - 1e-9) ok('and never below the floor while alive', `floor ${mood.EMBER_FLOOR}`);
  else bad('the ember falls below its floor while the streak is still alive');
  const dead = mood.emberFor({ streak: 5, alive: false, fedToday: false, hour: 12, restSpent: 0, dayKey: 'x' });
  if (dead === 0) ok('a lapsed streak is out, not dim'); else bad('a lapsed streak still glows', String(dead));

  // A LINE IS STABLE WITHIN A DAY AND MOVES BETWEEN DAYS. Re-rolling on every render
  // would make him read as several people having one conversation.
  const a = mood.lineFor('waiting', '2026-08-14');
  const b = mood.lineFor('waiting', '2026-08-14');
  const c = mood.lineFor('waiting', '2026-08-15');
  if (a === b) ok('his line holds for the whole day'); else bad('his line changes within a day');
  const spread = new Set([...Array(40)].map((_, i) => mood.lineFor('waiting', `2026-09-${String(i + 1).padStart(2, '0')}`)));
  if (spread.size > 1) ok('and varies across days', `${spread.size} distinct lines in 40 days`);
  else bad('the same line every day', a === c ? '' : '');

  // HE NEEDLES ATTENDANCE, NEVER ABILITY. The one line in his brief that is about
  // safety rather than tone: "you did not come" is fair, "you are bad at this" is
  // the sentence most likely to make a beginner leave, and it must not be sayable.
  const banned = /\b(stupid|dumb|idiot|useless|hopeless|bad at|too slow|never learn|failure)\b/i;
  const src = fs.readFileSync(path.join('lib', 'utils', 'streakMood.ts'), 'utf8');
  const block = src.slice(src.indexOf('const LINES'), src.indexOf('export function lineFor'));
  const hits = [...block.matchAll(/'([^']{8,})'/g)].map((m) => m[1]).filter((l) => banned.test(l));
  if (hits.length) bad(`${hits.length} line(s) attack the reader's ability, not their attendance`, hits[0]);
  else ok('every line needles attendance, not ability');
}

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
