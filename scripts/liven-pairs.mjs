// GIVE A FROZEN LISTENER SOMETHING TO DO (N21).
//
//   node scripts/liven-pairs.mjs <replay-log>          write
//   node scripts/liven-pairs.mjs <replay-log> --dry    say what it would write
//
// The input is `REPLAY_VERBOSE=1 node scripts/check-replay.mjs` output, whose FROZEN
// list names every figure that stands still (head and hands under 5 units a beat)
// while another on the same stage is doing something. Where that figure's pose comes
// from a script field, this sets the field on exactly those beats to a LISTENING
// hold — rotated, never the same one twice running, and never the value the next
// beat already carries, so a listener nods, then leans in, then thinks it over.
//
// IDEMPOTENT BY CONSTRUCTION: a figure that has been given a listening hold is no
// longer frozen, so the next replay does not name it and a second run changes
// nothing. A figure this cannot map (posed by the scene's own function rather than
// a script field) is printed and left for a hand edit.
import fs from 'node:fs';
import path from 'node:path';

const [logFile, flag] = process.argv.slice(2);
if (!logFile) { console.error('usage: node scripts/liven-pairs.mjs <replay-log> [--dry]'); process.exit(2); }
const DRY = flag === '--dry';
const CIN = path.join('components', 'lesson', 'cinematic');

/** Held codes that read as listening, measured to move 4+ units in any 5s window:
 *  nodding along, waiting for the answer, thinking it over. (159 LISTENING and 177
 *  LEANING IN measured 0.9 and 1.4 — a listener in name only.) */
const LISTEN = [263, 260, 257];

/** Which script field poses the figure standing at x, per lesson. */
const MAP = {
  'aesthetics-aesthetics-2': { stem: 'aesthetics2', fields: { 112: 'a', 292: 'v' } },
  'aesthetics-aesthetics-4': { stem: 'aesthetics4', fields: { 104: 'a', 334: 'v' } },
  'aesthetics-aesthetics-7': { stem: 'aesthetics7', fields: { 340: 'q', 250: 'p' } },
  'epistemology-knowledge-3': { stem: 'epistemology2', fields: { 272: 'd' } },
  'epistemology-knowledge-4': { stem: 'epistemology4', fields: { 96: 'e', 296: 'r' } },
  'ethics-ethics-2': { stem: 'ethics2', fields: { 108: 'g', 262: 'p' } },
  'ethics-ethics-32': { stem: 'ethics32', fields: { 82: 'a', 300: 'b' } },
  'ethics-ethics-4': { stem: 'ethics4', fields: { 118: 'a', 282: 'b' } },
  'ethics-ethics-6': { stem: 'ethics6', fields: { 216: 'str' } },
  'logic-arguments-32': { stem: 'logic32', fields: { 66: 'a', 316: 'b' } },
  'logic-arguments-9': { stem: 'logic9', fields: { 96: 'a', 264: 'd' } },
  'metaphysics-being-11': { stem: 'metaphysics11', fields: { 110: 'p', 290: 'c' } },
  'political-political-3': { stem: 'political3', fields: { 66: 'sub', 334: 'r' } },
};

const log = fs.readFileSync(logFile, 'utf8');
const frozen = [...log.matchAll(/^\s+(\S+) beat (\d+): the figure at x (\d+) stands frozen/gm)]
  .map((m) => ({ id: m[1], n: +m[2], x: +m[3] }));

const byFile = new Map();
const unmapped = [];
for (const f of frozen) {
  const m = MAP[f.id];
  const field = m && m.fields[f.x];
  if (!field) { unmapped.push(f); continue; }
  const file = path.join(CIN, `${m.stem}Script.ts`);
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push({ ...f, field });
}

// Beats are split the way validate-cinematic splits them.
const SEP = '\n  {\n';
// A beat's own fields sit on lines indented EXACTLY four spaces, several to a line
// (`    a: 2, v: 0, ask: 1,`); anything deeper belongs to a nested object. The first
// version of this looked only at the start of a line, missed `v` in the middle of
// one, and ADDED a second `v:` above it — which the later key silently overrode.
const fieldRe = (field) => new RegExp(`(^ {4}(?! )(?:[^\\n]*?[ ,{])?)${field}:\\s*(-?\\d+)`, 'm');
const valueIn = (chunk, field) => {
  const m = fieldRe(field).exec(chunk);
  return m ? +m[2] : null;
};

let changed = 0;
for (const [file, list] of byFile) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('\r\n')) throw new Error(`${file} is CRLF — normalise it first (§21)`);
  const parts = src.split(SEP);
  list.sort((a, b) => a.n - b.n);
  for (const f of list) {
    const k = f.n + 1;                                // parts[0] is the preamble
    if (!parts[k]) { unmapped.push({ ...f, why: 'no such beat' }); continue; }
    const prev = f.n > 0 ? valueIn(parts[k - 1], f.field) : null;
    const next = parts[k + 1] ? valueIn(parts[k + 1], f.field) : null;
    const pick = LISTEN.find((c) => c !== prev && c !== next) ?? LISTEN[0];
    const re = fieldRe(f.field);
    const before = parts[k];
    parts[k] = re.test(before)
      ? before.replace(re, (m0, lead) => `${lead}${f.field}: ${pick}`)
      : before.replace(/^/, `    ${f.field}: ${pick},\n`);
    if (parts[k] !== before) {
      changed += 1;
      console.log(`  ${f.id} beat ${f.n}: ${f.field} → ${pick}${re.test(before) ? '' : ' (added)'}`);
    }
  }
  if (!DRY) fs.writeFileSync(file, parts.join(SEP));
}

console.log(`\n${changed} beat(s) ${DRY ? 'would be' : ''} given a listening hold`);
if (unmapped.length) {
  console.log(`${unmapped.length} frozen figure-beat(s) need a hand edit (posed by the scene, not a script field):`);
  const seen = new Map();
  for (const u of unmapped) seen.set(`${u.id} x ${u.x}`, [...(seen.get(`${u.id} x ${u.x}`) || []), u.n]);
  for (const [k, ns] of seen) console.log(`  ${k}: beats ${ns.join(' ')}`);
}
