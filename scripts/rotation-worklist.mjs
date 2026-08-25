// WHAT TO CONVERT NEXT, AND WHAT THE CLAIM ACTUALLY SAYS.
//
// check:rotation counts. This prints, so a conversion is a reading job rather
// than a search job: every remaining two-card question in reading order, with its
// prompt, its two cards, its explanation, and whether its neighbour already
// answers the same way.
//
//   node scripts/rotation-worklist.mjs            # every deck question left
//   node scripts/rotation-worklist.mjs epistemology   # one branch
//   node scripts/rotation-worklist.mjs --stageless    # lessons asking nothing on the stage
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const BELOW = ['cards', 'drag', 'lever', 'plot', 'split', 'field'];

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const wired = [...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => ({ id: m[1], comp: m[2] }));

const scriptOf = (comp) => {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const f of [path.join(DIR, `${low}Script.ts`), path.join(DIR, `${base}Script.ts`)]) {
    if (fs.existsSync(f)) return f;
  }
  return null;
};

const rows = [];
for (const { id, comp } of wired) {
  const f = scriptOf(comp);
  if (!f) continue;
  const src = fs.readFileSync(f, 'utf8');
  const theme = (/\/\/ Theme:\s*(.*)/.exec(src) || [])[1] ?? '';
  const qs = [];
  for (const m of src.matchAll(/interact:\s*\{([\s\S]*?)\n {4}\},/g)) {
    const body = m[1];
    const kind = BELOW.find((k) => new RegExp(`\\n\\s{6}${k}:\\s*[[{]`).test(body)) ?? 'stage';
    const prompt = (/prompt:\s*'((?:[^'\\]|\\.)*)'/.exec(body) || [])[1] ?? '';
    const explain = (/explain:\s*'((?:[^'\\]|\\.)*)'/.exec(body) || [])[1] ?? '';
    const cards = [...body.matchAll(/\{\s*text:\s*'((?:[^'\\]|\\.)*)',\s*correct:\s*(true|false)\s*\}/g)]
      .map((c) => `${c[2] === 'true' ? '✓' : '✗'} ${c[1]}`);
    qs.push({ kind, prompt, explain, cards });
  }
  if (qs.length) rows.push({ id, branch: id.replace(/-\d+$/, ''), n: +id.replace(/^.*-/, ''), file: path.basename(f), theme, qs });
}

const byBranch = new Map();
for (const r of rows) {
  if (!byBranch.has(r.branch)) byBranch.set(r.branch, []);
  byBranch.get(r.branch).push(r);
}
for (const [, l] of byBranch) l.sort((a, b) => a.n - b.n);

const arg = process.argv[2] ?? '';
const ANALOGUE = ['drag', 'lever', 'plot', 'split', 'field'];

// The list that matters for "implemented into ALL the lessons": a lesson with no
// analogue control anywhere in it, and the deck question that could become one.
if (arg === '--needed' || process.argv[3] === '--needed') {
  const only = arg === '--needed' ? '' : arg;
  console.log('\nLESSONS WITH NO ANALOGUE CONTROL AT ALL\n');
  let m = 0;
  for (const [b, list] of byBranch) {
    if (only && !b.startsWith(only)) continue;
    const need = list.filter((r) => !r.qs.some((q) => ANALOGUE.includes(q.kind)));
    if (!need.length) continue;
    console.log(`${b} — ${need.length} of ${list.length}`);
    for (const r of need) {
      m += 1;
      console.log(`\n  ${r.id}  [${r.qs.map((x) => x.kind).join('+')}]  ${r.file}`);
      if (r.theme) console.log(`    theme  ${r.theme}`);
      r.qs.forEach((q, k) => {
        if (q.kind !== 'cards') return;
        console.log(`    q${k + 1}   ${q.prompt}`);
        for (const c of q.cards) console.log(`          ${c}`);
        console.log(`      why  ${q.explain.slice(0, 220)}`);
      });
    }
    console.log('');
  }
  console.log(`${m} lessons need one.\n`);
  process.exit(0);
}

if (arg === '--stageless') {
  console.log('\nLESSONS THAT ASK NOTHING ON THE STAGE (H65) — in reading order\n');
  for (const [b, list] of byBranch) {
    const bad = list.filter((r) => !r.qs.some((q) => q.kind === 'stage'));
    if (!bad.length) continue;
    console.log(`${b} — ${bad.length}`);
    for (const r of bad) console.log(`  ${r.id.padEnd(28)} ${r.qs.map((q) => q.kind).join(' + ')}   ${r.file}`);
    console.log('');
  }
  process.exit(0);
}

console.log('\nEVERY TWO-CARD QUESTION LEFT, IN READING ORDER\n');
let n = 0;
for (const [b, list] of byBranch) {
  if (arg && !b.startsWith(arg)) continue;
  for (let i = 0; i < list.length; i += 1) {
    const r = list[i];
    const prevKinds = i > 0 ? new Set(list[i - 1].qs.map((q) => q.kind)) : new Set();
    for (let k = 0; k < r.qs.length; k += 1) {
      const q = r.qs[k];
      if (q.kind !== 'cards') continue;
      n += 1;
      const clash = prevKinds.has('cards') ? '  ⟵ NEIGHBOUR ALSO A DECK' : '';
      console.log(`${String(n).padStart(3)}. ${r.id}  q${k + 1}  [${r.qs.map((x) => x.kind).join('+')}]${clash}`);
      if (r.theme) console.log(`     theme  ${r.theme}`);
      console.log(`     ask    ${q.prompt}`);
      for (const c of q.cards) console.log(`            ${c}`);
      console.log(`     why    ${q.explain.slice(0, 190)}`);
      console.log('');
    }
  }
}
console.log(`${n} deck questions left${arg ? ` in ${arg}` : ''}.\n`);
