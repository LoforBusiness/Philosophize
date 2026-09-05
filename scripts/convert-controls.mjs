// ─────────────────────────────────────────────────────────────────────────────
// THE PAD BECOMES A BALLOT, AND THE LEVER BECOMES A PLACE TO PUT SOMETHING.
//
//   node scripts/convert-controls.mjs --dry
//   node scripts/convert-controls.mjs
//
// STRUCTURE ONLY. This moves `field` → `poll` and `lever` → `sort`, carrying every
// `reads` string across verbatim and never inventing one. The COPY that each new
// control needs — a poll's `holders`, a sort's `chip` and bin `label`s, and every
// rewritten prompt — is authored in `scripts/lib/controlcopy.mjs` and applied
// from there, so nothing in this file is guessing at content.
//
// A beat whose copy has not been authored yet is LEFT ALONE and reported. That is
// deliberate: a half-converted question renders a control with no labels on it,
// which is worse than the control it replaced.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { POLL_COPY, SORT_COPY } from './lib/controlcopy.mjs';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');

/** Every `{ ... }` item in a block that carries a `reads:`, in source order. */
function items(block) {
  return [...block.matchAll(/\{[^{}]*?reads:[^{}]*?\}/g)].map((m) => {
    const src = m[0];
    return {
      id: (src.match(/id:\s*'((?:[^'\\]|\\.)*)'/) || [, ''])[1],
      reads: (src.match(/reads:\s*'((?:[^'\\]|\\.)*)'/) || [, ''])[1],
      correct: /correct:\s*true/.test(src),
    };
  });
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let converted = 0, skipped = [], touched = new Set();

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts'))) {
  const file = path.join(DIR, f);
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const id = f.replace('Script.ts', '');
  let changed = false;

  // Each interact block is handled whole, so the prompt and the control are
  // rewritten together and can never disagree about what is being asked.
  src = src.replace(/(interact:\s*\{)([\s\S]*?)(\n\s{4}\})/g, (whole, head, body, tail) => {
    const isField = /\n\s{6}field:\s*\{/.test(body);
    const isLever = /\n\s{6}lever:\s*\{/.test(body);
    if (!isField && !isLever) return whole;

    const kind = isField ? 'field' : 'lever';
    const blockRe = new RegExp(`\\n\\s{6}${kind}:\\s*\\{[\\s\\S]*?\\n\\s{6}\\},`);
    const bm = body.match(blockRe);
    if (!bm) return whole;
    const opts = items(bm[0]);
    if (!opts.length) return whole;

    const key = `${id}#${opts[0].reads}`;
    const copy = (isField ? POLL_COPY : SORT_COPY)[key];
    if (!copy) { skipped.push(`${kind} ${id}: ${opts[0].reads.slice(0, 46)}`); return whole; }

    let replacement;
    if (isField) {
      const rows = opts.map((o) => {
        const holders = copy.holders && copy.holders[o.id];
        const h = holders ? `, holders: [${holders.map((x) => `'${esc(x)}'`).join(', ')}]` : '';
        return `          { id: '${esc(o.id)}', reads: '${esc(o.reads)}'${h}${o.correct ? ', correct: true' : ''} },`;
      }).join('\n');
      replacement = `\n      poll: {\n        options: [\n${rows}\n        ],\n      },`;
    } else {
      const rows = opts.map((o) => {
        const label = copy.labels[o.id];
        if (!label) return null;
        return `          { id: '${esc(o.id)}', label: '${esc(label)}', reads: '${esc(o.reads)}'${o.correct ? ', correct: true' : ''} },`;
      });
      if (rows.some((r) => r === null)) { skipped.push(`${kind} ${id}: a bin has no label`); return whole; }
      replacement = `\n      sort: {\n        chip: '${esc(copy.chip)}',\n        bins: [\n${rows.join('\n')}\n        ],\n      },`;
    }

    let next = body.replace(blockRe, replacement);
    // The prompt is rewritten in the same pass. A control that stopped naming
    // itself while the prompt still said "set the lever" would be worse than
    // either alone.
    next = next.replace(/prompt:\s*'(?:[^'\\]|\\.)*'/, `prompt: '${esc(copy.prompt)}'`);
    converted++; changed = true; touched.add(f);
    return head + next + tail;
  });

  if (changed && !DRY) fs.writeFileSync(file, src, 'utf8');
}

console.log(`\n${converted} question(s) ${DRY ? 'would convert' : 'converted'} across ${touched.size} lesson(s)`);
if (skipped.length) {
  console.log(`\n${skipped.length} left alone — no authored copy yet:`);
  for (const s of skipped) console.log('  ' + s);
}
console.log('');
