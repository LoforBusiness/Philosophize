// GIVE EVERY SCALAR TRACK THE MEMORY THE STANCE ALREADY HAS — group L, rule L5.
//
// A one-shot codemod, kept in the repo because it documents exactly what was done
// to 89 scenes and because `npm run check:smooth` now fails any scene that grows a
// bare `lerp(T[p], T[n], …)` back. Re-running it is safe: sites already converted
// are skipped.
//
//     lerp(X[p], X[n], tr)                        →  carry(cv, 0, n, X[p], X[n], tr)
//     lerp(F[p], F[n], tr) * (fFade ? grow : 1)    →  carry(cv, 1, n, F[p], F[n], tr, fFade ? grow : 1)
//
// The multiplier is ABSORBED rather than left outside, because what has to be
// remembered is the value that reached the screen — see the note above `carry` in
// cinematicKit.tsx.
//
// Run: node scripts/carry-tracks.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const CIN = path.join(process.cwd(), 'components', 'lesson', 'cinematic');

/** Index of the paren that closes the one at `open`. */
function matchParen(s, open) {
  let d = 0;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === '(') d++;
    else if (c === ')') { d--; if (d === 0) return i; }
    // Strings can hold parens; scene files are full of path data and labels.
    else if (c === "'" || c === '"' || c === '`') {
      const q = c;
      i++;
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') i++; i++; }
    }
  }
  return -1;
}

/** Split a call's argument list on top-level commas. */
function args(inner) {
  const out = [];
  let d = 0, start = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') d--;
    else if (c === "'" || c === '"' || c === '`') {
      const q = c; i++;
      while (i < inner.length && inner[i] !== q) { if (inner[i] === '\\') i++; i++; }
    } else if (c === ',' && d === 0) { out.push(inner.slice(start, i)); start = i + 1; }
  }
  out.push(inner.slice(start));
  return out.map((a) => a.trim());
}

/**
 * A trailing `* (…)` or `* ident`, if there is one — the fade multiplier.
 * Returns [text, endIndex] or null.
 */
function trailingMul(src, from) {
  let i = from;
  while (i < src.length && (src[i] === ' ' || src[i] === '\n')) i++;
  if (src[i] !== '*' || src[i + 1] === '*' || src[i + 1] === '/') return null;
  i++;
  while (i < src.length && (src[i] === ' ' || src[i] === '\n')) i++;
  if (src[i] === '(') {
    const close = matchParen(src, i);
    if (close < 0) return null;
    return [src.slice(i + 1, close), close + 1];
  }
  // A bare identifier — `* open`, `* intro`. Anything more complex (a second call,
  // arithmetic) is left alone: absorbing it would change the value, not just where
  // it is remembered.
  const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
  if (!m) return null;
  const rest = src.slice(i + m[0].length);
  if (/^\s*[*/+\-.[(]/.test(rest)) return null;
  return [m[0], i + m[0].length];
}

const files = readdirSync(CIN).filter((n) => n.endsWith('Scene.tsx')).sort();
let touched = 0, sites = 0;
const report = [];

for (const file of files) {
  const full = path.join(CIN, file);
  let src = readFileSync(full, 'utf8');
  if (src.includes('carry(cv,')) { report.push(`  = ${file} already carried`); continue; }

  // Collect every `lerp(NAME[p], NAME[n], …)` site, right to left so the offsets
  // of the ones still to do are not disturbed by the ones already written.
  const found = [];
  const re = /lerp\(\s*([A-Za-z_$][\w$]*)\[p\]\s*,\s*([A-Za-z_$][\w$]*)\[n\]\s*,/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1] !== m[2]) continue;
    const open = m.index + 4;             // the '(' of lerp(
    const close = matchParen(src, open);
    if (close < 0) continue;
    const a = args(src.slice(open + 1, close));
    if (a.length !== 3) continue;         // lerp() takes exactly three here
    found.push({ start: m.index, close, a });
  }
  if (!found.length) { report.push(`  · ${file} no tracks`); continue; }

  // Index the slots in SOURCE ORDER, so a scene reads 0,1,2… down the file and a
  // reader can find slot 3 by counting carries.
  found.forEach((f, k) => { f.k = k; });

  for (let idx = found.length - 1; idx >= 0; idx--) {
    const f = found[idx];
    const mul = trailingMul(src, f.close + 1);
    const end = mul ? mul[1] : f.close + 1;
    const tail = mul ? `, ${mul[0]}` : '';
    const call = `carry(cv, ${f.k}, n, ${f.a[0]}, ${f.a[1]}, ${f.a[2]}${tail})`;
    src = src.slice(0, f.start) + call + src.slice(end);
    sites++;
  }

  // The bag, next to the stance's. Every scene that has tracks has a `useHeld()`
  // or a `useDerivedValue` to hang it off; prefer the first line of the component.
  const bag = `  const cv = useCarry(${found.length});`;
  if (/const\s+held\w*\s*=\s*useHeld\(\);?/.test(src)) {
    src = src.replace(/(const\s+held\w*\s*=\s*useHeld\(\);?)/, `$1\n${bag}`);
  } else {
    // No figure to hold: put it directly after the component's opening brace.
    // `\r?\n`, because the scene files are a mix of both endings and the first
    // run silently skipped metaphysics2Scene — the one CRLF file in the else
    // branch — leaving a `cv` that was used and never declared.
    src = src.replace(/(export default function \w+\([^)]*\)\s*\{\r?\n)/, `$1${bag}\n`);
  }

  // Imports. `lerp` may still be used for things that are not tracks, so it stays.
  src = src.replace(
    /(import\s*\{[^}]*?)\}\s*from\s*'\.\/cinematicKit';/s,
    // Trailing comma AND whitespace: the house import list ends `keepHeld,\n`, and
    // stripping only the newline leaves `keepHeld,, useCarry`.
    (whole, head) => (head.includes('useCarry') ? whole : `${head.replace(/[\s,]*$/, '')}, useCarry, carry,\n} from './cinematicKit';`),
  );

  if (!src.includes('useCarry')) { report.push(`  ! ${file} NO cinematicKit import — skipped`); continue; }
  if (!DRY) writeFileSync(full, src);
  touched++;
  report.push(`  ✓ ${file.padEnd(28)} ${found.length} track(s)`);
}

console.log(report.join('\n'));
console.log(`\n${touched} scene(s) ${DRY ? 'would be' : ''} converted · ${sites} carry sites`);
