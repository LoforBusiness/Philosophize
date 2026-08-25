// DOES THE APP SEND WHAT THE ANALYTICS SAY IT SENDS?
//
//   node scripts/check-events.mjs          (npm run check:events)
//   node scripts/check-events.mjs --sheet  print the PostHog build sheet
//
// WHY THIS EXISTS. Analytics is the one part of this codebase whose failures are
// invisible from both ends at once. PostHog cannot tell "nobody did this" from
// "nobody instrumented this" — an insight built on an event no call site fires
// draws a flat line at zero forever, and a flat line at zero reads as a finding
// rather than as a fault. Meanwhile the app cannot tell that an event it sends
// is going nowhere, because `capture()` never fails.
//
// Both had already happened. `question_answered` fires only in the CARD runner,
// which is 36 of 222 lessons, so every per-question chart covers a sixth of the
// corpus and says so nowhere. And nothing at all fired when a free reader hit the
// daily limit — the loudest paywall-pressure signal in the product.
//
// So: `lib/analytics/taxonomy.ts` is the declared list, this is the grep, and the
// build sheet is printed from the same data rather than typed out beside it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'ph-events');
fs.mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  fs.writeFileSync(
    path.join(TMP, name),
    transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code,
  );
  return pathToFileURL(path.join(TMP, name)).href;
};
const { EVENTS, PERSON_PROPS, SCRUBBED } = await import(
  emit('lib/analytics/taxonomy.ts', 'taxonomy.mjs')
);

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── every .ts/.tsx in the app, minus the taxonomy itself ────────────────────
const ROOTS = ['app', 'components', 'stores', 'lib', 'constants', 'data'];
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p); continue; }
    if (/\.tsx?$/.test(e.name)) files.push(p);
  }
}
for (const r of ROOTS) walk(path.join(REPO, r));

const SELF = path.join(REPO, 'lib', 'analytics', 'taxonomy.ts');

/**
 * Every `track(...)` call, with the event name(s) it can send and the keys of the
 * object literal it passes.
 *
 * NAMES CAN BE A TERNARY. `toggleQuote` sends `track(nowSaved ? 'quote_saved' :
 * 'quote_removed', …)`, and a first pass of this that matched only `track('…'`
 * reported both of those events as never fired — which would have been read as
 * "nobody saves quotes" rather than as "the regex is too narrow".
 */
/**
 * The keys of one object literal body, both `name: value` and bare `name`.
 * Split at depth-zero commas so a nested literal cannot contribute its own keys.
 */
function topLevelKeys(body) {
  const out = [];
  let depth = 0, start = 0;
  const pieces = [];
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    else if (c === ',' && depth === 0) { pieces.push(body.slice(start, i)); start = i + 1; }
  }
  pieces.push(body.slice(start));
  for (const piece of pieces) {
    const t = piece.trim();
    if (!t || t.startsWith('...') || t.startsWith('//')) continue;
    const m = t.match(/^([$A-Za-z_]\w*)\s*(?::|$)/);
    if (m) out.push(m[1]);
  }
  return out;
}

function callsIn(src) {
  const out = [];
  const re = /\btrack\(\s*([^)]*?)(,|\))/g;
  let m;
  while ((m = re.exec(src))) {
    const head = m[1];
    const names = [...head.matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => x[1] ?? x[2]);
    if (!names.length) continue;
    // The property bag, by walking braces from the comma — a regex cannot do
    // this because the literals nest.
    let keys = [];
    if (m[2] === ',') {
      let i = re.lastIndex;
      while (i < src.length && src[i] !== '{' && src[i] !== ')') i++;
      if (src[i] === '{') {
        let depth = 0, j = i;
        for (; j < src.length; j++) {
          if (src[j] === '{') depth++;
          else if (src[j] === '}') { depth--; if (!depth) break; }
        }
        const body = src.slice(i + 1, j);
        // SHORTHAND COUNTS. The first version of this matched `name:` only, and
        // half the call sites in this app write `{ xp, correct, total }` — so it
        // reported six events as declaring properties nobody passes, which is
        // precisely the failure this check exists to report. A checker that
        // cannot read the language it checks invents defects.
        keys = topLevelKeys(body);
        if (/\.\.\.props/.test(body)) keys.push('*spread*');
      }
    }
    out.push({ names, keys });
  }
  return out;
}

const sent = new Map();          // name -> Set(prop keys seen at any call site)
for (const f of files) {
  if (f === SELF) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes('track(')) continue;
  for (const c of callsIn(src)) {
    for (const n of c.names) {
      if (!sent.has(n)) sent.set(n, new Set());
      for (const k of c.keys) sent.get(n).add(k);
    }
  }
}
// `track` is DEFINED in lib/posthog.ts, and its own signature matched the scan.
sent.delete('$set');

const declared = Object.keys(EVENTS);

console.log(`\n  ${declared.length} declared, ${sent.size} sent\n`);

// ── 1 · nothing is declared that nobody sends ──────────────────────────────
const ghosts = declared.filter((n) => !sent.has(n));
ok(ghosts.length === 0, 'every declared event is actually sent by something',
  ghosts.length ? `NOTHING FIRES: ${ghosts.join(' ')}` : `all ${declared.length}`);

// ── 2 · nothing is sent that is not declared ───────────────────────────────
const strays = [...sent.keys()].filter((n) => !declared.includes(n));
ok(strays.length === 0, 'every event sent is declared in the taxonomy',
  strays.length ? `UNDECLARED: ${strays.join(' ')}` : 'no strays');

// ── 3 · no declared property is one the scrubber deletes ───────────────────
//
// This is the failure that looks most like an answer: the property is stripped in
// `before_send`, the event still arrives, and the breakdown built on it comes
// back empty forever. Exact keys, not substrings — `badge_name` is safe and
// `name` is not, and that distinction is the whole check.
const dirty = [];
for (const [name, spec] of Object.entries(EVENTS)) {
  for (const p of spec.props) if (SCRUBBED.includes(p)) dirty.push(`${name}.${p}`);
}
ok(dirty.length === 0, 'no event declares a property the PII scrubber deletes',
  dirty.length ? dirty.join(' ') : `${SCRUBBED.length} scrubbed keys, none declared`);

// ── 4 · the declared shape matches the shape at the call sites ─────────────
//
// Only a property declared and sent NOWHERE is a failure. A call site that sends
// MORE than was declared is a documentation lag and prints as a note, because the
// event still works; a declared property that no call site passes is a chart
// waiting to be empty.
let missing = 0;
for (const [name, spec] of Object.entries(EVENTS)) {
  const seen = sent.get(name);
  if (!seen) continue;
  if (seen.has('*spread*')) continue;             // $screen splices route params
  const gone = spec.props.filter((p) => !seen.has(p));
  if (gone.length) {
    missing++;
    ok(false, `${name}: declared properties that no call site passes`, gone.join(' '));
  }
}
ok(missing === 0, 'every declared property is passed somewhere', `${declared.length} events checked`);

// ── 5 · the person properties exist as a set ──────────────────────────────
const layout = fs.readFileSync(path.join(REPO, 'app/_layout.tsx'), 'utf8');
const auth = fs.readFileSync(path.join(REPO, 'lib/supabase/auth.ts'), 'utf8');
for (const p of PERSON_PROPS) {
  ok(layout.includes(p) || auth.includes(p), `person property ${p} is set somewhere`);
}

// ── the build sheet ───────────────────────────────────────────────────────
if (process.argv.includes('--sheet')) {
  console.log('\n\n  ── POSTHOG BUILD SHEET ' + '─'.repeat(52) + '\n');
  console.log('  EVENTS\n');
  for (const [name, spec] of Object.entries(EVENTS)) {
    console.log(`    ${name}`);
    console.log(`      ${spec.note}`);
    if (spec.props.length) console.log(`      props: ${spec.props.join(', ')}`);
    console.log('');
  }
  console.log('  PERSON PROPERTIES\n');
  console.log(`    ${PERSON_PROPS.join(', ')}\n`);
}

console.log(bad === 0 ? '\nevents: the taxonomy and the app agree.' : `\n${bad} event check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);
