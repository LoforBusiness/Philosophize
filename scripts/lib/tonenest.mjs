// PAIR A WORD WITH ITS GROUND BY THE JSX TREE, NOT BY ITS NAME OR ITS NUMBERS.
//
// check:shade already pairs a fill with a caption two ways and both have a blind
// spot that met on one style. It pairs by NAME — `slab` with `slabText`, the house
// convention, and therefore invisible the moment somebody does not follow it. And
// it pairs by BOX, which needs both styles to resolve to coordinates.
//
// ethics31's DUTY lamp has neither. The fill is `lampBox` and the word is
// `lampOff`, so the name rule does not fire; and `lampOff` is
// `position: 'absolute'` with no left/top/width/height at all — it is centred by
// its parent's alignItems — so there is no box to compare. It shipped at 3.26:1
// in one state and 3.27:1 in the other, and check:shade printed
// "no SOFT type sits on a tone it cannot be read against".
//
// The tree does not have that blind spot. A word is on the ground its nearest
// filled ANCESTOR paints, which is what the reader sees and is exactly what the
// other two rules were approximating.
//
// NO DYNAMIC REGEXES IN THIS FILE. Patterns are literals — see the header of
// tonefit.mjs for what a string-built pattern costs in this toolchain.

/**
 * The third pairing for check:shade — SOFT type on a tone, found by the tree.
 *
 * Deliberately narrow, so that everything it reports is a real T3 violation with
 * no second reading. SOFT clears nothing below RULE (3.26:1 on STONE, 2.10:1 on
 * SHADE, 3.27:1 on INK) and it is never the LIT half of a two-state label — a lit
 * word is paper or ink. So a SOFT word inside a toned box is a defect whatever
 * else is going on around it, which is what the wider version of this could not
 * say: paired with every colour it reported 247 findings, nearly all of them
 * `onInk` state overrides measured against the tone they are drawn to replace.
 *
 * RULE is not in the list because the house already accepts SOFT on it at 4.08:1
 * (check-shade's own TOO_DARK_FOR_SOFT), and this rule exists to extend that one,
 * not to move it.
 */
export function softOnToneByNest(src, file) {
  const bodies = styleBodies(src);
  const TONES = ['STONE', 'SHADE', 'INK', 'SOFT'];
  const hasGround = (n) => !!groundOf(bodies.get(n));
  const out = [];
  const seen = new Set();
  for (const p of nestedPairs(src, hasGround)) {
    if (colourOf(bodies.get(p.word)) !== 'SOFT') continue;
    const g = groundOf(bodies.get(p.ground));
    if (!TONES.includes(g)) continue;
    const key = p.word + '|' + p.ground;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`${file}  ${p.word} is SOFT inside ${p.ground}, which is ${g}`);
  }
  return out;
}

/** Grab `name: { … }` bodies out of a StyleSheet.create block. */
export function styleBodies(src) {
  const out = new Map();
  const re = /^\s{2}([A-Za-z_$][\w$]*):\s*\{/gm;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex - 1, depth = 0;
    for (; i < src.length; i += 1) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}') { depth -= 1; if (!depth) break; }
    }
    out.set(m[1], src.slice(re.lastIndex, i));
  }
  return out;
}

const COLOUR = /(?:^|[^A-Za-z])color:\s*([A-Za-z_$][\w$]*|'#[0-9a-fA-F]{3,8}')/;
const BG = /backgroundColor:\s*([A-Za-z_$][\w$]*|'#[0-9a-fA-F]{3,8}')/;

export const colourOf = (body) => (body && body.match(COLOUR) || [])[1] || null;
export const groundOf = (body) => (body && body.match(BG) || [])[1] || null;

/**
 * Walk the JSX and return, for every `styles.X` mentioned, the nearest enclosing
 * `styles.Y` that paints a background. Returns [{ word, ground, line }].
 *
 * This is a bracket walk rather than a parse: it tracks element opens and closes
 * and the style names each open mentions. Self-closing tags never become a
 * ground, which is right — nothing is inside them.
 */
export function nestedPairs(src, hasGround) {
  const pairs = [];
  const stack = [];
  const tag = /<(\/?)([A-Z][\w.]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(src))) {
    const closing = m[1] === '/';
    const attrs = m[3] || '';
    const selfClose = m[4] === '/';
    const line = src.slice(0, m.index).split('\n').length;
    if (closing) { stack.pop(); continue; }

    // ONLY WHAT IS ALWAYS APPLIED. A style array reads
    //   [styles.word, answered && styles.onInk]
    // and the override arrives WITH a change of ground — the reveal fills the
    // same box INK, which is exactly why the word flips to paper. Paired against
    // the base tone it measures PAPER on STONE at 1.57:1, and the first probe
    // reported 247 of those. It could not tell a state from a defect, which is
    // the fault that got the boxiness metric deleted rather than tuned.
    // A conditional style belongs to whatever ground turns up with it; only an
    // unconditional one is sitting on the tone below it.
    const names = [];
    for (const mm of attrs.matchAll(/styles\.([A-Za-z_$][\w$]*)/g)) {
      const before = attrs.slice(0, mm.index);
      const cut = Math.max(before.lastIndexOf('['), before.lastIndexOf(','), before.lastIndexOf('{'));
      const seg = before.slice(cut + 1);
      if (seg.includes('&&') || seg.includes('?')) continue;
      names.push(mm[1]);
    }
    // The nearest ancestor that actually paints something.
    let ground = null;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i]) { ground = stack[i]; break; }
    }
    // A style on THIS element that paints is the ground for its own text too.
    const own = names.find((n) => hasGround(n));
    for (const n of names) {
      if (hasGround(n)) continue;
      const g = own || ground;
      if (g) pairs.push({ word: n, ground: g, line });
    }
    if (!selfClose) stack.push(own || ground || null);
  }
  return pairs;
}
