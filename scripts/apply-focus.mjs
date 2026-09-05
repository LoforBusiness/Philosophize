// Write data/lessonFocus.ts from a reviewed TSV of picks (id, beat, phrase).
//
//   node scripts/apply-focus.mjs <picks.tsv>
//
// The picks are the human half of `make-focus` — read off its shortlist, one per
// lesson, with about half of them replaced by a better span from the same
// lesson. This only transcribes them; `check:focus` is what proves each phrase
// is really in the beat it claims.
import fs from 'node:fs';

const src = fs.readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
const OUT = 'data/lessonFocus.ts';
const head = fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n').split('export const LESSON_FOCUS')[0];

const lines = [];
for (const row of src.split('\n')) {
  if (!row.trim()) continue;
  const [id, beat, phrase] = row.split('\t');
  lines.push(`  '${id}': { beat: ${Number(beat)}, phrase: '${phrase.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}' },`);
}
fs.writeFileSync(OUT,
  `${head}export const LESSON_FOCUS: Record<string, LessonFocus> = {\n${lines.join('\n')}\n};\n`);
console.log(`${OUT}: ${lines.length} lessons`);
