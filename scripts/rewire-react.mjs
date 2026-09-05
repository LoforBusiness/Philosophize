// POINT EVERY DEAD REACTION FLAG AT THE CONTROL THE SCRIPT ACTUALLY SHIPS.
//
//   node scripts/rewire-react.mjs           # report
//   node scripts/rewire-react.mjs --write
//
// R7c says the picture moves as the reader moves the control, and a scene gets
// that by deriving a flag from its own beat:
//
//     const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
//
// which was written to be un-desynchronisable — it reads the beat, so it cannot
// disagree with the beat. What it cannot survive is the CONTROL BEING RETIRED.
// `lever` became `sort` and `field` became `poll` across the whole corpus, and
// every one of these flags kept reading a key that no script has any more. 51
// scenes hold perfectly still while the reader works the control, and
// `check:react` counts them as wired because its test is whether the scene
// mentions `dragPos` — which they all still do, inside a branch that is now
// permanently false.
//
// ── ONLY lever -> sort IS MECHANICAL ────────────────────────────────────────
//
// A lever's value was 0..1 along its stops and a sort's is 0..1 along its bins,
// in the same authored order — the conversion changed no `reads` string, so the
// scene's own mapping still means what it meant. A `field` was TWO axes and a
// poll is one, so those 17 cannot be renamed: each needs a decision about what
// the single value drives. They are listed and left alone.
//
// The value read changes as well as the flag: `dragPos` on a permuted control is
// display space (see SceneApi.pickPos).
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const WRITE = process.argv.includes('--write');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const CONTROLS = ['drag', 'lever', 'plot', 'split', 'field', 'poll', 'sort'];

const done = [];
const manual = [];
const odd = [];

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Scene.tsx')).sort()) {
  const p = path.join(DIR, f);
  const raw = fs.readFileSync(p, 'utf8');
  const src = strip(raw);
  const m = /const REACT\s*=\s*BEATS\.map\(\(b\) => \(b\.interact\?\.([a-z]+) \? 1 : 0\)\);/.exec(src);
  if (!m) continue;
  const base = f.replace('Scene.tsx', '');
  const sp = path.join(DIR, `${base}Script.ts`);
  if (!fs.existsSync(sp)) continue;
  const script = strip(fs.readFileSync(sp, 'utf8'));
  const has = CONTROLS.filter((c) => new RegExp(`^\\s{6,}${c}:\\s*[{[]`, 'm').test(script));
  if (has.includes(m[1])) continue;                       // the flag is live

  if (m[1] === 'field' || !has.includes('sort')) { manual.push(`${base}  reads ${m[1]}, ships ${has.join('+') || 'nothing'}`); continue; }

  let out = raw.replace(
    /const REACT(\s*=\s*BEATS\.map\(\(b\) => \(b\.interact\?\.)lever( \? 1 : 0\)\);)/,
    'const REACT$1sort$2',
  );
  // The value too: on a permuted control `dragPos` is where the chip is on the
  // pad, and `pickPos` is which bin that means.
  const lines = out.split('\n');
  let swaps = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (!/reacting \?/.test(lines[i])) continue;
    if (!/dragPos\.value/.test(lines[i])) continue;
    lines[i] = lines[i].replace(/dragPos\.value/g, 'pickPos.value');
    swaps += 1;
  }
  out = lines.join('\n');
  if (!swaps) { odd.push(`${base} — REACT reads lever but no 'reacting ?' line uses dragPos`); continue; }

  // The component takes it instead of dragPos, where dragPos has no other use.
  const stillUsesDrag = /\bdragPos\.value/.test(strip(out));
  out = out.replace(
    /(export default function \w+\(\{[^}]*?)\bdragPos\b([^}]*\}: SceneApi\))/,
    stillUsesDrag ? '$1dragPos, pickPos$2' : '$1pickPos$2',
  );
  if (!/pickPos/.test(out.split('\n').find((l) => l.startsWith('export default function')) ?? '')) {
    odd.push(`${base} — could not add pickPos to the signature`);
    continue;
  }

  if (WRITE) fs.writeFileSync(p, out, { encoding: 'utf8' });
  done.push(`${base} (${swaps} track${swaps === 1 ? '' : 's'})`);
}

console.log(`${WRITE ? 'rewired' : 'would rewire'} ${done.length} lever->sort scenes`);
for (const d of done) console.log(`    ${d}`);
if (odd.length) { console.log(`\n${odd.length} could not be done automatically:`); for (const o of odd) console.log(`    ${o}`); }
console.log(`\n${manual.length} need a decision, not a rename (a field was two axes, a poll is one):`);
for (const x of manual) console.log(`    ${x}`);
if (!WRITE) console.log('\n  --write to apply');
