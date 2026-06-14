// Apply generated lessons from a workflow output file into the curriculum.
//   node scripts/apply-lessons.mjs <workflow-output.json>
// Writes each lesson .ts into its lessons/ dir and rewires each path index.ts
// (appends imports + extends the lessons array). Prints a manifest + gaps.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/apply-lessons.mjs <output.json>'); process.exit(1); }
const root = process.cwd();
const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const built = (data.result && data.result.built) || [];

const stripFences = (s) => {
  let t = String(s).trim();
  if (t.startsWith('```')) t = t.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  return t.trim() + '\n';
};

// group by branch dir
const byDir = new Map();
const contractFalse = [];
for (const it of built) {
  if (!it || !it.dir || !it.slug || !it.fileContent) continue;
  const file = path.join(root, it.dir, `${it.slug}.ts`);
  fs.writeFileSync(file, stripFences(it.fileContent), 'utf8');
  if (!byDir.has(it.dir)) byDir.set(it.dir, []);
  byDir.get(it.dir).push({ n: it.n, slug: it.slug, title: it.title });
  if (it.contractOk === false) contractFalse.push(`${it.idPrefix}-${it.n} (${it.slug}): ${String(it.notes).slice(0, 160)}`);
}

const manifest = {};
const missing = {};
let wrote = 0;
for (const [dir, items] of byDir) {
  items.sort((a, b) => a.n - b.n);
  wrote += items.length;
  manifest[dir] = items.map((i) => `${i.n}:${i.slug}`);
  const ns = new Set(items.map((i) => i.n));
  const gap = [];
  for (let n = 11; n <= 20; n++) if (!ns.has(n)) gap.push(n);
  if (gap.length) missing[dir] = gap;

  // ── rewire the path index.ts ──
  const indexPath = path.join(root, dir.replace(/\/lessons$/, ''), 'index.ts');
  let src = fs.readFileSync(indexPath, 'utf8');
  if (src.includes('lesson11')) { continue; } // already wired; skip
  const importLines = items.map((i) => `import lesson${i.n} from './lessons/${i.slug}';`).join('\n');
  // insert after the last existing "import lesson" line
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (/^import lesson\d+ from/.test(lines[i])) lastImport = i;
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, importLines);
    src = lines.join('\n');
  }
  // extend the lessons array
  src = src.replace(/lessons:\s*\[([\s\S]*?)\]/, (m, inner) => {
    const add = items.map((i) => `lesson${i.n}`).join(', ');
    const base = inner.trim().replace(/,\s*$/, '');
    return `lessons: [${base}, ${add}]`;
  });
  fs.writeFileSync(indexPath, src, 'utf8');
}

console.log(JSON.stringify({ totalBuilt: built.length, wrote, manifest, missing, contractFalse }, null, 2));
