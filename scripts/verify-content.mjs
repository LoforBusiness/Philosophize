// Post-build verification: path indexes wired to 30, philosopherId refs resolve,
// Expansion 4 wired + counted.
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const read = (p) => fs.readFileSync(path.join(cwd, p), 'utf8');
const fail = [];

// 1) Each path index imports lesson30 and includes it in the lessons array.
const indexes = [
  'data/branches/logic/paths/arguments/index.ts',
  'data/branches/ethics/paths/what-is-ethics/index.ts',
  'data/branches/epistemology/paths/what-is-knowledge/index.ts',
  'data/branches/metaphysics/paths/being-and-non-being/index.ts',
  'data/branches/political-philosophy/paths/what-is-political-philosophy/index.ts',
  'data/branches/aesthetics/paths/what-is-aesthetics/index.ts',
];
for (const idx of indexes) {
  const s = read(idx);
  const importsMax = Math.max(0, ...[...s.matchAll(/import lesson(\d+) from/g)].map((m) => +m[1]));
  const arr = (s.match(/lessons:\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const inArray = /\blesson30\b/.test(arr);
  if (importsMax < 30) fail.push(`${idx}: max import is lesson${importsMax} (need lesson30)`);
  if (!inArray) fail.push(`${idx}: lesson30 not in lessons[] array`);
}

// 2) Collect all philosopher ids in the catalog (id: directly followed by name:).
const catalogFiles = [
  'data/philosophers.ts',
  ...fs.readdirSync(path.join(cwd, 'data/extra-philosophers')).filter((f) => f.endsWith('.ts')).map((f) => 'data/extra-philosophers/' + f),
];
const ids = new Set();
// Match BOTH `id: "x"` and JSON-style `"id": "x"` keys (expansion.ts uses the
// quoted-key form), where the id is immediately followed by a `name` key.
const idRe = /["']?id["']?\s*:\s*["']([^"']+)["']\s*,\s*\n\s*["']?name["']?\s*:/g;
for (const f of catalogFiles) {
  const s = read(f);
  for (const m of s.matchAll(idRe)) ids.add(m[1]);
}

// 3) Every philosopherId referenced in a lesson must exist.
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}
const refs = new Map(); // id -> [files]
for (const f of walk(path.join(cwd, 'data/branches'))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/philosopherId:\s*["']([^"']+)["']/g)) {
    if (!refs.has(m[1])) refs.set(m[1], []);
    refs.get(m[1]).push(path.relative(cwd, f));
  }
}
const missing = [...refs.keys()].filter((id) => !ids.has(id));

// 4) Expansion 4 counts.
const exp4 = read('data/extra-philosophers/expansion4.ts');
const exp4Names = (exp4.match(/\bname:\s*["']/g) || []).length;
const exp4Facts = read('data/extra-philosophers/expansion4-facts.ts');
const exp4FactKeys = (exp4Facts.match(/^\s{2}["'][^"']+["']:\s*\[/gm) || []).length;
const wiredEntities = read('data/philosophers.ts').includes('...EXPANSION4_EXTRA');
const wiredFacts = read('data/philosopherFacts.ts').includes('...EXPANSION4_FACTS');

console.log(`Catalog philosopher ids: ${ids.size}`);
console.log(`Expansion 4: ${exp4Names} philosophers, ${exp4FactKeys} fact entries, wired entities=${wiredEntities}, wired facts=${wiredFacts}`);
console.log(`Distinct philosopherId refs in lessons: ${refs.size}`);
if (missing.length) {
  console.log(`\n⚠ philosopherId refs that DON'T resolve (dead links):`);
  for (const id of missing) console.log(`  - ${id}  (in ${refs.get(id).join(', ')})`);
} else {
  console.log(`All philosopherId refs resolve. ✓`);
}
if (!wiredEntities || !wiredFacts || exp4Names !== exp4FactKeys) fail.push('Expansion 4 wiring/count mismatch');

if (fail.length) { console.log('\n✗ FAILURES:\n  ' + fail.join('\n  ')); process.exit(1); }
console.log('\nIndex wiring + Expansion 4 OK. ✓');
