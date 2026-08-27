// WHAT ELSE IS STANDING INSIDE THE CORRECT ANSWER'S BOX?
//
// E39 says the thing that moves must be the thing that was chosen. `check:lift`
// asks whether a Target has art INSIDE it, which catches the empty hit-overlay —
// and it reported zero while the reader could still see an outline sliding off its
// own words. It has to: a Target holding one box passes even when the label that
// belongs to it is drawn as a SIBLING, and only the box will rise.
//
// So this asks the harder question. Resolve the correct Target's rectangle, then
// find every drawn thing whose own rectangle sits inside it and which is NOT
// rendered inside that Target in the JSX. Those are the pieces that stay behind.
//
// Two real ones found this way, and neither was visible to the old rule:
// `metaphysics23`'s hull rises off its own planks, and `political22`'s switch
// housing rises off the lever sitting in it.
//
// NOTE: regex LITERALS only — a pattern built from a string loses its escapes in
// this toolchain and silently matches nothing (see lib/tonefit.mjs).
const STAGE_W = 400;

export const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

export function consts(src) {
  const t = new Map();
  for (const m of src.matchAll(/const\s+([A-Za-z_][\w]*)\s*=\s*(-?[0-9.]+)\s*;/g)) t.set(m[1], +m[2]);
  for (let pass = 0; pass < 4; pass++) {
    for (const m of src.matchAll(/const\s+([A-Za-z_][\w]*)\s*=\s*([\w .+\-*/()]+);/g)) {
      if (t.has(m[1])) continue;
      const e = m[2].replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
      if (e.includes('NaN')) continue;
      try { const v = eval(e); if (Number.isFinite(v)) t.set(m[1], v); } catch { /* not arithmetic */ }
    }
  }
  return t;
}

export function styleBlocks(src) {
  const i = src.indexOf('StyleSheet.create(');
  if (i < 0) return new Map();
  let d = 0, start = -1, body = '';
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { if (d === 0) start = j; d++; }
    else if (src[j] === '}') { d--; if (d === 0) { body = src.slice(start + 1, j); break; } }
  }
  const out = new Map(); const re = /(\w+)\s*:\s*\{/g; let m;
  while ((m = re.exec(body))) {
    let k = 1, j = m.index + m[0].length;
    for (; j < body.length && k > 0; j++) { if (body[j] === '{') k++; else if (body[j] === '}') k--; }
    out.set(m[1], body.slice(m.index + m[0].length, j - 1)); re.lastIndex = j;
  }
  return out;
}

export function prop(block, key, t) {
  if (!block) return null;
  for (const part of block.split(',')) {
    const c = part.indexOf(':');
    if (c < 0 || part.slice(0, c).trim() !== key) continue;
    const raw = part.slice(c + 1).trim();
    if (/^'/.test(raw)) return null;
    const e = raw.replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
    if (e.includes('NaN')) return null;
    try { const v = eval(e); return Number.isFinite(v) ? v : null; } catch { return null; }
  }
  return null;
}

/** A style's rectangle in stage space, or null when it cannot be resolved. */
export function rectOf(block, t, inline) {
  const num = (key) => {
    if (inline) {
      const m = new RegExp('').source; // never build from a string — read inline by hand below
    }
    return prop(block, key, t);
  };
  let left = num('left'), top = num('top');
  let w = num('width'), h = num('height');
  if (inline) {
    for (const [k, v] of inline) {
      if (k === 'left') left = v;
      else if (k === 'top') top = v;
      else if (k === 'width') w = v;
      else if (k === 'height') h = v;
    }
  }
  if (w == null) {
    const r = num('right');
    if (left != null && r != null) w = STAGE_W - left - r;
  }
  if (left == null || top == null || w == null || h == null) return null;
  return { x: left, y: top, w, h };
}

/** `{ left: DX, top: 12 }` on a JSX element, resolved through the file's constants. */
export function inlineNums(openTag, t) {
  const out = new Map();
  for (const m of openTag.matchAll(/(left|top|width|height):\s*([A-Za-z_0-9.\-+*/ ]+?)\s*[,}]/g)) {
    const e = m[2].replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
    if (e.includes('NaN')) continue;
    try { const v = eval(e); if (Number.isFinite(v)) out.set(m[1], v); } catch { /* */ }
  }
  return out;
}

/** Every <Target …> … </Target>: opening tag, body, and whether it is the answer. */
export function targets(src) {
  const out = [];
  const re = /<Target\b/g; let m;
  while ((m = re.exec(src))) {
    let d = 0, j = m.index;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') d--;
      else if (src[j] === '>' && d === 0) break;
    }
    const open = src.slice(m.index, j + 1);
    if (src[j - 1] === '/') { out.push({ open, body: '', selfClosing: true }); re.lastIndex = j; continue; }
    let depth = 1, k = j + 1;
    while (depth > 0 && k < src.length) {
      const o = src.indexOf('<Target', k), c = src.indexOf('</Target>', k);
      if (c < 0) break;
      if (o >= 0 && o < c) { depth++; k = o + 7; } else { depth--; k = c + 9; }
    }
    out.push({ open, body: src.slice(j + 1, k - 9), selfClosing: false });
    re.lastIndex = k;
  }
  return out;
}

/** Anything not literally `{false}` may be the answer — see check-lift for why. */
export const isCorrect = (t) => !/correct=\{false\}/.test(t.open);

/**
 * The style names rendered inside an element that carries a lift/rise style.
 *
 * Where a scene lifts its art with `useAnswerRise` the art is deliberately OUTSIDE
 * the Target, so "not inside the Target" is not the question — "not inside the
 * thing that rises" is. Without this the probe reports the fix as the fault, which
 * it did for three scenes on its first run.
 */
export function hookedNames(src, hookVar) {
  const out = new Set();
  const re = new RegExp('');           // never built from a string; scan by hand
  const needle = hookVar;
  let i = 0;
  for (;;) {
    const at = src.indexOf(needle, i);
    if (at < 0) break;
    i = at + needle.length;
    // only a USE in JSX, not the declaration
    const lineStart = src.lastIndexOf('\n', at) + 1;
    const line = src.slice(lineStart, src.indexOf('\n', at));
    if (/const\s/.test(line)) continue;
    // walk to the end of this element's opening tag, then to its close
    const gt = src.indexOf('>', at);
    if (gt < 0) continue;
    if (src[gt - 1] === '/') continue;                 // self-closing holds nothing
    const close = src.indexOf('</Animated.View>', gt);
    if (close < 0) continue;
    for (const m of src.slice(gt, close).matchAll(/styles\.(\w+)/g)) out.add(m[1]);
  }
  return out;
}
