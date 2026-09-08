// WRITE THE MASCOT'S THOUGHTS INTO data/lessonThoughts.ts, SAFELY.
//
//   node scripts/say.mjs read <lesson-id> [...]     print the beats, to write against
//   node scripts/say.mjs set  <file.json>           merge { id: [ "…" | null, … ] }
//
// The words are AUTHORED and the placement is GENERATED, in one file — so a
// careless write costs a corpus of writing, which is the failure `make:wardrobe`
// records from the other side. This merges rather than rewrites: it only ever
// replaces the `say` array of the ids it is given, leaves every other lesson
// untouched, and refuses an array whose length does not match the lesson's beats.
//
// `read` prints what each beat SAYS and whether it is graded or a quote, because a
// thought has to be about the beat it sits on — the same reason `make:focus`
// re-derives every maxim against its own beat rather than trusting the table.
import fs from 'node:fs';
import { corpus } from './lib/gestures.mjs';

const OUT = 'data/lessonThoughts.ts';
const mode = process.argv[2];

if (mode === 'read') {
  const want = new Set(process.argv.slice(3));
  for (const l of corpus()) {
    if (!want.has(l.id)) continue;
    console.log(`\n=== ${l.id}  (${l.beats.length} beats) ===`);
    for (const [i, b] of l.beats.entries()) {
      const tag = b.graded ? 'Q' : b.quote ? '"' : ' ';
      console.log(`${String(i).padStart(2)} ${tag} ${(b.text || '').slice(0, 96)}`);
    }
  }
  process.exit(0);
}

if (mode !== 'set') { console.log('usage: say.mjs read <id>… | say.mjs set <file.json>'); process.exit(1); }

const batch = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const beatsOf = new Map(corpus().map((l) => [l.id, l.beats.length]));
let src = fs.readFileSync(OUT, 'utf8');
let n = 0;
for (const [id, say] of Object.entries(batch)) {
  const want = beatsOf.get(id);
  if (want === undefined) { console.log(`  ? ${id} is not a wired lesson — skipped`); continue; }
  if (say.length !== want) { console.log(`  ! ${id} has ${want} beats, given ${say.length} — skipped`); continue; }
  const body = say.map((s) => (s ? `'${String(s).replace(/'/g, "\\'")}'` : 'null')).join(', ');
  const re = new RegExp(`('${id}':\\s*\\{[\\s\\S]*?say:\\s*\\[)[\\s\\S]*?(\\],)`);
  if (!re.test(src)) { console.log(`  ! ${id} has no row in ${OUT} — run make:thoughts first`); continue; }
  src = src.replace(re, `$1${body}$2`);
  n += 1;
}
fs.writeFileSync(OUT, src);
console.log(`\nwrote ${n} lesson(s) into ${OUT}`);
console.log('now run: node scripts/make-thoughts.mjs   (the placement depends on the words)');
