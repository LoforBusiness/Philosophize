// ─────────────────────────────────────────────────────────────────────────────
// WHICH GESTURE DOES EACH BEAT ASK FOR?
//
// Shared by `check-life` and by the tools that rewrite scripts, so the rule and
// the codemod can never disagree about what a beat is currently doing.
//
// The gesture key is NOT always `g`. Counted across the corpus it is `p` 125
// times, `g` 33, and then a long tail of one-offs (`a`, `d`, `r`, `b`, `v`,
// `sub`, `one`, `m`). Guessing `g` would silently skip two thirds of the app and
// report the corpus as having no gestures at all — the shape of blindness §21
// records four times over. So the key is READ OUT OF THE INTERFACE, from the
// property the author documented as the gesture.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

export const DIR = 'components/lesson/cinematic';
export const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

/** lesson id → scene component name, in the order the route declares them. */
export function wiredLessons() {
  const route = fs.readFileSync(ROUTE, 'utf8');
  const out = new Map();
  for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) out.set(m[1], m[2]);
  return out;
}

/** The script path for a scene component, or null when it carries its own beats. */
export function scriptFor(comp) {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const p of [path.join(DIR, `${low}Script.ts`), path.join(DIR, `${comp}.tsx`)]) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Read a script, normalising line endings.
 *
 * CRLF IS INVISIBLE AND IT MAKES A FILE LOOK EMPTY. Beats are split on a literal
 * LF pattern, so a CRLF script parses as ZERO beats — and a codemod driven off
 * that silently skips the file while reporting success, which is how three
 * lessons sat out an entire pass here without anything failing. `git checkout`
 * re-materialises files as CRLF under `core.autocrlf`, so this is not a rare
 * accident, it is what happens every time anything is reverted on Windows.
 */
export function readScript(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

/** Strip line and block comments so a commented-out beat is never counted. */
export function decomment(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/**
 * The property a script uses for its gesture code, taken from the doc comment the
 * house style puts on it. Falls back to `g` only when the interface says nothing.
 */
export function gestureKey(src) {
  const m = src.match(/\/\*\*[^*]*(?:gesture|emote)[^*]*\*\/\s*([A-Za-z_$][\w$]*)\??\s*:/i);
  return m ? m[1] : null;
}

/** The BEATS array body, or null. */
export function beatsBody(src) {
  const m = src.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  return m ? m[1] : null;
}

/** Split a BEATS body into one chunk per beat. */
export function beatChunks(body) {
  return body.split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c));
}

/**
 * Every beat of every wired lesson: its gesture code, and enough context to judge
 * it.
 *
 * A BEAT THAT NAMES NO GESTURE IS A NEUTRAL STAND, NOT AN INHERITANCE. Every one
 * of the 183 gesture arrays in the corpus is built the same way —
 * `BEATS.map((b) => b.p ?? 0)` — so omitting the key does not hold the previous
 * pose, it resets the figure to standing. This was modelled as inheritance first,
 * which made 246 beats look like continuations of whatever preceded them when
 * they are in fact the flattest thing in the app.
 */
export function corpus() {
  const out = [];
  for (const [id, comp] of wiredLessons()) {
    const file = scriptFor(comp);
    if (!file) continue;
    const raw = readScript(file);
    // THE KEY IS READ FROM THE RAW SOURCE AND THE BEATS FROM THE STRIPPED ONE.
    // `decomment` deletes the very doc comment that names the gesture property, so
    // reading both from the same text found a key in zero of 184 lessons and
    // reported a corpus with no gestures at all — loudly, and in the shape of a
    // finding rather than a fault.
    const src = decomment(raw);
    const body = beatsBody(src);
    if (!body) continue;
    const key = gestureKey(raw);
    const chunks = beatChunks(body);
    const beats = chunks.map((ch, i) => {
      const m = key && ch.match(new RegExp(`(?:^|[\\s{,])${key}\\s*:\\s*(-?\\d+)`));
      const declared = m ? Number(m[1]) : null;
      return {
        i,
        declared,
        code: declared === null ? 0 : declared,   // `?? 0` — the scene's own default
        graded: /\binteract\s*:/.test(ch),
        quote: /\bquote\s*:/.test(ch),
        text: (ch.match(/text:\s*'((?:[^'\\]|\\.)*)'/) || [, ''])[1],
      };
    });
    out.push({ id, comp, file, key, beats });
  }
  return out;
}

/** The bands a code falls in. */
export function band(code) {
  if (code === null) return 'none';
  if (code < 100) return 'rig';
  if (code < 200) return 'held';
  if (code < 300) return 'prop';
  return 'played';
}
