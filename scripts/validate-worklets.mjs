// ─────────────────────────────────────────────────────────────────────────────
// THE WORKLET INITIALISATION-ORDER CHECKS.
//
// Two ways to reference something before it exists, both of which throw at RUN
// time, and neither of which tsc can see. That last part is the whole reason
// this file exists: referencing a later declaration from inside a function body
// is perfectly legal, because the function normally runs later — and tsc has no
// idea that Reanimated evaluates a worklet's closure eagerly. Both faults below
// shipped to production having passed tsc and every other validator here.
//
//   1. A WORKLET THAT CALLS A WORKLET DECLARED LATER IN THE SAME FILE. The babel
//      plugin builds each worklet's closure when the MODULE is evaluated, so the
//      call is captured in its temporal dead zone. This throws at IMPORT time,
//      which fails the whole route tree rather than the one scene that used it —
//      a blank screen on every lesson, not a broken animation on one.
//
//      Real instance: `settleStep` was added to rig.ts at line 172 calling
//      `mixStance` at line 1331. `Cannot access 'mixStance' before
//      initialization`. The rule was already written four lines above `lift` in
//      that same file.
//
//   2. A RENDER-TIME WORKLET THAT READS A SHARED VALUE DECLARED BELOW IT.
//      `useDerivedValue` / `useAnimatedStyle` / `useAnimatedProps` /
//      `useAnimatedReaction` all invoke their callback immediately to establish
//      an initial value. `useEffect` and `useCallback` defer, so a later const
//      is fine there and they are not checked.
//
//      Real instance: CinematicPlayer's camera read `bi.value` eighteen lines
//      above `const bi = useSharedValue(0)`. It broke exactly one lesson —
//      ethics-ethics-8, the only one that passes `shots` — because the worklet's
//      first line returns early when a lesson passes none, so 101 lessons took
//      the early return and never reached the dead zone.
//
// COMMENTS ARE STRIPPED BEFORE MATCHING, and that is not a detail. The first
// version of check 1 reported `solve` calling `lift` and `strideStance` calling
// `moveTr`; neither happens. Both names appear only in prose — one of them
// inside the very docstring that states this rule. A detector that reads
// comments as code costs more than it saves.
//
// Pass `--root <dir>` to check a tree other than this one. That is how the
// detector itself is regression-tested: run it against the commits that carried
// the two faults above and it must report them.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argRoot = process.argv.indexOf('--root');
const ROOT = argRoot > -1 ? path.resolve(process.argv[argRoot + 1]) : HERE;
const DIRS = ['components', 'lib', 'app'].map((d) => path.join(ROOT, d));

const errs = [];

function walkDir(d, out = []) {
  let names;
  try { names = fs.readdirSync(d); } catch { return out; }
  for (const n of names) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walkDir(p, out);
    else if (/\.(ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');

/** Body of a braced block starting at line `start`, by real brace matching. */
function blockAt(lines, start) {
  let depth = 0, seen = false, body = [], end = start;
  for (let j = start; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === '{') { depth++; seen = true; }
      else if (ch === '}') depth--;
    }
    body.push(lines[j]);
    end = j;
    if (seen && depth <= 0) break;
  }
  return { body: body.join('\n'), end };
}

/** Body of the call whose opening paren follows `from`, by bracket matching. */
function callAt(src, from) {
  const i = src.indexOf('(', from);
  if (i < 0) return null;
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return null;
}

const files = [...new Set(DIRS.flatMap((d) => walkDir(d)))];
let workletFiles = 0;
let hookFiles = 0;

// ── 1. worklet → worklet declared later ──────────────────────────────────────
const EAGER = ['useDerivedValue', 'useAnimatedStyle', 'useAnimatedProps', 'useAnimatedReaction'];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);

  if (src.includes("'worklet'") || src.includes('"worklet"')) {
    const fns = [];
    lines.forEach((l, i) => {
      const m = l.match(/^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/);
      if (!m) return;
      const { body, end } = blockAt(lines, i);
      const head = body.split('\n').slice(0, 4).join('\n');
      fns.push({
        name: m[1], line: i, end,
        code: strip(body),
        worklet: /['"]worklet['"]/.test(head),
      });
    });
    const worklets = fns.filter((f) => f.worklet);
    if (worklets.length) {
      workletFiles++;
      for (const f of worklets) {
        for (const g of worklets) {
          if (g.line <= f.end) continue;
          if (!new RegExp('\\b' + g.name + '\\s*\\(').test(f.code)) continue;
          errs.push(
            `${rel(file)}: worklet \`${f.name}\` (line ${f.line + 1}) calls worklet ` +
            `\`${g.name}\`, declared later at line ${g.line + 1} — throws at import. ` +
            `Move \`${f.name}\` below \`${g.name}\`.`
          );
        }
      }
    }
  }

  // ── 2. render-time worklet → shared value declared later ───────────────────
  //
  // PER COMPONENT, NOT PER FILE. Treating the file as one scope reported three
  // sites that are all correct: `Confetti`, `Pct` and `DrawnRule` each take or
  // declare a name that a LATER, unrelated component also uses — two of them as
  // props, which are not declarations at all. Every one of those would have sent
  // someone to "fix" working code, which is how a check gets switched off.
  if (!EAGER.some((h) => src.includes(h))) continue;
  let counted = false;

  for (let i = 0; i < lines.length; i++) {
    // A top-level definition: `function X(`, or `const X =` at zero indent.
    if (!/^(?:export\s+)?(?:default\s+)?(?:function\s+[A-Za-z_$][\w$]*|const\s+[A-Za-z_$][\w$]*\s*=)/.test(lines[i])) continue;
    const { body, end } = blockAt(lines, i);
    if (!EAGER.some((h) => body.includes(h))) { i = end; continue; }

    const shared = [];
    const sre = /const\s+([A-Za-z_$][\w$]*)\s*=\s*useSharedValue\s*[<(]/g;
    let m;
    while ((m = sre.exec(body))) shared.push({ name: m[1], at: m.index });
    if (shared.length) {
      if (!counted) { hookFiles++; counted = true; }
      for (const hook of EAGER) {
        const hre = new RegExp('\\b' + hook + '\\s*\\(', 'g');
        let h;
        while ((h = hre.exec(body))) {
          const call = callAt(body, h.index);
          if (!call) continue;
          const code = strip(call);
          for (const sv of shared) {
            if (sv.at < h.index) continue;
            if (!new RegExp('\\b' + sv.name + '\\s*\\.\\s*value\\b').test(code)) continue;
            const line = i + body.slice(0, h.index).split('\n').length;
            const dline = i + body.slice(0, sv.at).split('\n').length;
            errs.push(
              `${rel(file)}: ${hook} on line ${line} reads \`${sv.name}.value\`, but ` +
              `\`${sv.name}\` is declared at line ${dline} of the same component — it ` +
              `runs during render, so that is a dead zone. Move the hook below it.`
            );
          }
        }
      }
    }
    i = end;
  }
}

console.log('');
for (const e of errs) console.log(`✗ ${e}`);
if (errs.length) {
  console.log(`\n${errs.length} initialisation-order problem${errs.length === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log(
  `${workletFiles} worklet files and ${hookFiles} animated components: nothing read before it exists.`
);
