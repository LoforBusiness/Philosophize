// ─────────────────────────────────────────────────────────────────────────────
// WHICH FIGURE ON STAGE IS THE MASCOT, AND WHERE HIS HEAD IS.
//
// `mustBoxes` records one box per `<Stickman>` and nothing about who is who, and
// a beat can draw a lot of them — `ethics-ethics-6` draws twenty-five. Two things
// follow, and both were wrong for the life of the thought bubble:
//
//   · THE UNION IS NOT HIM. Taking the top of all the boxes anchored his bubble
//     on the tallest person in the scene: 148 units above his own head on that
//     lesson. Mount order cannot break the tie either — that is PAINT order, and
//     check:nod already records a two-figure scene mounting its lead LAST.
//   · A BOX TOP IS NOT A SKULL. The box is the union of his LIMBS, so a beat
//     where he lifts a hand, points, or wears a hat reports a top a median of
//     fourteen units above his head and as much as ninety.
//
// What settles the first is where the scene stands him: the track the RUNTIME
// uses when he walks (`walk={X}` where `X = BEATS.map(b => b.x ?? …)`, the array
// `CinematicPlayer` derives his live x from), and otherwise the constant his own
// `lookPose` or `reactPose` names, because 84 scenes declare that track and never
// stand anyone on it. What settles the second is the rig, which poses him in
// plain Node.
//
// It is one file because `make:thoughts` places against these answers and
// `check:thoughts` re-derives them — loadTs's own header records what three
// copies of a rule cost the camera.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadTs } from './loadts.mjs';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', '..');
const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const route = fs.readFileSync(path.join(REPO, ROUTE), 'utf8');
const COMP = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));

/** The scene source for a lesson id, or null. */
export function sceneOf(id) {
  const c = COMP.get(id);
  if (!c) return null;
  const base = `${c[0].toLowerCase()}${c.slice(1).replace(/Lesson$/, '')}Scene.tsx`;
  for (const f of [base, `${c}.tsx`]) {
    const p = path.join(REPO, DIR, f);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}

/**
 * A scene-level constant, resolved to its value: a number, `K_FIG`, a named
 * `const`, or a product of those.
 *
 * PRODUCTS, BECAUSE SIX LEADS ARE SCALED THAT WAY. `const K = K_FIG * 1.08;` used
 * to read as "not a number", so `scaleOf` answered 1 for `ethics-ethics-3` and
 * `logic-arguments-4` among others, and their bubbles were hung for a head eight
 * units shorter than the one drawn — the render put the trail's last disc on his
 * head in the first and on his fez in the second (found 11 Sep 2026).
 */
function constIn(src, token, depth = 0) {
  const t = String(token).replace(/\/\/.*$/, '').trim();
  if (/^-?[\d.]+$/.test(t)) return Number(t);
  if (t === 'K_FIG') return 1;
  if (depth > 5) return null;
  if (/^[A-Za-z_$][\w$]*$/.test(t)) {
    // A declaration of its own, or one of several on a `const` line:
    // `const VEIL_L = 14, VEIL_T = 312, VEIL_W = 128, VEIL_H = 136;`
    const d = src.match(new RegExp(`(?:\\bconst\\s+|,\\s*)${t}\\s*=\\s*([^;,\\n]+)`));
    return d ? exprIn(src, d[1], depth + 1) : null;
  }
  return exprIn(src, t, depth + 1);
}

/**
 * Plain scene arithmetic: numbers, named consts and `K_FIG` joined by + − × ÷, no
 * brackets. `const FUT_T = BASE - FUT_H` and `left: BALL_LX + BALL + 6` are how the
 * scenes place their furniture; anything cleverer is null rather than a guess.
 */
function exprIn(src, token, depth = 0) {
  if (depth > 6) return null;
  const t = String(token).replace(/\/\/.*$/, '').replace(/\s+/g, '');
  if (!t || /[()[\]{}?:'"`,]/.test(t)) return null;
  let sum = 0;
  for (const term of t.split(/(?=[+-])/)) {
    const sign = term[0] === '-' ? -1 : 1;
    const body = term.replace(/^[+-]/, '');
    if (!body) return null;
    let v = null;
    for (const piece of body.split(/(?=[*/])/)) {
      const op = /^[*/]/.test(piece) ? piece[0] : '*';
      const name = piece.replace(/^[*/]/, '');
      const f = /^[\d.]+$/.test(name) ? Number(name)
        : name === 'K_FIG' ? 1
          : /^[A-Za-z_$][\w$]*$/.test(name) ? constIn(src, name, depth + 1) : null;
      if (f === null || Number.isNaN(f)) return null;
      v = v === null ? f : op === '*' ? v * f : v / f;
    }
    sum += sign * v;
  }
  return sum;
}

/** The arguments of the call whose `(` sits at `open`, split at the top level. */
function callArgs(src, open) {
  const args = [];
  let depth = 0;
  let cur = '';
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '(' || ch === '[' || ch === '{') {
      depth += 1;
      if (depth === 1) continue;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth -= 1;
      if (depth === 0) { args.push(cur.trim()); return args; }
    } else if (ch === ',' && depth === 1) {
      args.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  return null;
}

const X_LINE = /const X = BEATS\.map\(\([^)]*\) => \w+\.x \?\? ([A-Za-z_$][\w$]*|-?[\d.]+)\)/;
/** A pose call that stands a figure on the walk track. */
const ON_TRACK = /\b(?:lookPose|reactPose|pose|travelStance)\([^;]*\bX\[/;
/** The lead's own pose, which names his x: `lookPose(s, FIG_X, …)`, `reactPose(v, V_X, …)`. */
const LEAD_POSE = /\b(?:lookPose|reactPose)\(\s*\w+\s*,\s*([A-Za-z_$][\w$]*|-?[\d.]+)\s*,/g;

/**
 * Per beat, where HE stands: the scene's own `X` array, rebuilt, when he walks on it.
 *
 * A TRACK NOBODY STANDS ON IS NOT HIS. 84 scenes declare `const X = BEATS.map(…)`
 * and then pose every figure at a constant, so the track's default is a number that
 * names nobody. Read as his x, it hung his thought over empty stage:
 * `aesthetics-aesthetics-4` declares 219 and poses its lead at 334, so all four of
 * its bubbles sat 117 units from his head, across the signature on the urinal
 * (found 11 Sep 2026). Where no pose call stands a figure on `X`, his x is the one
 * constant his own `lookPose` or `reactPose` names, since the lead is the figure
 * that looks and reacts and a second figure is posed with plain `pose`. Failing
 * that, the track as before.
 *
 * Null where nothing names him: the two lessons that predate the shared player
 * have no `const X` line at all, and a caller that cannot identify him must fall
 * back to the union rather than guess, because a wrong figure is worse than a
 * wide one.
 */
export async function walkOf(id) {
  const s = sceneOf(id);
  if (!s) return null;
  const c = COMP.get(id);
  const script = path.join(REPO, DIR, `${c[0].toLowerCase()}${c.slice(1).replace(/(Scene|Lesson)$/, '')}Script.ts`);
  if (!fs.existsSync(script)) return null;
  let BEATS;
  try { ({ BEATS } = await loadTs(script)); } catch { return null; }
  const m = s.match(X_LINE);
  if (!m || !ON_TRACK.test(s)) {
    const posed = [...new Set([...s.matchAll(LEAD_POSE)].map((q) => constIn(s, q[1])))];
    if (posed.length === 1 && posed[0] !== null) return BEATS.map(() => posed[0]);
  }
  if (!m) return null;
  const def = constIn(s, m[1]);
  if (def === null) return null;
  return BEATS.map((b) => b.x ?? def);
}

/**
 * What the scene draws the lead at — `K_FIG`, which is 1, in all but a handful.
 *
 * READ OFF HIS OWN POSE CALL FIRST, whose fourth argument is the scale his skeleton
 * is solved at. Failing that, off HIS `<Stickman k=…>` — found by the bundle name the
 * corpus gives its subject (`make-figure-roles`' PRINCIPAL), then by being neither a
 * crowd nor a second, and only then the first tag. The first tag alone is somebody
 * else in any scene with a crowd: `politicalScene` mounts four citizens at 0.82
 * before the sovereign at 1, and his answer line was hung 18 units low, onto his own
 * head (found in the render, 11 Sep 2026). Comments are stripped first, because
 * scene headers quote these calls.
 */
export function scaleOf(id) {
  const s = sceneOf(id);
  if (!s) return 1;
  const code = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const posed = /\b(?:lookPose|reactPose)\(/.exec(code);
  if (posed) {
    const a = callArgs(code, posed.index + posed[0].length - 1);
    const k = a && a.length > 3 ? constIn(code, a[3]) : null;
    if (k !== null) return k;
  }
  const tags = [...code.matchAll(/<Stickman\b([^>]*)>/g)].map((q) => q[1]);
  const tag = tags.find((a) => /\bD=\{(?:DF|OF|DSov|F|FIG)\}/.test(a))
    ?? tags.find((a) => !/\brole="(?:second|crowd)"/.test(a))
    ?? tags[0];
  if (!tag) return 1;
  const k = tag.match(/\bk=\{([^}]+)\}/);
  return k ? (constIn(code, k[1]) ?? 1) : 1;
}

/**
 * The stage y a bubble hangs from on this beat: the top of his head, plus his hat.
 *
 * `figs` are the beat's figure boxes, `mx` the x from `walkOf` (or null), `rise`
 * how far his skull stands above the ground for the pose he holds — `skullRise`
 * from ./loadrig, already multiplied by the scene's scale — `hat` what HIS OWN
 * costume adds on top (`loadHats` in ./loadrig), and `foot` how far his box runs
 * below the ground: half a limb stroke times the scale, because the shin is drawn
 * as a bar whose round end passes the ankle.
 *
 * Null when there are no figures at all.
 */
export function crownOf(figs, mx, rise, hat, foot = 0) {
  if (!figs.length) return null;
  const known = typeof mx === 'number';
  const his = known ? figs.filter((f) => mx >= f.b[0] - 8 && mx <= f.b[0] + f.b[2] + 8) : [];
  // The TOPMOST of the boxes his x falls in: where he stands in front of something
  // the probe also called a figure, the highest crown is the one to clear.
  //
  // AND THE NEAREST WHEN HIS x FALLS IN NONE OF THEM, which is not an edge case —
  // it is every beat where he walks far enough that the probe caught him somewhere
  // other than where the beat leaves him, and those are the beats this matters on.
  // Refusing to answer there sent them all down the union branch, which is how a
  // thought ended up 154 units to his side with the check declining to look.
  // Whichever box is nearest, its FEET are on the same ground as his, so the skull
  // it yields is right even if the figure is not.
  const own = figs.length === 1 ? figs[0]
    : his.length ? his.reduce((a, b) => (a.b[1] < b.b[1] ? a : b))
      : known ? figs.reduce((a, b) => (Math.abs(a.b[0] + a.b[2] / 2 - mx) < Math.abs(b.b[0] + b.b[2] / 2 - mx) ? a : b))
        : null;
  if (!own) {
    const fx0 = Math.min(...figs.map((f) => f.b[0]));
    const fx1 = Math.max(...figs.map((f) => f.b[0] + f.b[2]));
    return { crown: Math.min(...figs.map((f) => f.b[1])), cx: (fx0 + fx1) / 2, sure: false };
  }
  const feet = own.b[1] + own.b[3] - foot;
  const skull = feet - rise;
  return {
    crown: Math.max(own.b[1], skull - hat),
    // WHERE THE BEAT LEAVES HIM, NOT WHERE THE PROBE CAUGHT HIM.
    //
    // A must-box is measured at ONE moment of a beat and the figure moves during
    // it, so on a walking beat the recorded centre is wherever he happened to be
    // when the camera settled: measured across the corpus, 113 of 317 walking
    // beats record him 40 or more units from the x the script walks him to, and
    // one is 151 units out. Anchor there and the bubble comes to REST that far to
    // his side — `logic-arguments-21` beat 6 parked a thought 154 units left of
    // him — because the player restores exactly the offset this recorded.
    //
    // His end x is what the reader looks at: it is where he stands for the rest of
    // the beat, and it is the value the player itself settles on. On a beat he
    // does not walk the two agree to within 13 units either way (median 4.5), so
    // this is one rule rather than two.
    cx: typeof mx === 'number' ? mx : own.b[0] + own.b[2] / 2,
    sure: true,
  };
}

/**
 * THE WORDS ON A BEAT, EACH WIDENED TO THE PLATE IT IS PRINTED ON.
 *
 * The must-box probe records a word only when it has two characters or more, so a
 * row's own number is invisible to anything placed against it: in
 * `epistemology-knowledge-2` a bubble cleared PULL, DO NOT PUSH and sat on the "3"
 * in front of it (found in the render, 11 Sep 2026). A word inside a plate no more
 * than a few lines tall is taken to run that plate's full width, which covers a
 * numeral, a tick or a mark beside it. A plate much taller than its words is a panel
 * or a field rather than a row, and is left as art.
 */
export function wordsOf(items) {
  const arts = items.filter((it) => it.k === 'art');
  return items.filter((it) => it.k === 'text').map((it) => {
    if (it.g) return it;                          // a glyph box is already its whole footprint
    const [x, y, w, h] = it.b;
    const plate = arts
      .filter((a) => a.b[0] <= x + 0.5 && a.b[1] <= y + 0.5
        && a.b[0] + a.b[2] >= x + w - 0.5 && a.b[1] + a.b[3] >= y + h - 0.5
        && a.b[3] <= h * 3 + 8)
      .sort((p, q) => p.b[2] * p.b[3] - q.b[2] * q.b[3])[0];
    if (plate) return { ...it, b: [plate.b[0], y, plate.b[2], h] };
    // AND WHERE NO PLATE WAS RECORDED, A GLYPH SLOT EITHER SIDE. A plate drawn as a
    // View with its words inside it is not a leaf, so the probe never records it —
    // `knowHowScene`'s numbered rows are exactly that, which is why the "3" above
    // was invisible twice over.
    const pad = h * GLYPH_SLOT;
    return { ...it, b: [x - pad, y, w + 2 * pad, h] };
  });
}

/** A numeral, a tick or an arrow set beside a word, in lines of that word's own height. */
export const GLYPH_SLOT = 1.6;

/**
 * HOW FAR THE ANSWER ITSELF LIFTS HIS HEAD, in the one lesson that does it.
 *
 * An answer line is drawn on the ANSWERED frame, and `politicalScene` stands the
 * sovereign higher on that frame than on the one the must-box measured: his pedestal
 * rises by PED (30) as the answer lands (`auth = ease01(qv)`), so a line hung ten
 * units over his head at ground level came to rest on it (found in the render, 11 Sep
 * 2026). AUTHORED, because it is the only one — scanning every lead pose call for an
 * x, ground or scale computed from qv, dragPos or pickPos found this and nothing else,
 * and a rule derived from one case is a pattern that will not see the second.
 */
export const ANSWER_LIFT = { 'political-political-1': 30 };

/** The answer seal's size and overhang, read out of `Target.tsx` so the two cannot drift. */
function sealGeometry() {
  const src = fs.readFileSync(path.join(REPO, DIR, 'Target.tsx'), 'utf8');
  const num = (re, what) => {
    const m = src.match(re);
    if (!m) throw new Error(`scenefig: cannot read the seal's ${what} out of Target.tsx`);
    return Number(m[1]);
  };
  return {
    size: num(/\bseal:\s*\{[^}]*\bwidth:\s*([\d.]+)/, 'size'),
    right: num(/\bseal:\s*\{[^}]*\bright:\s*(-?[\d.]+)/, 'right'),
    bottom: num(/\bsealBottom:\s*\{\s*bottom:\s*(-?[\d.]+)/, 'bottom'),
    top: num(/\bsealTop:\s*\{\s*top:\s*(-?[\d.]+)/, 'top'),
    // The pip and the halo a LIVE target draws, which is how its own box is found.
    pip: num(/\bconst PIP\s*=\s*([\d.]+)/, 'pip size'),
    pipTop: num(/\bpip:\s*\{[^}]*\btop:\s*(-?[\d.]+)/, 'pip top'),
    pipRight: num(/\bpip:\s*\{[^}]*\bright:\s*(-?[\d.]+)/, 'pip right'),
    halo: num(/\bconst HALO\s*=\s*([\d.]+)/, 'halo'),
  };
}
const SEAL = sealGeometry();

/**
 * WHERE AN ANSWER'S SEAL IS STRUCK, ON EVERY LABELLED PLATE ON THE BEAT.
 *
 * An answer line is drawn on the ANSWERED frame, and the must-box was measured
 * before it: `Target` stamps a ✓ or ✕ disc on a corner of the plate the reader
 * tapped — bottom right, or top right where a scene asks for it — overhanging the
 * plate's edges, and the probe never saw it. `ethics-ethics-4` hung "No. The trick
 * worked." across the ✕ on IT FOLLOWS (found in the render, 11 Sep 2026). So an
 * answer line keeps off both of those corners of every small plate that carries
 * words, with four units to spare.
 *
 * THE CORNERS, NOT THE PLATE. Keeping answer lines off whole plates held them away
 * from a plate's empty padding too, where no seal ever lands, and declined answer
 * lines that were perfectly placed. Thoughts need none of this: they are never up
 * while an answer is being given (group O).
 *
 * AND ON EVERY TARGET, NOT ONLY ON A SMALL PLATE WITH WORDS IN IT. The seal is struck
 * on the Target's own box, and the plate rule only finds a Target that happens to be
 * a plate under 80 units carrying its own label. `aesthetics-aesthetics-18`'s answers
 * are 130×92 panels captioned from ABOVE, so "That's the one. Naturally." sat across
 * the ✓ on THE MUSIC (found in the render, 11 Sep 2026). A live Target draws a halo
 * `HALO` outside its box and a `PIP` square inside its top-right corner, the probe
 * records both as art on the beat being asked, and together they give the box back
 * exactly.
 */
export function sealsOf(items) {
  const texts = items.filter((it) => it.k === 'text');
  const arts = items.filter((it) => it.k === 'art');
  const SPARE = 4;
  const size = SEAL.size + 2 * SPARE;
  const plates = arts
    .filter((a) => a.b[2] * a.b[3] <= 12000 && a.b[3] <= 80
      && texts.some((t) => t.b[0] >= a.b[0] - 0.5 && t.b[1] >= a.b[1] - 0.5
        && t.b[0] + t.b[2] <= a.b[0] + a.b[2] + 0.5 && t.b[1] + t.b[3] <= a.b[1] + a.b[3] + 0.5))
    .map((a) => a.b);
  const targets = [];
  for (const p of arts) {
    if (Math.abs(p.b[2] - SEAL.pip) > 0.6 || Math.abs(p.b[3] - SEAL.pip) > 0.6) continue;
    const right = p.b[0] + SEAL.pip + SEAL.pipRight;
    const top = p.b[1] - SEAL.pipTop;
    const halo = arts.find((h) => h !== p && h.b[3] > 2 * SEAL.halo + SEAL.pip
      && Math.abs(h.b[0] + h.b[2] - SEAL.halo - right) <= 1 && Math.abs(h.b[1] + SEAL.halo - top) <= 1);
    if (halo) targets.push([halo.b[0] + SEAL.halo, halo.b[1] + SEAL.halo, halo.b[2] - 2 * SEAL.halo, halo.b[3] - 2 * SEAL.halo]);
  }
  return [...plates, ...targets].flatMap((b) => {
    const left = b[0] + b[2] - SEAL.right - SEAL.size - SPARE;
    return [
      { k: 'art', b: [left, b[1] + b[3] - SEAL.bottom - SEAL.size - SPARE, size, size] },
      { k: 'art', b: [left, b[1] + SEAL.top - SPARE, size, size] },
    ];
  });
}

/**
 * THE ONE-CHARACTER MARKS A SCENE DRAWS, WHICH THE MUST-BOX PROBE NEVER RECORDS.
 *
 * The probe keeps a word only when it has two characters or more, so a lone "?", an
 * arrow or a single digit is invisible to anything placed against the stage. In
 * `political-political-5` a thought sat squarely over the big "?" on Rawls's veil
 * (found in the render, 11 Sep 2026), and 24 such marks stand in 20 scenes. Teaching
 * the probe would re-measure every lesson, so this reads them out of the SOURCE:
 * each `<Text>` holding one character, placed at its own style's box where that has a
 * left and a top, and otherwise at the box of the element it sits inside — every "?"
 * in the corpus is centred in a wrapper that says where it is. Only arithmetic the
 * scene spells out is resolved; anything else is left out, never guessed.
 *
 * Returned as `text` items marked `g`, applied to every beat: a mark shown on only
 * some beats costs a few placements on the others, and never lets one through.
 */
export function glyphBoxesOf(id) {
  const s = sceneOf(id);
  if (!s) return [];
  const code = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const sheetAt = code.indexOf('StyleSheet.create(');
  if (sheetAt < 0) return [];
  const sheet = code.slice(sheetAt);
  const styleOf = (name) => {
    const m = sheet.match(new RegExp(`\\n\\s*${name}:\\s*\\{([^}]*)\\}`));
    if (!m) return null;
    const get = (key) => {
      const q = m[1].match(new RegExp(`(?:^|[\\s,{])${key}:\\s*([^,\\n]+)`));
      return q ? exprIn(code, q[1]) : null;
    };
    return { left: get('left'), top: get('top'), width: get('width'), height: get('height'), fontSize: get('fontSize'), lineHeight: get('lineHeight') };
  };
  const out = [];
  const mark = /<(?:Animated\.)?Text\b[^>]*?style=\{\[?\s*styles\.(\w+)[^>]*>\s*([^<\s{}])\s*<\/(?:Animated\.)?Text>/g;
  for (const m of code.matchAll(mark)) {
    const own = styleOf(m[1]);
    const line = own?.lineHeight ?? (own?.fontSize ? own.fontSize * 1.25 : 20);
    let box = null;
    if (own && own.left !== null && own.top !== null) {
      box = [own.left, own.top, own.width ?? line, own.height ?? line];
    } else {
      // The element this mark sits inside: open tags pushed, closing tags popped,
      // from the start of the JSX the mark belongs to.
      const from = code.lastIndexOf('return (', m.index);
      const stack = [];
      for (const tag of code.slice(Math.max(0, from), m.index).matchAll(/<(\/?)((?:Animated\.)?[A-Z]\w*)\b([^>]*?)(\/?)>/g)) {
        if (tag[4] === '/') continue;
        if (tag[1] === '/') { stack.pop(); continue; }
        stack.push(tag[3]);
      }
      const pm = (stack[stack.length - 1] ?? '').match(/style=\{\[?\s*styles\.(\w+)/);
      const ps = pm ? styleOf(pm[1]) : null;
      if (ps && ps.left !== null && ps.top !== null) box = [ps.left, ps.top, ps.width ?? line, ps.height ?? line];
    }
    if (box && box.every((v) => typeof v === 'number' && Number.isFinite(v))
      && box[2] > 0 && box[3] > 0 && box[2] * box[3] < 400 * 560 * 0.2) {
      out.push({ k: 'text', b: box, t: m[2], g: 1 });
    }
  }
  return out;
}
