// Assemble generated philosophers into expansion3.ts + expansion3-facts.ts.
//   node scripts/apply-philosophers.mjs <workflow-output.json>
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/apply-philosophers.mjs <output.json>'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const incoming = (data.result && data.result.philosophers) || [];

// Existing names across the catalog (philosopher objects have a `name:`).
const files = ['data/philosophers.ts', ...fs.readdirSync('data/extra-philosophers').filter((f) => f.endsWith('.ts')).map((f) => 'data/extra-philosophers/' + f)];
const existing = new Set();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/name:\s*["']([^"']+)["']/g)) existing.add(m[1].trim().toLowerCase());
}

const seenId = new Set(), seenName = new Set();
const kept = [], dropped = [];
for (const p of incoming) {
  if (!p || !p.id || !p.name || !Array.isArray(p.quotes) || !Array.isArray(p.facts)) { dropped.push(`${p && p.name} (incomplete)`); continue; }
  const nm = p.name.trim().toLowerCase();
  if (existing.has(nm)) { dropped.push(`${p.name} (already in catalog)`); continue; }
  if (seenId.has(p.id) || seenName.has(nm)) { dropped.push(`${p.name} (dup in batch)`); continue; }
  seenId.add(p.id); seenName.add(nm); kept.push(p);
}

const q = (s) => JSON.stringify(String(s)); // double-quoted, properly escaped

function obj(p) {
  const quotes = p.quotes.map((x) => `      { id: ${q(x.id)}, text: ${q(x.text)} }`).join(',\n');
  return `  {
    id: ${q(p.id)},
    name: ${q(p.name)},
    lifespan: ${q(p.lifespan)},
    era: ${q(p.era)},
    symbol: ${q(p.symbol)},
    oneLiner: ${q(p.oneLiner)},
    bio: ${q(p.bio)},
    areas: [${p.areas.map(q).join(', ')}],
    branchSlugs: [${p.branchSlugs.map(q).join(', ')}],
    quotes: [
${quotes},
    ],
    category: ${q(p.category)},
    country: ${q(p.country)},
  }`;
}

const philTs = `import type { Philosopher } from '../philosophers';

// Expansion 3: gap-filling additions — African/Africana, Latin American &
// decolonial, Islamic & Jewish, Indian, East Asian, more women across eras, and
// 20th–21st c. analytic & continental thinkers. De-duplicated against all
// existing entries; quotes reliably attributed; double-quoted to avoid escaping.
export const EXPANSION3_EXTRA: Philosopher[] = [
${kept.map(obj).join(',\n')},
];
`;
fs.writeFileSync('data/extra-philosophers/expansion3.ts', philTs);

const factsTs = `// "Did you know?" facts for the Expansion 3 philosophers. Exactly three per
// philosopher; keys match the ids in expansion3.ts.
export const EXPANSION3_FACTS: Record<string, string[]> = {
${kept.map((p) => `  ${q(p.id)}: [
${p.facts.map((f) => '    ' + q(f)).join(',\n')},
  ]`).join(',\n')},
};
`;
fs.writeFileSync('data/extra-philosophers/expansion3-facts.ts', factsTs);

console.log(JSON.stringify({ incoming: incoming.length, kept: kept.length, dropped, keptNames: kept.map((p) => p.name) }, null, 2));
