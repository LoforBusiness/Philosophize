// ─────────────────────────────────────────────────────────────────────────────
// AN EXPLANATION THAT NAMES A SLOT NAMES NOTHING NOW (J9, R13).
//
//   node scripts/fix-sort-explains.mjs --dry
//
// Thirty-seven of the fifty converted sort questions open by naming a position on
// the lever that no longer exists — "The far setting." "The middle setting, and
// it is two jobs rather than one." Several then refer to "the first setting"
// mid-paragraph to mean a rival answer.
//
// Both are worse than stale now than they were before, because the bins are
// SHUFFLED (R11): there is no first setting and no far one. The fix is the same
// in every case — name the ANSWER, using the bin's own label, which is also the
// word the reader has in front of them.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const unesc = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const ORD = { first: 0, second: 1, third: 2, fourth: 3 };
let fixed = 0;
const left = [];

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts'))) {
  const file = path.join(DIR, f);
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  let changed = false;

  src = src.replace(/(interact:\s*\{)([\s\S]*?)(\n\s{4}\})/g, (whole, head, body, tail) => {
    if (!/\n\s{6}sort:\s*\{/.test(body)) return whole;
    const bins = [...body.matchAll(/\{[^{}]*?label:[^{}]*?\}/g)].map((m) => ({
      label: unesc((m[0].match(/label:\s*'((?:[^'\\]|\\.)*)'/) || [, ''])[1]),
      correct: /correct:\s*true/.test(m[0]),
    }));
    const right = bins.find((b) => b.correct);
    if (!right) return whole;
    const em = body.match(/explain:\s*'((?:[^'\\]|\\.)*)'/);
    if (!em) return whole;
    let e = unesc(em[1]);
    const before = e;

    // The opener: a position, replaced by the answer's own name.
    e = e.replace(
      /^The (?:far|near|middle|first|last|second|third)(?: (?:setting|slot|notch|stop|end))?\b/,
      cap(right.label),
    );
    // Mid-paragraph references to another slot, by ordinal.
    e = e.replace(/\bthe (first|second|third|fourth) (?:setting|slot|notch|stop)\b/gi, (m2, ord) => {
      const b = bins[ORD[ord.toLowerCase()]];
      return b ? `"${b.label}"` : m2;
    });
    // A bare "the first" / "the middle" used as a noun for a rival answer.
    e = e.replace(/\bThe first is\b/g, () => `"${bins[0].label}" is`);

    if (e === before) { left.push(`${f.replace('Script.ts', '')}: ${before.slice(0, 60)}`); return whole; }
    fixed++; changed = true;
    return head + body.replace(/explain:\s*'(?:[^'\\]|\\.)*'/, `explain: '${esc(e)}'`) + tail;
  });

  if (changed && !DRY) fs.writeFileSync(file, src, 'utf8');
}

console.log(`\n${fixed} sort explanation(s) ${DRY ? 'would be' : ''} rewritten to name the answer`);
if (left.length) {
  console.log(`\n${left.length} sort explanation(s) needed no change:`);
  for (const l of left.slice(0, 8)) console.log('  ' + l);
}
console.log('');
