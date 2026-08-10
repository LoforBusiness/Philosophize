// NO TIMER MAY DRIVE REACT STATE AT FRAME RATE INSIDE A DRAWN COMPONENT.
//
// The profile went sticky at the XP graph, and the cause was one line:
// RankClimbChart counted its "+N XP" callout with `setInterval(…, 16)` calling
// setState. Sixty React renders a second for the 1.6s the line takes to grow —
// and each one re-rendered the whole <Svg> with it: two paths, four gridlines,
// the node circles and every label. Inside a ScrollView, which is exactly where
// the reader is scrolling.
//
// The number itself was never the cost. Dragging a drawn tree behind it was.
//
// So the rule is narrow on purpose: a fast timer in a file that also renders SVG.
// A fast timer in a leaf that renders a few <Text> nodes is fine and is not
// flagged — LessonReward's digit counter is exactly that, and it has to stay a
// per-digit layout because the script face it is set in re-centres otherwise.
//
// The fix, when this fires: write the value from the UI thread instead. Reanimated
// can set a NATIVE prop, and `text` on a TextInput is one — a Text's children are
// not. See ACounter in RankClimbChart.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOTS = ['components', 'app'];
/** Anything at or under this period is frame rate for our purposes. */
const FAST_MS = 100;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(r));
const bad = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const draws = /<Svg[\s>]/.test(src);
  if (!draws) continue;
  // setInterval(… , N) — the period is the last argument of the call.
  for (const m of src.matchAll(/setInterval\([\s\S]{0,600}?\}\s*,\s*(\d+)\s*\)/g)) {
    const ms = Number(m[1]);
    if (ms > FAST_MS) continue;
    // Only a state setter makes it a RENDER storm; a shared-value write is free.
    const body = m[0];
    if (!/\bset[A-Z]\w*\(/.test(body)) continue;
    bad.push(`  ${f.replace(/\\/g, '/')} — setInterval at ${ms}ms drives setState in a file that renders <Svg>`);
  }
}

console.log('\nTIMERS THAT RE-RENDER DRAWN TREES\n');
console.log(`  ${files.length} component files scanned`);
if (!bad.length) {
  console.log('  ok    no fast timer drives React state in a file that draws SVG.\n');
} else {
  console.log(`  ${bad.length} problem(s):\n`);
  console.log(bad.join('\n'));
  console.log('');
  process.exit(1);
}
