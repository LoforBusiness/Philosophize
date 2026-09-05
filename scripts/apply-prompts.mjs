// Rewrite the prompts that named a control instead of asking a question.
//
//   node scripts/apply-prompts.mjs --dry
//
// Keyed on the EXACT old sentence, so an entry can only rewrite what it was
// written against — and anything left over is reported rather than guessed at.
import fs from 'node:fs';
import path from 'node:path';
import { PROMPT_COPY } from './lib/controlprompt.mjs';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
// The source stores prompts escaped for a single-quoted literal; the table holds
// them as they read. Unescape before looking one up or every prompt with an
// apostrophe in it silently misses.
const unesc = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

let done = 0;
const missed = new Set(Object.keys(PROMPT_COPY));

for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts'))) {
  const file = path.join(DIR, f);
  const id = f.replace('Script.ts', '');
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  let changed = false;

  src = src.replace(/prompt:\s*'((?:[^'\\]|\\.)*)'/g, (whole, raw) => {
    const key = `${id}#${unesc(raw)}`;
    const next = PROMPT_COPY[key];
    if (!next) return whole;
    missed.delete(key);
    done++; changed = true;
    return `prompt: '${esc(next)}'`;
  });

  if (changed && !DRY) fs.writeFileSync(file, src, 'utf8');
}

console.log(`\n${done} prompt(s) ${DRY ? 'would be' : ''} rewritten`);
if (missed.size) {
  console.log(`\n${missed.size} entr(y/ies) matched nothing:`);
  for (const k of missed) console.log('  ' + k);
}
console.log('');
