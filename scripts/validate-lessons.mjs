// Structural lesson-contract check (types can't enforce these).
// Scans every lesson .ts file and verifies: hook first, summary last, 4–10
// cards, >=1 question/dilemma, every multiple-choice has exactly one correct.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'data', 'branches');
const CARD_TYPES = ['hook', 'concept', 'example', 'question', 'reinforcement', 'summary', 'dilemma', 'quote'];
const cardRe = new RegExp(`type:\\s*['"](${CARD_TYPES.join('|')})['"]`, 'g');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const files = walk(ROOT).filter((f) => f.includes(`${path.sep}lessons${path.sep}`));
const problems = [];
let ok = 0;

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(process.cwd(), f);
  const cards = [...s.matchAll(cardRe)].map((m) => m[1]);
  const errs = [];

  if (cards.length < 4 || cards.length > 10) errs.push(`card count ${cards.length} (need 4–10)`);
  if (cards[0] !== 'hook') errs.push(`first card is '${cards[0]}' (need hook)`);
  if (cards[cards.length - 1] !== 'summary') errs.push(`last card is '${cards[cards.length - 1]}' (need summary)`);
  if (!cards.includes('question') && !cards.includes('dilemma')) errs.push('no question/dilemma card');

  // Every multiple-choice options[] block must have exactly one isCorrect: true.
  for (const m of s.matchAll(/options:\s*\[/g)) {
    // capture from this "options: [" to its matching closing bracket (naive depth scan)
    let i = m.index + m[0].length, depth = 1;
    while (i < s.length && depth > 0) {
      if (s[i] === '[') depth++;
      else if (s[i] === ']') depth--;
      i++;
    }
    const block = s.slice(m.index, i);
    const trues = (block.match(/isCorrect:\s*true/g) || []).length;
    const opts = (block.match(/isCorrect:\s*(true|false)/g) || []).length;
    if (opts >= 2 && trues !== 1) errs.push(`an MC block has ${trues} correct options (need exactly 1)`);
  }

  if (errs.length) problems.push(`✗ ${rel}\n    - ${errs.join('\n    - ')}`);
  else ok++;
}

console.log(`Checked ${files.length} lesson files: ${ok} OK, ${problems.length} with problems.`);
if (problems.length) {
  console.log('\n' + problems.join('\n'));
  process.exit(1);
}
