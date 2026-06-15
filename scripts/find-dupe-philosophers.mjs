// Find duplicate philosopher ids across the whole catalog, handling BOTH
// `id: "x"` and JSON-style `"id": "x"` key formats. A philosopher-level id is
// one immediately followed by a `name` key.
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const files = [
  'data/philosophers.ts',
  ...fs.readdirSync(path.join(cwd, 'data/extra-philosophers'))
    .filter((f) => f.endsWith('.ts') && !f.includes('-facts'))
    .map((f) => 'data/extra-philosophers/' + f),
];

const re = /["']?id["']?\s*:\s*["']([^"']+)["']\s*,\s*\n\s*["']?name["']?\s*:/g;
const seen = new Map(); // id -> [files]

for (const rel of files) {
  const s = fs.readFileSync(path.join(cwd, rel), 'utf8');
  for (const m of s.matchAll(re)) {
    if (!seen.has(m[1])) seen.set(m[1], []);
    seen.get(m[1]).push(rel);
  }
}

const dupes = [...seen.entries()].filter(([, fs_]) => fs_.length > 1);
console.log(`Total philosopher ids found: ${seen.size}`);
console.log(`Duplicates: ${dupes.length}`);
for (const [id, where] of dupes) console.log(`  - ${id}  →  ${where.join('  +  ')}`);
process.exit(dupes.length ? 1 : 0);
