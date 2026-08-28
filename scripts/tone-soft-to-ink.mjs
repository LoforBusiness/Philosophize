// T3, APPLIED: a word on a tone is INK.
//
//   node scripts/tone-soft-to-ink.mjs [--dry]
//
// check:shade gained a third pairing (by the JSX tree) and it found 63 captions
// sitting on STONE at 3.26:1 or on SHADE at 2.10:1 — under the floor, in 46
// scenes, every one of them left behind by the tonal pass that gave those boxes
// their fill. On paper SOFT is a legitimate 5.1:1 secondary grey, which is why
// none of this failed when it was written and why nothing caught it after.
//
// The fix is the one the rule already states, and the direction is not negotiable
// or clever: SOFT becomes INK. Hierarchy on these captions is carried by size and
// weight, which they already differ in; it was never carried by the grey, because
// at 3.26:1 the grey was not being read at all.
//
// It edits only the `color:` of the exact style names the checker names, so a
// style used somewhere legitimate is untouched unless the checker named it.
import fs from 'node:fs';
import path from 'node:path';
import { softOnToneByNest } from './lib/tonenest.mjs';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');

let files = 0, sites = 0, missed = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Scene.tsx')).sort()) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf8');
  const hits = softOnToneByNest(src, f);
  if (!hits.length) continue;
  const names = [...new Set(hits.map((h) => h.split('  ')[1].split(' is ')[0]))];
  let changed = 0;
  for (const n of names) {
    // The style body for exactly this name, then its colour inside it.
    const open = new RegExp('(^\\s{2}' + n + ':\\s*\\{)', 'm').exec(src);
    if (!open) { missed.push(f + ' ' + n + ' (no body)'); continue; }
    let i = open.index + open[1].length - 1, depth = 0, end = -1;
    for (; i < src.length; i += 1) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}') { depth -= 1; if (!depth) { end = i; break; } }
    }
    if (end < 0) { missed.push(f + ' ' + n + ' (unbalanced)'); continue; }
    const body = src.slice(open.index, end);
    const next = body.replace(/(^|[^A-Za-z])color:\s*SOFT/, '$1color: INK');
    if (next === body) { missed.push(f + ' ' + n + ' (colour not SOFT)'); continue; }
    src = src.slice(0, open.index) + next + src.slice(end);
    changed += 1;
  }
  if (changed && !DRY) fs.writeFileSync(p, src, { encoding: 'utf8' });
  if (changed) { files += 1; sites += changed; }
}
console.log((DRY ? 'would change ' : 'changed ') + sites + ' style(s) in ' + files + ' scene(s)');
for (const m of missed) console.log('  SKIPPED ' + m);
