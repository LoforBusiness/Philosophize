// RE-STAMP AFTER THE STAMP LEARNED THAT HOLDERS, AXES AND CITE LINES ARE DECK WORDS —
// without re-measuring, and only where that is provably safe.
//
//   node scripts/restamp-deck-words.mjs            dry run
//   node scripts/restamp-deck-words.mjs --write
//
// The 13 Sep 2026 lecture rewrite (group V) gave every poll option a `holders` list
// (R17), relabelled some trend picks' `axis` (R16), and added or dropped a few `cite`
// captions. All three are drawn in the lower deck, outside `#stage-clip`, so none can
// move a must-see box. But `muststamp` blanked only the VALUES of the keys it knew,
// and a list or a caption that is ADDED rather than reworded changes the text around
// it, so every poll lesson that gained holders went stale for a change the probe
// cannot see. `muststamp` now removes holders lists and cite lines whole, and blanks
// `axis`.
//
// THE SAME RULE AS BOTH MIGRATIONS BEFORE IT (restamp-must, restamp-deck-prose): never
// "re-stamp everything". A lesson is re-stamped only when the OLD rule proves its
// measurement was valid —
//
//   old rule on today's script matches          → fresh; write the new stamp.
//   old rule on the HEAD script matches, AND the
//   script moved only in deck words since then   → valid at HEAD, and nothing that can
//                                                   move a box has moved; write it.
//   neither                                      → genuinely stale. Leave it, name it.
//
// Changing the rule changes the stamp of every script that carries a cite line, a
// holders list or an axis, edited or not, so most re-stamps here are "fresh": the old
// rule proves them and only the arithmetic moved.
//
// Three stores carry the stamp and all three are migrated together: `MUST_STAMP` in
// mustBoxes.ts (what validate-cinematic reads), `stamps` in mustBoxes.ts.json (what
// measure-must writes) and `TOUR_STAMP` in tours.ts (what check-tour reads).
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
const SHARED = ['Target.tsx', 'Silhouette.tsx'];
const OLD_KEYS = ['text', 'cite', 'explain', 'prompt', 'reads', 'author', 'work', 'era', 'label',
  'closing', 'title', 'chip', 'lo', 'hi', 'left', 'right'];
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
  return src
    .replace(re, (_m, key, sep, q) => `${key}${sep}${q}${q}`)
    .replace(/(points\s*:\s*\[)([\s\S]*?)(\])/g, (_m, open, body, close) => (
      `${open}${body.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, '$1$1')}${close}`
    ));
}
/** The old stamp, with the script's bytes supplied (today's, or HEAD's). */
function oldStamp(comp, scriptSrc) {
  const files = stampFiles(DIR, comp);
  if (!files.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of files) {
    if (SHARED.includes(path.basename(p))) h.update(Buffer.from(layoutOf(fs.readFileSync(p, 'utf8'))));
    else if (p.endsWith('Script.ts')) h.update(Buffer.from(oldProseless(scriptSrc ?? fs.readFileSync(p, 'utf8'))));
    else h.update(fs.readFileSync(p));
  }
  h.update(crypto.createHash('sha1').update(String(MEASURE)).digest('hex').slice(0, 8));
  return h.digest('hex').slice(0, 12);
}

/** Every word a reader sees in the deck, removed or blanked — the test that only those moved. */
const DECK = /\b(text|cite|explain|prompt|reads|label|closing|title|chip|lo|hi|left|right|author|work|era|axis)(\s*:\s*)(['"`])((?:\\.|(?!\3)[^\\])*)\3/g;
const deckless = (src) => src.replace(/\r\n/g, '\n')
  .replace(/,?\s*\bholders\s*:\s*\[[^\]]*\]/g, '')
  .replace(/\n[ \t]*cite\s*:\s*(['"])(?:\\.|(?!\1)[^\\\n])*\1,?[ \t]*(?=\n)/g, '')
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
  console.log(`${label}: ${fresh} fresh under the old rule · ${viaHead} valid at HEAD with only deck words moved · ${unchanged} already current · ${stale.length} genuinely stale`);
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

function storedIn(src, blockName) {
  const out = {};
  const at = src.indexOf(`export const ${blockName}`);
  const open = src.indexOf('{', at);
  const close = src.indexOf('\n};', open);
  for (const m of src.slice(open, close).matchAll(/'([a-z0-9-]+)':\s*'([0-9a-f]+)'/g)) out[m[1]] = m[2];
  return out;
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const genSrc = fs.readFileSync(GEN, 'utf8');
const toursSrc = fs.readFileSync(TOURS, 'utf8');

const mustNext = migrate(storedIn(genSrc, 'MUST_STAMP'), 'MUST_STAMP');
const tourNext = migrate(storedIn(toursSrc, 'TOUR_STAMP'), 'TOUR_STAMP');

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
