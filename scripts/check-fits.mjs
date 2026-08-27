// GROUP S — S8 · NO WORD ON THE STAGE MAY BE CUT OFF BY ITS OWN BOX.
//
//   npm run check:fits
//   FITS_VERBOSE=1 npm run check:fits    # every measurement, not only the failures
//
// The reader found one and was blunt about it:
//
//   "It has a word that is cut off in a box. This is directly against what I have
//    said before … I want to make sure this is a rule that is made so that when
//    lessons are created and all current lessons … no words like this are cut off."
//
// S1 already says a word may not overflow its own box. What was missing is a check
// anybody actually runs: `check:readable` measures this correctly and needs Metro
// and a headless Chrome, so it is NOT in `npm run check` — which is the exact
// shape of failure §11 records ("a budget nobody executes is not a budget"). A
// word therefore shipped cut off with a green suite.
//
// THIS ONE IS OFFLINE. `scripts/lib/ttfwidth.mjs` reads real advance widths out of
// the real .ttf in plain Node, the same instrument `check:quips` uses, so the rule
// costs milliseconds instead of a browser and can sit in the suite forever.
//
// ── WHAT IT MEASURES ────────────────────────────────────────────────────────
//
// For every <Text> a scene draws: the string, the box it is given, and the face it
// is set in. Then:
//
//   · numberOfLines={1}  → the WHOLE string must fit. There is no second line to
//                          escape onto, so anything over the width is an ellipsis
//                          where a word should be.
//   · otherwise          → each individual WORD must fit. React Native wraps
//                          between words, so a sentence is safe; a single word
//                          wider than its box has nowhere to go and is cut.
//
// ── AND IT REPORTS WHAT IT COULD NOT READ ───────────────────────────────────
//
// A checker that measures nothing must not look clean (§21, U2). Where a string
// or a width cannot be resolved statically the element is counted as UNREAD and
// printed, so a low finding count can never be mistaken for a safe corpus.
import fs from 'node:fs';
import path from 'node:path';
import { loadFont } from './lib/ttfwidth.mjs';

const DIR = 'components/lesson/cinematic';
const CUT_BUDGET = 0;

/** The design-space width every scene is authored in (cinematicKit.STAGE_W). */
const STAGE_W = 400;

/** `Inter_700Bold` → node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf */
const FONT_CACHE = new Map();
function face(family) {
  if (FONT_CACHE.has(family)) return FONT_CACHE.get(family);
  const m = /^([A-Za-z]+)_(\d{3}[A-Za-z]+)$/.exec(family);
  let f = null;
  if (m) {
    const dir = m[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const p = path.join('node_modules', '@expo-google-fonts', dir, m[2], `${family}.ttf`);
    if (fs.existsSync(p)) { try { f = loadFont(p); } catch { f = null; } }
  }
  FONT_CACHE.set(family, f);
  return f;
}

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

/** `const CAP = ['A PAPER', 'A REPORTER'];` — the strings a scene draws from a table. */
function stringArrays(src) {
  const out = new Map();
  for (const m of src.matchAll(/const\s+([A-Z][A-Z_0-9]*)\s*(?::[^=]+)?=\s*\[([^\]]*)\]\s*;/g)) {
    const items = [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'"));
    if (items.length) out.set(m[1], items);
  }
  return out;
}

function styleBlocks(src) {
  const i = src.indexOf('StyleSheet.create(');
  if (i < 0) return new Map();
  let d = 0, start = -1, body = '';
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { if (d === 0) start = j; d++; }
    else if (src[j] === '}') { d--; if (d === 0) { body = src.slice(start + 1, j); break; } }
  }
  const out = new Map();
  const re = /(\w+)\s*:\s*\{/g; let m;
  while ((m = re.exec(body))) {
    let k = 1, j = m.index + m[0].length;
    for (; j < body.length && k > 0; j++) { if (body[j] === '{') k++; else if (body[j] === '}') k--; }
    out.set(m[1], body.slice(m.index + m[0].length, j - 1));
    re.lastIndex = j;
  }
  return out;
}

function prop(block, key, t) {
  if (!block) return null;
  for (const part of block.split(',')) {
    const c = part.indexOf(':');
    if (c < 0 || part.slice(0, c).trim() !== key) continue;
    const raw = part.slice(c + 1).trim();
    const q = /^'([^']*)'$/.exec(raw);
    if (q) return q[1];
    const e = raw.replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
    if (e.includes('NaN')) return null;
    try { const v = eval(e); return Number.isFinite(v) ? v : null; } catch { return null; }
  }
  return null;
}

/** Every <Text …>content</Text> — opening tag, inner text, and its enclosing box. */
function texts(src) {
  const out = [];
  const re = /<(?:Animated\.)?Text\b/g; let m;
  while ((m = re.exec(src))) {
    let d = 0, j = m.index;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') d--;
      else if (src[j] === '>' && d === 0) break;
    }
    const open = src.slice(m.index, j + 1);
    if (src[j - 1] === '/') { re.lastIndex = j; continue; }
    const close = src.indexOf('</', j);
    const inner = close < 0 ? '' : src.slice(j + 1, close);

    // THE NEAREST ENCLOSING <View>, because half the corpus lays its cards out
    // with flex: the Text has no width of its own and takes the card's, less its
    // padding. Without this those elements are UNREAD — and they are exactly the
    // answer cards, which are the words a reader most needs to be able to finish.
    // A STACK, not "the last <View> before this point". The first version took the
    // most recent opening tag and ignored whether it had already closed, so a Text
    // inside a wide row was given the width of a 23px checkbox that had opened and
    // closed three lines earlier — it reported "FORM" as cut off into 23px on a
    // stage where that row is comfortably wide. An ancestor is only an ancestor if
    // it is still open.
    let host = null;
    {
      const stack = [];
      const tagRe = /<(?:Animated\.)?View\b[^>]*>|<\/(?:Animated\.)?View>/g;
      const before = src.slice(0, m.index);
      let tg;
      while ((tg = tagRe.exec(before))) {
        if (tg[0].startsWith('</')) stack.pop();
        else if (!tg[0].endsWith('/>')) stack.push(tg[0]);
      }
      host = stack.length ? stack[stack.length - 1] : null;
    }
    out.push({ open, inner, host });
    re.lastIndex = close < 0 ? j : close;
  }
  return out;
}

const findings = [];
let measured = 0, unread = 0;
const unreadWhy = new Map();

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.tsx'))) {
  const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const id = f.replace(/(Scene)?\.tsx$/, '');
  const t = consts(src);
  const arrays = stringArrays(src);
  const blocks = styleBlocks(src);

  for (const el of texts(src)) {
    // ── the strings this element can draw ────────────────────────────────
    const inner = el.inner.trim();
    let strings = [];
    if (/^[^{<]+$/.test(inner) && inner) strings = [inner];
    else {
      const arr = /\{\s*([A-Z][A-Z_0-9]*)\s*\[/.exec(inner);
      if (arr && arrays.has(arr[1])) strings = arrays.get(arr[1]);
      else {
        // A TWO-STATE LABEL IS TWO STRINGS, AND BOTH HAVE TO FIT. Scenes write
        // `{answered ? 'IT IS NOT' : 'TAP ONE'}` constantly, and the longer
        // branch is often the one nobody measured — it only appears after the
        // reader has answered, which is the frame least likely to be looked at.
        const both = [...inner.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'"));
        if (both.length && both.every((x) => x.trim() && !/[{}<>]/.test(x))) strings = both;
      }
    }
    if (!strings.length) { unread++; unreadWhy.set('content', (unreadWhy.get('content') ?? 0) + 1); continue; }

    // ── the box and the face ─────────────────────────────────────────────
    const names = [...el.open.matchAll(/styles\.(\w+)/g)].map((x) => x[1]);
    if (!names.length) { unread++; unreadWhy.set('no style', (unreadWhy.get('no style') ?? 0) + 1); continue; }
    const merged = names.map((n) => blocks.get(n) ?? '').join(', ');

    // an inline `{ width: X }` on the element wins over the sheet
    let width = null;
    const inlineW = /width:\s*([A-Za-z_0-9.\-+*/ ]+?)[,}]/.exec(el.open);
    if (inlineW) {
      const e = inlineW[1].replace(/[A-Za-z_][\w]*/g, (n) => (t.has(n) ? String(t.get(n)) : 'NaN'));
      if (!e.includes('NaN')) { try { const v = eval(e); if (Number.isFinite(v)) width = v; } catch { /* */ } }
    }
    if (width == null) width = prop(merged, 'width', t);
    // A BOX PINNED LEFT AND RIGHT HAS A WIDTH TOO, and it is most of them.
    // The first run read only `width:` and left 367 elements unmeasured, which is
    // the majority of the corpus — a coverage hole that big turns a green result
    // into an opinion.
    if (width == null) {
      const l = prop(merged, 'left', t), r = prop(merged, 'right', t);
      if (l != null && r != null) width = STAGE_W - l - r;
    }
    // AND A TEXT WITH NO WIDTH TAKES ITS PARENT'S, LESS THE PADDING.
    let hostPad = 0;
    if (width == null && el.host) {
      const hostNames = [...el.host.matchAll(/styles\.(\w+)/g)].map((x) => x[1]);
      const hostStyle = hostNames.map((n) => blocks.get(n) ?? '').join(', ');
      const hw = prop(hostStyle, 'width', t);
      if (hw != null) {
        hostPad = prop(hostStyle, 'paddingHorizontal', t) ?? 0;
        width = hw - hostPad * 2 - (prop(hostStyle, 'borderWidth', t) ?? 0) * 2;
      }
    }
    const size = prop(merged, 'fontSize', t);
    const family = prop(merged, 'fontFamily', t);
    const ls = prop(merged, 'letterSpacing', t) ?? 0;
    const padL = prop(merged, 'paddingHorizontal', t) ?? 0;

    if (width == null || size == null || !family) {
      unread++;
      unreadWhy.set('no box/face', (unreadWhy.get('no box/face') ?? 0) + 1);
      continue;
    }
    const font = face(family);
    if (!font) { unread++; unreadWhy.set('no ' + family, (unreadWhy.get('no ' + family) ?? 0) + 1); continue; }

    const room = width - padL * 2;
    const oneLine = /numberOfLines=\{1\}/.test(el.open);
    const measure = (s) => font.width(s, size) + ls * Math.max(0, s.length - 1);

    for (const s of strings) {
      measured++;
      if (oneLine) {
        // NO SECOND LINE TO ESCAPE ONTO: the whole string has to fit or it ellipsises.
        const w = measure(s);
        if (w > room + 0.5) {
          findings.push({ id, s, w, room, why: 'clamped to one line' });
        }
      } else {
        // React Native breaks between words, so only an unbreakable word is cut.
        for (const word of s.split(/\s+/)) {
          const w = measure(word);
          if (w > room + 0.5) findings.push({ id, s: word, w, room, why: 'one word, wider than its box' });
        }
        // AND A LABEL THAT WRAPS OUT OF THE PLATE IT LABELS IS CUT TOO.
        //
        // This is the case the reader found, and neither of the rules above sees
        // it: epistemology20's "OWN LEGWORK" is 76.1px into a 76px box, so every
        // WORD fits and the STRING does not. With no numberOfLines it wraps to a
        // second line — and the plate it sits on is 24 tall, which holds one. The
        // second line lands below the box, which is what "cut off in a box" looks
        // like on a phone.
        //
        // The tell that a caption is a single-row label is that some drawn box in
        // the same scene has its exact width and is too short for two lines. A
        // caption written to wrap has no such twin.
        // A LABEL THAT WRAPS IS ONLY A DEFECT IF THE EXTRA LINES DO NOT FIT.
        //
        // Wrapping is normal: logic21 draws "A MATCH IN / PETROL" on two lines
        // inside a chip and it reads perfectly. A first version of this rule
        // treated every centred caption as a one-liner and reported 21 findings,
        // most of them deliberate. What separates them is HEIGHT, not lines.
        //
        // So find the plate this caption sits on — the drawn box whose vertical
        // span contains the caption's own top — and ask whether the wrapped text
        // fits between the caption's top and the plate's bottom. epistemology20's
        // "OWN LEGWORK" needs two lines (22.4) in the 17 left under a 24-tall
        // plate, so the second one lands below the box: cut.
        // A LABEL THAT EXACTLY FILLS ITS BOX HAS ALREADY FAILED.
        //
        // "OWN LEGWORK" measures 76.07 into 76 — the defect the reader actually
        // found — and a 0.5px tolerance swallowed it whole. Text measurement is
        // not bit-identical across platforms, so a string with no slack wraps on
        // whichever engine rounds a hair wider, and the author has no way to know
        // which. One pixel of headroom is the difference between "fits" and "fits
        // here". Hence `- MARGIN` rather than `+ 0.5` on the way in.
        const MARGIN = 1;
        const whole = measure(s);
        if (whole > room - MARGIN) {
          const lineH = prop(merged, 'lineHeight', t) ?? size * 1.3;
          const myTop = prop(merged, 'top', t);
          let lines = 1, cur = '';
          for (const word of s.split(/\s+/)) {
            const next = cur ? cur + ' ' + word : word;
            if (measure(next) > room - MARGIN && cur) { lines++; cur = word; } else cur = next;
          }
          let room4 = null;
          if (myTop != null) {
            for (const b of blocks.values()) {
              const bt = prop(b, 'top', t), bh = prop(b, 'height', t);
              if (bt == null || bh == null) continue;
              if (myTop < bt || myTop >= bt + bh) continue;      // caption is not on this plate
              const avail = bt + bh - myTop;
              if (room4 == null || avail < room4) room4 = avail; // the tightest plate wins
            }
          }
          if (room4 != null && lines * lineH > room4 + 0.5) {
            findings.push({
              id, s, w: whole, room,
              why: `${lines} lines of ${lineH.toFixed(1)} into ${room4.toFixed(1)} left on its plate`,
            });
          }
        }
      }
    }
  }
}

console.log('\nS8 — NO WORD IS CUT OFF BY ITS OWN BOX\n');
console.log('  ' + measured + ' string(s) measured against the real .ttf · ' + unread + ' could not be read statically');
if (unread) {
  console.log('  (' + [...unreadWhy].map(([k, v]) => v + ' ' + k).join(' · ') + ')');
  console.log('  Those are NOT cleared — they are unmeasured. check:readable covers them in a browser.');
}
console.log('');
if (findings.length) {
  console.log('  cut off:');
  for (const x of findings.slice(0, 30)) {
    console.log('      ' + x.id.padEnd(18) + '"' + x.s + '"');
    console.log('          ' + x.w.toFixed(1) + 'px into ' + x.room.toFixed(1) + ' — ' + x.why);
  }
  if (findings.length > 30) console.log('      … and ' + (findings.length - 30) + ' more');
  console.log('');
}
const over = findings.length > CUT_BUDGET;
console.log('  ' + (over ? 'FAIL' : 'ok  ') + '  words cut off by their own box  ' + findings.length + ' of ' + CUT_BUDGET);
if (over) console.log('\n  widen the box, shorten the words, or drop numberOfLines={1} so it can wrap (S8).');
else if (findings.length < CUT_BUDGET) console.log('\n  lower CUT_BUDGET to ' + findings.length + ' in scripts/check-fits.mjs.');
console.log('');
process.exit(over ? 1 : 0);
