// GIVE EVERY WALKING FIGURE A FACING.
//
//   node scripts/turn-facing.mjs [--dry]
//
// check:turn finds the scenes whose travelling `pose()` is handed a literal 1, so
// the figure faces right all lesson and moonwalks through every beat whose x goes
// down. The fix is the same two lines in all of them, and every scene that already
// turns writes them identically:
//
//   const DIR = dirsFrom(X, 1);
//   …K_FIG, facing(DIR[p], DIR[n], bt.value), 1)
//
// `dirsFrom` reads the x track once on the JS thread — +1 where it rises, -1 where
// it falls, HOLD while standing — and `facing` eases the sign through zero over
// 0.36s so he turns through a profile rather than mirroring between two frames.
//
// It edits only what it can see is safe: the import lists, one line after the X
// declaration, and the fifth argument of the pose() calls whose x comes from X.
// Anything it cannot place, it reports and leaves alone.
import fs from 'node:fs';
import path from 'node:path';

const DIR_CIN = path.join('components', 'lesson', 'cinematic');
const DRY = process.argv.includes('--dry');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/**
 * Add a name to an existing `import { … } from 'src'` list.
 *
 * THE INNER GROUP MUST NOT CROSS A BRACE. Written `([\s\S]*?)` it is non-greedy
 * but unbounded, so starting at the FIRST `import {` in the file it happily runs
 * through every import in between to reach `} from './rig'` — and the insertion
 * then lands in whichever import came first. It put `facing, dirsFrom` into
 * `from 'react-native'` in all 55 files, which tsc caught immediately, but a
 * codemod that writes to the wrong line is exactly the kind that gets believed.
 */
function addImport(src, from, name) {
  if (new RegExp('\\b' + name + '\\b[^\\n}]*}\\s*from\\s*\'' + from + '\'').test(src)) return src;
  const re = new RegExp('import\\s*\\{([^}]*?)\\}\\s*from\\s*\'' + from + '\'');
  const m = re.exec(src);
  if (!m) return null;
  if (new RegExp('(^|[,{\\s])' + name + '\\s*[,}]').test(m[1])) return src;
  // Insert after the opening brace, keeping the file's own line shape.
  const inner = m[1];
  const next = inner.replace(/^(\s*)/, `$1${name}, `);
  return src.slice(0, m.index) + m[0].replace(inner, next) + src.slice(m.index + m[0].length);
}

let changed = 0, skipped = [];
for (const f of fs.readdirSync(DIR_CIN).filter((x) => x.endsWith('Scene.tsx')).sort()) {
  const p = path.join(DIR_CIN, f);
  let src = fs.readFileSync(p, 'utf8');
  const clean = strip(src);

  // Only scenes with an X track and a travelling pose whose facing is a literal.
  if (!/const\s+X\s*=\s*BEATS\.map\(/.test(clean)) continue;

  // Find the travelling pose() calls and their fifth argument's span.
  const spans = [];
  for (let at = src.indexOf('pose('); at >= 0; at = src.indexOf('pose(', at + 5)) {
    if (at > 0 && /[A-Za-z0-9_$]/.test(src[at - 1])) continue;
    const args = [];
    let depth = 0, start = at + 5;
    for (let i = start; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === '(' || ch === '[' || ch === '{') depth += 1;
      else if (ch === ')' || ch === ']' || ch === '}') {
        if (depth === 0) { args.push({ text: src.slice(start, i), a: start, b: i }); break; }
        depth -= 1;
      } else if (ch === ',' && depth === 0) {
        args.push({ text: src.slice(start, i), a: start, b: i });
        start = i + 1;
      }
    }
    if (args.length < 5) continue;
    if (!/\bX\s*\[/.test(args[1].text)) continue;
    const d = args[4].text.trim();
    if (/facing\s*\(/.test(d) || /\bDIRS?\b/.test(d) || /\bdir\b/.test(d)) continue;
    if (!/^-?1$/.test(d)) { skipped.push(`${f} — fifth argument is ${JSON.stringify(d)}, not a literal`); continue; }
    spans.push(args[4]);
  }
  if (!spans.length) continue;

  // `bt` has to be in scope at the call site.
  if (!/\bbt\b/.test(clean)) { skipped.push(`${f} — no bt in scope`); continue; }
  if (!/\bconst\s+p\s*=/.test(clean) || !/\bconst\s+n\s*=/.test(clean)) {
    skipped.push(`${f} — no p/n beat indices`); continue;
  }

  // Replace from the back so the earlier offsets stay valid.
  for (const s of spans.slice().reverse()) {
    src = src.slice(0, s.a) + ' facing(DIR[p], DIR[n], bt.value)' + src.slice(s.b);
  }

  // `const DIR = dirsFrom(X, 1);` immediately after the X track.
  if (!/const\s+DIR\s*=\s*dirsFrom\(/.test(src)) {
    const xline = /const\s+X\s*=\s*BEATS\.map\([^\n]*\n/.exec(src);
    if (!xline) { skipped.push(`${f} — cannot place DIR`); continue; }
    const at = xline.index + xline[0].length;
    src = src.slice(0, at)
      + '// WHICH WAY HE IS POINTING, read off the same x track he walks along:\n'
      + '// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a\n'
      + '// figure who walks left to something keeps facing it while he talks about it.\n'
      + 'const DIR = dirsFrom(X, 1);\n'
      + src.slice(at);
  }

  const withRig = addImport(src, './rig', 'dirsFrom');
  if (!withRig) { skipped.push(`${f} — no rig import`); continue; }
  src = withRig;
  const withKit = addImport(src, './cinematicKit', 'facing');
  if (!withKit) { skipped.push(`${f} — no cinematicKit import`); continue; }
  src = withKit;

  if (!DRY) fs.writeFileSync(p, src, { encoding: 'utf8' });
  changed += 1;
}

console.log((DRY ? 'would change ' : 'changed ') + changed + ' scene(s)');
for (const s of skipped) console.log('  SKIPPED ' + s);
