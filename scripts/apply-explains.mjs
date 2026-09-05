// Rewrite the explanations that named a control that no longer exists (J9).
//
//   node scripts/apply-explains.mjs --dry
//
// Keyed on `<lesson>#<first option's reads>`, the same question identity
// `convert-controls` uses, so an entry cannot drift onto a different question.
import fs from 'node:fs';
import path from 'node:path';
import { EXPLAIN_COPY } from './lib/controlexplain.mjs';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let done = 0;
const missed = new Set(Object.keys(EXPLAIN_COPY));

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts'))) {
  const file = path.join(DIR, f);
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const id = f.replace('Script.ts', '');
  let changed = false;

  src = src.replace(/(interact:\s*\{)([\s\S]*?)(\n\s{4}\})/g, (whole, head, body, tail) => {
    const first = body.match(/\{[^{}]*?reads:\s*'((?:[^'\\]|\\.)*)'[^{}]*?\}/);
    if (!first) return whole;
    const key = `${id}#${first[1]}`;
    const next = EXPLAIN_COPY[key];
    if (!next) return whole;
    missed.delete(key);
    const rewritten = body.replace(/explain:\s*'(?:[^'\\]|\\.)*'/, `explain: '${esc(next)}'`);
    if (rewritten === body) return whole;
    done++; changed = true;
    return head + rewritten + tail;
  });

  if (changed && !DRY) fs.writeFileSync(file, src, 'utf8');
}

console.log(`\n${done} explanation(s) ${DRY ? 'would be' : ''} rewritten`);
if (missed.size) {
  console.log(`\n${missed.size} entry matched nothing — the key is wrong, or the question moved:`);
  for (const k of missed) console.log('  ' + k);
}
console.log('');
