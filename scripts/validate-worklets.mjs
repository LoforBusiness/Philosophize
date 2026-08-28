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
      // ── FROM THE START OF THE BODY, NOT THE FIRST FOUR LINES ────────────────
      //
      // This used to test the opening four lines of the declaration for the
      // directive, which silently excludes any function whose SIGNATURE is longer
      // than three lines — the directive is then on line five and the function is
      // not treated as a worklet at all, so nothing it calls is ever checked.
      //
      // That is not hypothetical. `figureAt` in components/branch/walkFigure.ts
      // carries an eight-parameter signature over four lines. It called a worklet
      // declared below it, this check said "nothing read before it exists", and
      // the bundle threw `Cannot access 'airborne' before initialization` on
      // import — the whole route tree, from a detector that was looking straight
      // at it. A directive is by definition the first statement of the body, so
      // that is where to look for it.
      // ── AND THE BODY BRACE IS NOT THE FIRST BRACE ───────────────────────────
      //
      // `indexOf('{')` finds the first brace in the whole declaration, which for
      // any function with an INLINE OBJECT RETURN TYPE is the return type's:
      //
      //     function trackAt(a, b, u): { cx: number; cy: number; s: number } {
      //
      // so `inner` began " cx: number; …" and the directive test failed. Every
      // such function was silently classified as not-a-worklet and neither this
      // check nor 1b ever looked at it. That is exactly how camera.ts's `LEAD`
      // shipped — `trackAt` has that signature.
      //
      // This is the SECOND time this detector has missed a real crash by getting
      // "where does the body start" wrong; the first was a signature longer than
      // three lines. So do it properly: the body brace is the one that MATCHES
      // the block's final `}`. Walk back from the end and balance.
      const sb = strip(body);
      let depth = 0, open = -1;
      for (let k = sb.lastIndexOf('}'); k >= 0; k--) {
        if (sb[k] === '}') depth++;
        else if (sb[k] === '{' && --depth === 0) { open = k; break; }
      }
      const inner = open < 0 ? '' : sb.slice(open + 1);
      fns.push({
        name: m[1], line: i, end,
        code: strip(body),
        worklet: /^\s*['"]worklet['"]\s*;/.test(inner),
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

      // ── 1b. worklet → module-scope CONST declared later ────────────────────
      //
      // The same fault, with a value instead of a function, and it is the harder
      // one to see: 1 above only ever looked for one worklet CALLING another, so
      // a worklet closing over a plain number sailed through.
      //
      // It is the identical mechanism. The babel plugin builds each worklet's
      // closure object at module scope right after the declaration, and captures
      // every free identifier — so a `const` further down the file is still in
      // its temporal dead zone when that runs.
      //
      // `camera.ts` had `const LEAD = 0.07` ten lines BELOW the worklet that
      // reads it. tsc passed, all seventeen validators passed, and the bundle
      // threw `Cannot access 'LEAD' before initialization` on import — which
      // takes down the whole route tree rather than one camera move, because
      // every cinematic lesson imports that module. It reached production.
      const consts = [];
      lines.forEach((l, i) => {
        // Module scope only: column 0, no indentation. An indented const is
        // inside something and has its own scope.
        const m = l.match(/^(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*)\s*=/);
        if (m) consts.push({ name: m[1], line: i });
      });
      for (const f of worklets) {
        for (const c of consts) {
          if (c.line <= f.end) continue;
          if (!new RegExp('\\b' + c.name + '\\b').test(f.code)) continue;
          // Shadowed by its own local of the same name? Then it is not captured.
          if (new RegExp('(?:const|let|var)\\s+' + c.name + '\\b').test(f.code)) continue;
          errs.push(
            `${rel(file)}: worklet \`${f.name}\` (line ${f.line + 1}) reads \`${c.name}\`, ` +
            `a module-scope const declared later at line ${c.line + 1} — throws at import ` +
            `with "Cannot access '${c.name}' before initialization". ` +
            `Move \`${c.name}\` above \`${f.name}\`.`
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

// ── 3. a worklet that calls a PLAIN function ─────────────────────────────────
//
// The rule is four words in CLAUDE.md §17 — "a plain JS closure cannot cross
// into a worklet" — and until now nothing enforced it. It is not a slow path or
// a style nit. `react-native-worklets` packs a non-worklet function found in a
// worklet's closure as a `RemoteFunction`, and the ONLY thing a RemoteFunction
// does on the UI thread is throw:
//
//     [Worklets] Tried to synchronously call a non-worklet function `rad`
//     on the UI thread.
//
// (memory/valueUnpacker.native.js — read it before doubting this.) An uncaught
// throw inside a style worklet is fatal in a release build, so the cost of one
// missing directive is the whole app.
//
// ── AND IT IS INVISIBLE IN A BROWSER, WHICH IS WHERE THIS PROJECT LOOKS ──────
//
// react-native-web has no second thread. Every worklet runs on the JS thread
// with an ordinary closure, so the plain function is simply CALLED and the
// screen is perfect. §21's whole method — mount the real screen, measure it,
// screenshot it — is structurally blind here, in the same way it is blind to
// `measureInWindow` returning the window origin for a detached view.
//
// That is not hypothetical either. `Dial.tsx` shipped an OTA with `rad()` inside
// `useAnimatedStyle`, having passed tsc, `check:ui`, a mounted-and-measured
// browser sweep and a four-case contact sheet, and it crashed every phone a few
// seconds after launch — the Insights tab is one of the five warmed at startup,
// so the reader never even had to go there. The same defect was already sitting
// in `logic33Scene`'s `gridY`, ten lines above a `fit` that got the directive
// right, shipped and unreported since 13 Aug.
//
// So the check has to be static, and this is it. A name counts as SAFE when it
// is a worklet anywhere in the repo; a call is a fault only when the callee is
// declared in this file or imported from inside it (`@/…`, `./…`), which is what
// keeps `withSpring`, `interpolate` and every other library import out of it.
{
  const HOOKS = ['useAnimatedStyle', 'useDerivedValue', 'useAnimatedProps',
    'useAnimatedReaction', 'useAnimatedScrollHandler', 'useFrameCallback', 'runOnUI'];

  const srcOf = new Map();
  for (const file of files) srcOf.set(file, strip(fs.readFileSync(file, 'utf8')));

  // Every name the repo declares as a worklet. A directive is by definition the
  // first statement of a body, so walk back from it to the declaration it opens.
  const isWorklet = new Set();
  for (const src of srcOf.values()) {
    let i = 0;
    while ((i = src.indexOf("'worklet'", i)) !== -1) {
      const head = src.slice(Math.max(0, i - 800), i);
      const decls = [...head.matchAll(/(?:const|let|function)\s+([A-Za-z_$][\w$]*)/g)];
      if (decls.length) isWorklet.add(decls[decls.length - 1][1]);
      i += 9;
    }
  }

  /** The module a name is imported from, or null. Handles multi-line clauses. */
  const importedFrom = (src, name) => {
    for (const m of src.matchAll(/import\s+([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g)) {
      if (new RegExp('\\b' + name + '\\b').test(m[1])) return m[2];
    }
    return null;
  };
  const declaredIn = (src, name) =>
    new RegExp('(?:^|[^.\\w$])(?:const|let|var|function)\\s+' + name + '\\b').test(src);

  // AN ALIAS IS THE SAME FUNCTION. `isWorklet` holds the name a directive was
  // declared under, so `import { walk as rigWalk }` looks like a plain call to a
  // checker that only reads the call site — which is what the first run reported,
  // about `rig.walk`, one of the most-called worklets in the app. Resolve the
  // local name back to the exported one before judging it.
  const exportedAs = (src, name) => {
    for (const m of src.matchAll(/import\s+([\s\S]*?)\s*from\s*['"][^'"]+['"]/g)) {
      const a = new RegExp('([A-Za-z_$][\\w$]*)\\s+as\\s+' + name + '\\b').exec(m[1]);
      if (a) return a[1];
    }
    return name;
  };

  /** Every worklet body in a file: the hooks' arguments, and each directive's block. */
  function workletBodies(src) {
    const out = [];
    for (const hook of HOOKS) {
      let i = 0;
      while ((i = src.indexOf(hook, i)) !== -1) {
        const before = src[i - 1];
        if (before && /[.\w$]/.test(before)) { i += hook.length; continue; }
        const call = callAt(src, i + hook.length);
        i += hook.length;
        if (call) out.push({ at: i, body: call, what: hook });
      }
    }
    let j = 0;
    while ((j = src.indexOf("'worklet'", j)) !== -1) {
      const open = src.lastIndexOf('{', j);
      let depth = 0, close = -1;
      for (let k = open; k >= 0 && k < src.length; k++) {
        if (src[k] === '{') depth++;
        else if (src[k] === '}' && --depth === 0) { close = k; break; }
      }
      if (close > open) out.push({ at: j, body: src.slice(open, close + 1), what: 'a worklet' });
      j += 9;
    }
    return out;
  }

  for (const file of files) {
    const src = srcOf.get(file);
    if (!HOOKS.some((h) => src.includes(h)) && !src.includes("'worklet'")) continue;
    const seen = new Set();

    for (const { at, body, what } of workletBodies(src)) {
      const local = new Set();
      for (const m of body.matchAll(/(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) local.add(m[1]);

      for (const m of body.matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) {
        const name = m[1];
        const prev = body[m.index - 1];
        if (prev && /[.?\w$]/.test(prev)) continue;                 // a method, not a free name
        if (local.has(name) || isWorklet.has(name) || isWorklet.has(exportedAs(src, name))) continue;
        if (/^(if|for|while|switch|return|typeof|catch|function|new|await|do|else)$/.test(name)) continue;

        const from = importedFrom(src, name);
        const mine = from ? /^[.@]/.test(from) : declaredIn(src, name);
        if (!mine) continue;                                        // a library call, or a parameter

        const line = src.slice(0, at).split('\n').length;
        const key = `${name}@${line}`;
        if (seen.has(key)) continue;
        seen.add(key);
        errs.push(
          `${rel(file)}: ${what} near line ${line} calls \`${name}()\`, which is not a ` +
          `worklet${from ? ` (imported from ${from})` : ''} — it is packed as a RemoteFunction ` +
          `and THROWS on the UI thread, fatally, while a browser runs it fine. ` +
          `Give \`${name}\` a 'worklet' directive (it stays callable from JS).`
        );
      }
    }
  }
}

console.log('');
for (const e of errs) console.log(`✗ ${e}`);
if (errs.length) {
  console.log(`\n${errs.length} worklet problem${errs.length === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log(
  `${workletFiles} worklet files and ${hookFiles} animated components: nothing read before it ` +
  `exists, and nothing a worklet calls is a plain function.`
);
