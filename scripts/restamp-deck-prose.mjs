// RE-STAMP AFTER THE STAMP LEARNED THAT THE WHOLE DECK IS PROSE — without
// re-measuring, and only where that is provably safe.
//
//   node scripts/restamp-deck-prose.mjs            dry run
//   node scripts/restamp-deck-prose.mjs --write
//
// `muststamp` has ignored a script's `text`, `explain`, `prompt`, `reads` and
// `label` since the first migration (`scripts/restamp-must.mjs`), because every one
// of them is drawn in the lower deck, outside `#stage-clip`. The list stopped there,
// and nobody noticed for a fortnight because nobody edited the rest: a summary's
// `closing`, `title` and `points`, and a control's `chip`, `lo`, `hi`, `left` and
// `right`. Then every lesson was rewritten to be read aloud (group AC), the closings
// with it, and 103 must-box stamps and 43 tour stamps went stale in one afternoon for
// a change that cannot move a box — the summary card unmounts the stage, and every
// control lives in the deck.
//
// THE SAME RULE AS LAST TIME: never "re-stamp everything". A lesson is re-stamped
// only when the OLD rule proves its measurement was valid —
//
//   old rule on today's script matches          → fresh; write the new stamp.
//   old rule on the HEAD script matches, AND the
//   script moved only in deck prose since then  → valid at HEAD, nothing that can
//                                                  move a box has moved; write it.
//   neither                                      → genuinely stale. Leave it, name it.
//
// Three stores carry the stamp, and all three are migrated together: `MUST_STAMP`
// in mustBoxes.ts (what validate-cinematic reads), `stamps` in mustBoxes.ts.json
// (what measure-must writes), and `TOUR_STAMP` in tours.ts (what check-tour reads —
// make:tours would normally regenerate it, and it refuses to write while K9's
// generator and validator disagree, see CLAUDE.md §17).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { stampFiles, mustStamp } from './lib/muststamp.mjs';
import { MEASURE } from './lib/mustprobe.mjs';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const GEN = path.join(DIR, 'mustBoxes.ts');
const TOURS = path.join(DIR, 'tours.ts');
const WRITE = process.argv.includes('--write');

// ── the OLD rule, verbatim from muststamp before this change ─────────────────
const OLD_KEYS = ['text', 'cite', 'explain', 'prompt', 'reads', 'author', 'work', 'era', 'label'];
function layoutOf(src) {
  const at = src.indexOf('StyleSheet.create(');
  if (at < 0) return src;
  const open = src.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (!depth) return src.slice(open, i + 1); }
  }
  return src.slice(open);
}
function oldProseless(src) {
  const re = new RegExp(`\\b(${OLD_KEYS.join('|')})(\\s*:\\s*)(['"\`])((?:\\\\.|(?!\\3)[^\\\\])*)\\3`, 'g');
  return src.replace(re, (_m, key, sep, q) => `${key}${sep}${q}${q}`);
}
/** The old stamp, with the script's bytes supplied (today's, or HEAD's). */
function oldStamp(comp, scriptSrc) {
  const files = stampFiles(DIR, comp);
  if (!files.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of files) {
    if (path.basename(p) === 'Target.tsx') h.update(Buffer.from(layoutOf(fs.readFileSync(p, 'utf8'))));
    else if (p.endsWith('Script.ts')) h.update(Buffer.from(oldProseless(scriptSrc ?? fs.readFileSync(p, 'utf8'))));
    else h.update(fs.readFileSync(p));
  }
  h.update(crypto.createHash('sha1').update(String(MEASURE)).digest('hex').slice(0, 8));
  return h.digest('hex').slice(0, 12);
}

/** Every string a reader sees in the deck, blanked — the test that only those moved. */
const DECK = /\b(text|cite|explain|prompt|reads|label|closing|title|chip|lo|hi|left|right|author|work|era)(\s*:\s*)(['"`])((?:\\.|(?!\3)[^\\])*)\3/g;
const deckless = (src) => src.replace(/\r\n/g, '\n')
  .replace(DECK, (_m, k) => `${k}: ''`)
  .replace(/points:\s*\[([\s\S]*?)\]/g, (_m, body) => `points: [${body.replace(/(['"])((?:\\.|(?!\1)[^\\])*)\1/g, "''")}]`);

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const comps = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) comps.set(m[1], m[2]);

function headScript(comp) {
  const script = stampFiles(DIR, comp).find((f) => f.endsWith('Script.ts'));
  if (!script) return { head: null, cur: null };
  const cur = fs.readFileSync(script, 'utf8');
  let head = null;
  try { head = execFileSync('git', ['show', `HEAD:${script.replace(/\\/g, '/')}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); } catch { /* new file */ }
  return { head, cur };
}

function migrate(stored, label) {
  const next = {};
  const stale = [];
  let fresh = 0; let viaHead = 0; let unchanged = 0;
  for (const [id, want] of Object.entries(stored)) {
    const comp = comps.get(id);
    if (!comp) { stale.push(`${id} (not wired)`); continue; }
    const now = mustStamp(DIR, comp, MEASURE);
    if (now === want) { unchanged += 1; continue; }
    if (oldStamp(comp) === want) { next[id] = now; fresh += 1; continue; }
    const { head, cur } = headScript(comp);
    if (head && oldStamp(comp, head) === want && deckless(head) === deckless(cur)) { next[id] = now; viaHead += 1; continue; }
    stale.push(id);
  }
  console.log(`${label}: ${fresh} fresh under the old rule · ${viaHead} valid at HEAD with only deck prose moved · ${unchanged} already current · ${stale.length} genuinely stale`);
  if (stale.length) console.log(`  left stale, needing a real re-measure: ${stale.join(', ')}`);
  return next;
}

function replaceInBlock(src, blockName, next) {
  const at = src.indexOf(`export const ${blockName}`);
  if (at < 0) throw new Error(`${blockName} not found`);
  const open = src.indexOf('{', at);
  const close = src.indexOf('\n};', open);
  const block = src.slice(open, close).replace(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g, (m, id) => (next[id] ? `'${id}': '${next[id]}'` : m));
  return src.slice(0, open) + block + src.slice(close);
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const genSrc = fs.readFileSync(GEN, 'utf8');
const mustStored = {};
{
  const at = genSrc.indexOf('export const MUST_STAMP');
  const open = genSrc.indexOf('{', at);
  const close = genSrc.indexOf('\n};', open);
  for (const m of genSrc.slice(open, close).matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)) mustStored[m[1]] = m[2];
}
const toursSrc = fs.readFileSync(TOURS, 'utf8');
const tourStored = {};
{
  const at = toursSrc.indexOf('export const TOUR_STAMP');
  const open = toursSrc.indexOf('{', at);
  const close = toursSrc.indexOf('\n};', open);
  for (const m of toursSrc.slice(open, close).matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)) tourStored[m[1]] = m[2];
}

const mustNext = migrate(mustStored, 'MUST_STAMP');
const tourNext = migrate(tourStored, 'TOUR_STAMP');

if (WRITE) {
  // INDENT 1, as measure-must writes it — anything else rewrites a 6.8MB file.
  for (const [id, s] of Object.entries(mustNext)) if (side.stamps && id in side.stamps) side.stamps[id] = s;
  fs.writeFileSync(SIDE, JSON.stringify(side, null, 1));
  fs.writeFileSync(GEN, replaceInBlock(genSrc, 'MUST_STAMP', mustNext));
  fs.writeFileSync(TOURS, replaceInBlock(toursSrc, 'TOUR_STAMP', tourNext));
  console.log(`\nwrote ${SIDE}, ${GEN} and ${TOURS}`);
} else {
  console.log('\n(dry run — pass --write to apply)');
}
