// DOES ANY TYPE SIT ON A TONE IT CANNOT BE READ AGAINST — BY GEOMETRY?
//
// check-shade already held this rule, and it paired a fill with its caption by
// NAME: `slab` with `slabText`. That is the common house shape and it has a hole
// in it exactly the size of somebody's abbreviation. `epistemology23` calls the
// hopper's caption `hopText`, so when the hopper was given STONE the pair was
// invisible and the scene shipped a 3.26:1 caption that every check called clean.
//
// Overlap is the thing that is actually true, so this pairs them by BOX instead.
// It resolves `const NAME = 240` first, because these scenes write `top: HOP_Y`
// and a probe that reads only literals sees nothing and reports a clean corpus —
// the silence §21 keeps recording.
//
// NOTE FOR ANYONE EDITING THIS FILE: build patterns as regex LITERALS only.
// Every dynamic `new RegExp('\s' + …)` in this toolchain has been eaten by the
// shell that wrote it at least once, and the failure mode is a probe that matches
// nothing and prints a clean bill of health.
const MASSES_TOO_DARK_FOR_SOFT = ['STONE', 'SHADE', 'INK'];

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function consts(src) {
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

function entries(src) {
  const i = src.indexOf('StyleSheet.create(');
  if (i < 0) return [];
  let d = 0, start = -1, body = '';
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { if (d === 0) start = j; d++; }
    else if (src[j] === '}') { d--; if (d === 0) { body = src.slice(start + 1, j); break; } }
  }
  const out = [];
  const re = /(\w+)\s*:\s*\{/g; let m;
  while ((m = re.exec(body))) {
    let k = 1, j = m.index + m[0].length;
    for (; j < body.length && k > 0; j++) { if (body[j] === '{') k++; else if (body[j] === '}') k--; }
    out.push([m[1], body.slice(m.index + m[0].length, j - 1)]);
    re.lastIndex = j;
  }
  return out;
}

/** One style key, resolved through the file's own constants. No regex built from a string. */
function val(body, key, t) {
  for (const part of body.split(',')) {
    const c = part.indexOf(':');
    if (c < 0 || part.slice(0, c).trim() !== key) continue;
    const e = part.slice(c + 1).replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
    if (e.includes('NaN')) return null;
    try { const v = eval(e); return Number.isFinite(v) ? v : null; } catch { return null; }
  }
  return null;
}

/**
 * @returns {string[]} one line per caption that starts inside a tonal fill it is
 * too faint to be read against. Empty when the scene is clean.
 */
export function softOnToneByBox(source, label) {
  const src = strip(source);
  const t = consts(src);
  const es = entries(src);

  const boxes = [];
  for (const [n, b] of es) {
    const bg = /backgroundColor:\s*([A-Za-z_][\w]*)/.exec(b);
    if (!bg || !MASSES_TOO_DARK_FOR_SOFT.includes(bg[1])) continue;
    const l = val(b, 'left', t), tp = val(b, 'top', t), w = val(b, 'width', t), h = val(b, 'height', t);
    if ([l, tp, w, h].some((v) => v == null)) continue;
    // A FILL ONLY CARRIES TEXT IF IT IS BIG ENOUGH TO — the same guard the name
    // rule already states. political2's podCap is a 5px INK cap rule and
    // political15's night a 4px upright; neither is a ground for a word, and
    // reporting them as one is how a checker teaches people to ignore it.
    if (w < 24 || h < 12) continue;
    // AND A BOX AT THE ORIGIN IS ALMOST ALWAYS SOMEBODY'S CHILD. These scenes nest
    // freely, so left:0 top:0 is a wrapper-relative coordinate and comparing
    // it against stage space pairs two things that are nowhere near each other.
    if (l === 0 && tp === 0) continue;
    boxes.push({ n, l, t: tp, r: l + w, b: tp + h, tone: bg[1] });
  }
  if (!boxes.length) return [];

  const out = [];
  for (const [n, b] of es) {
    if (!/color:\s*SOFT/.test(b)) continue;
    if (!/fontSize/.test(b)) continue;                 // a rule is not a word
    const l = val(b, 'left', t), tp = val(b, 'top', t);
    if (l == null || tp == null) continue;
    if (l === 0 && tp === 0) continue;                 // wrapper-relative, see above
    for (const box of boxes) {
      // the caption's own origin inside the fill is enough: a label that starts on
      // a tone is read on that tone whatever it does afterwards.
      if (l >= box.l - 2 && l <= box.r && tp >= box.t - 2 && tp <= box.b) {
        out.push(label + '  ' + n + ' is SOFT and sits on ' + box.n + ' (' + box.tone + ')');
        break;
      }
    }
  }
  return out;
}
