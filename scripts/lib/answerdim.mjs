// A SCENE'S ANSWERED STYLE MAY NOT SET AN OPACITY.
//
// `Target` owns the opacity and the scale of the reply — the true one lifts, the
// reader's own miss goes to 0.5 and shrinks, everything else settles at 0.7. A
// scene that sets its own opacity on the same element MULTIPLIES with that, and
// the branch it hits hardest is the one under the reader's finger: 0.5 x 0.45 is
// 0.225, which is a card they cannot read carrying the X that says they chose it.
//
// It was the house idiom in 113 places, because Target's own header used to say
// the component did not style the answered state at all. It says the opposite
// now; this is what stops the old shape coming back.
//
// The gate is found by looking BACKWARDS from each `styles.NAME` rather than by
// pattern-matching the condition — a first attempt required the gate to be a
// chain of bare identifiers, and so walked straight past
// `answered && picked === v.id && !v.correct && styles.pickWrong`, which is the
// exact line in the lesson this was reported on.
import fs from 'node:fs';
import path from 'node:path';

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/** Every `name: { … }` in the file's StyleSheet.create, with its body. */
export function styleBodies(src) {
  const out = new Map();
  const at = src.indexOf('StyleSheet.create(');
  if (at < 0) return out;
  const i = src.indexOf('{', at);
  let depth = 0, end = -1;
  for (let j = i; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (!depth) { end = j; break; } }
  }
  if (end < 0) return out;
  const body = src.slice(i + 1, end);
  const re = /(\w+)\s*:\s*\{/g;
  let m;
  while ((m = re.exec(body))) {
    let d = 1, k = m.index + m[0].length;
    for (; k < body.length; k += 1) { if (body[k] === '{') d += 1; else if (body[k] === '}') { d -= 1; if (!d) break; } }
    out.set(m[1], body.slice(m.index + m[0].length, k));
  }
  return out;
}

/**
 * Styles in one scene that are applied ONLY when a question has been answered and
 * that set an opacity. Returns [{ name, body, opacity }].
 *
 * `only when answered` matters: a style used both gated and ungated is an ordinary
 * style that happens to be reused, and dropping its opacity would change the
 * picture on every beat.
 */
/**
 * The character ranges covered by a `<Target …> … </Target>` element, including
 * its own opening tag — a style on the Target's own `style` prop counts too,
 * because the Pressable's opacity multiplies with the wrapper's just the same.
 */
function targetSpans(src) {
  const spans = [];
  for (let at = src.indexOf('<Target'); at >= 0; at = src.indexOf('<Target', at + 7)) {
    if (/[A-Za-z]/.test(src[at + 7] || '')) continue;          // <TargetRing, <TargetCount…
    let depth = 0, tagEnd = -1, selfClose = false;
    for (let i = at; i < src.length; i += 1) {
      const c = src[i];
      if (c === '{') depth += 1;
      else if (c === '}') depth -= 1;
      else if (c === '>' && depth === 0) { selfClose = src[i - 1] === '/'; tagEnd = i; break; }
    }
    if (tagEnd < 0) continue;
    if (selfClose) { spans.push([at, tagEnd]); continue; }
    let n = 1, j = tagEnd + 1;
    while (j < src.length && n > 0) {
      if (src.startsWith('</Target>', j)) { n -= 1; if (!n) break; j += 9; continue; }
      if (src.startsWith('<Target', j) && !/[A-Za-z]/.test(src[j + 7] || '')) { n += 1; j += 7; continue; }
      j += 1;
    }
    spans.push([at, j]);
  }
  return spans;
}

export function answeredOpacities(raw) {
  const src = strip(raw);
  if (!/from '\.\/Target'/.test(src)) return [];
  const st = styleBodies(src);
  // ONLY WHAT IS INSIDE A TARGET. A scene may perfectly well dim something the
  // wrong answer NAMES — metaphysics31 fades the cheese cavity when the reader
  // picks the gap — and no reaction reaches that, so nothing else would mark it.
  const spans = targetSpans(src);
  const inside = (i) => spans.some(([a, b]) => i >= a && i <= b);

  const use = new Map();
  for (const m of src.matchAll(/styles\.(\w+)/g)) {
    const name = m[1];
    const before = src.slice(Math.max(0, m.index - 160), m.index);
    const seg = before.slice(Math.max(before.lastIndexOf('['), Math.max(before.lastIndexOf(','), before.lastIndexOf('\n'))) + 1);
    const gated = /&&\s*$/.test(seg) && /\banswered\b|\bpicked\b|\bwrong\s*\(|\bchosen\b|\blost\b|\bmine\b/.test(seg);
    if (!use.has(name)) use.set(name, { n: 0, gated: 0, inTarget: 0 });
    const u = use.get(name);
    u.n += 1;
    if (gated) u.gated += 1;
    if (gated && inside(m.index)) u.inTarget += 1;
  }

  const out = [];
  for (const [name, u] of use) {
    if (!u.gated || u.gated !== u.n) continue;
    if (!u.inTarget) continue;
    const body = st.get(name);
    if (!body) continue;
    const o = /opacity:\s*([0-9.]+)/.exec(body);
    if (!o) continue;
    out.push({ name, body: body.replace(/\s+/g, ' ').trim(), opacity: +o[1] });
  }
  return out;
}

/** Every scene, as [{ file, name, opacity, body }]. */
export function scanAnsweredOpacities(dir = path.join('components', 'lesson', 'cinematic')) {
  const rows = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('Scene.tsx')).sort()) {
    for (const r of answeredOpacities(fs.readFileSync(path.join(dir, f), 'utf8'))) rows.push({ file: f, ...r });
  }
  return rows;
}
