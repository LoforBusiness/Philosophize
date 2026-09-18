// ─────────────────────────────────────────────────────────────────────────────
// EVERY TONED PLATE STANDS ON A SHADED LIP — THE DEPTH RAMP'S THIRD RUNG.
//
//   node scripts/lip-stage.mjs            report
//   node scripts/lip-stage.mjs --write    do it, then node scripts/restamp-lip.mjs --write
//
// 237 scenes used STONE, 244 used RULE and FOUR used SHADE. The tonal pass gave the
// corpus a light mass and stopped, so a plate was a coloured shape rather than an
// object, and the controls UNDER the words were already struck on a lip of their own
// hue (QuestionParts.LipPlate). This gives every STONE mass the same lip: a hard
// SHADE edge three units below it, the way the answer plates stand.
//
// ── IT IS A `boxShadow`, AND THAT IS WHAT MAKES IT CHEAP ────────────────────
//
// A lip drawn as a View would be a new element in 235 scenes: new art in every
// must-box table, a JSX edit per plate, and a full browser re-measure. A hard
// shadow — no blur, offset straight down — is drawn BEHIND the element by the
// renderer, changes no layout and no bounding box, and needs no JSX at all. RN 0.85
// has only the New Architecture, where `boxShadow` is supported on Android and iOS,
// and react-native-web passes it through as CSS, so the browser harnesses see it.
// This is NOT the `shadow*` → `boxShadow` sweep CLAUDE.md §12 defers: nothing here
// converts an existing shadow, so nothing that already renders is restyled.
//
// ── WHAT IT WILL NOT TOUCH ──────────────────────────────────────────────────
//   · a style anchored to the band's bottom (`bottom: 0`) — a floor, or a fill
//     layer inside something else, whose lip would be under the page;
//   · anything named as ground (`floor`, `ground`, `bed`, `band`, `earth`);
//   · a full-width fill (`left: 0` with `right: 0`, or 380 units and wider);
//   · a sliver under six units either way, which is a rule rather than a mass;
//   · a style that already carries a `boxShadow`.
//
// IDEMPOTENT: a second run finds every eligible style already lipped.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIR = 'components/lesson/cinematic';

/** The one line each scene gains beside its tone destructure. */
export const LIP_DECL = "const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)";

const NAMED_GROUND = /^(floor|ground|bed|band|earth|soil|backdrop)/i;

/** Top-level `name: { … }` entries of the file's StyleSheet.create, with offsets. */
export function entriesOf(src) {
  const at = src.indexOf('StyleSheet.create(');
  if (at < 0) return [];
  const open = src.indexOf('{', at);
  let d = 0, end = -1;
  for (let j = open; j < src.length; j++) {
    if (src[j] === '{') d++;
    else if (src[j] === '}') { d--; if (d === 0) { end = j; break; } }
  }
  const out = [];
  const re = /^ {2}([A-Za-z_$][\w$]*):\s*\{/gm;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(src)) && m.index < end) {
    let k = 1, j = m.index + m[0].length;
    for (; j < src.length && k > 0; j++) { if (src[j] === '{') k++; else if (src[j] === '}') k--; }
    out.push({ name: m[1], start: m.index + m[0].length, end: j - 1 });
    re.lastIndex = j;
  }
  return out;
}

/** Numeric constants the file declares, resolved through each other. */
export function constsOf(src) {
  const t = new Map();
  for (let pass = 0; pass < 5; pass++) {
    for (const m of src.matchAll(/const\s+([A-Za-z_]\w*)\s*=\s*([\w .+\-*/()]+);/g)) {
      if (t.has(m[1])) continue;
      const e = m[2].replace(/[A-Za-z_]\w*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
      if (e.includes('NaN')) continue;
      try { const v = Function(`return (${e});`)(); if (Number.isFinite(v)) t.set(m[1], v); } catch { /* not arithmetic */ }
    }
  }
  return t;
}

export function valueOf(body, key, t) {
  const m = body.match(new RegExp(`(?:^|[\\s,{])${key}:\\s*([^,\\n}]+)`));
  if (!m) return undefined;
  const e = m[1].trim().replace(/[A-Za-z_]\w*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
  if (e.includes('NaN')) return null;
  try { const v = Function(`return (${e});`)(); return Number.isFinite(v) ? v : null; } catch { return null; }
}

/** Why a STONE style gets no lip, or null when it should get one. */
function refusal(name, body, t) {
  if (/\bboxShadow\b/.test(body)) return 'lipped';
  if (NAMED_GROUND.test(name)) return 'ground';
  const bottom = valueOf(body, 'bottom', t);
  if (bottom === 0) return 'anchored';
  const left = valueOf(body, 'left', t), right = valueOf(body, 'right', t);
  const w = valueOf(body, 'width', t), h = valueOf(body, 'height', t);
  if ((left === 0 && right === 0) || (w != null && w >= 380)) return 'full width';
  if ((w != null && w < 6) || (h != null && h < 6)) return 'sliver';
  return null;
}

/** The scene with its STONE plates lipped. `{ src, lipped, refused, skip }`. */
export function lipScene(src) {
  const tone = src.match(/^const \{([^}]*)\} = stageTone\('[a-z-]+'\);$/m);
  if (!tone) return { src, lipped: 0, refused: {}, skip: 'no stage tone' };
  const t = constsOf(src);
  const edits = [];
  const refused = {};
  for (const e of entriesOf(src)) {
    const body = src.slice(e.start, e.end);
    if (!/backgroundColor:\s*STONE\b/.test(body)) continue;
    const why = refusal(e.name, body, t);
    if (why) { refused[why] = (refused[why] ?? 0) + 1; continue; }
    const k = body.search(/backgroundColor:\s*STONE\b/);
    const tok = body.slice(k).match(/^backgroundColor:\s*STONE\b/)[0];
    edits.push(e.start + k + tok.length);
  }
  if (!edits.length) return { src, lipped: 0, refused, skip: refused.lipped ? 'already lipped' : 'no eligible plate' };
  let out = src;
  for (const at of edits.sort((a, b) => b - a)) out = `${out.slice(0, at)}, boxShadow: LIP${out.slice(at)}`;
  // SHADE into the destructure, and the one declaration under it.
  const names = tone[1].split(',').map((s) => s.trim()).filter(Boolean);
  const line = names.includes('SHADE') ? tone[0] : tone[0].replace(tone[1], ` ${[...names, 'SHADE'].join(', ')} `);
  out = out.replace(tone[0], out.includes(LIP_DECL) ? line : `${line}\n${LIP_DECL}`);
  return { src: out, lipped: edits.length, refused };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const WRITE = process.argv.includes('--write');
  let scenes = 0, plates = 0;
  const refusedAll = {};
  const skipped = {};
  for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'))) {
    const full = path.join(DIR, file);
    const src = fs.readFileSync(full, 'utf8');
    if (src.includes('\r\n')) { skipped.CRLF = (skipped.CRLF ?? 0) + 1; continue; }
    const r = lipScene(src);
    for (const [k, v] of Object.entries(r.refused)) refusedAll[k] = (refusedAll[k] ?? 0) + v;
    if (r.skip) { skipped[r.skip] = (skipped[r.skip] ?? 0) + 1; continue; }
    scenes += 1; plates += r.lipped;
    if (WRITE) fs.writeFileSync(full, r.src, 'utf8');
  }
  console.log(`\n${WRITE ? 'lipped' : 'would lip'} ${plates} STONE plate(s) in ${scenes} scene(s)`);
  console.log(`  left alone: ${Object.entries(refusedAll).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`);
  console.log(`  scenes skipped: ${Object.entries(skipped).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`);
  if (!WRITE) console.log('\n(dry run — pass --write)');
}
