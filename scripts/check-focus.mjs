// ─────────────────────────────────────────────────────────────────────────────
// THE MAXIM TABLE SAYS WHAT THE LESSON SAYS.
//
//   npm run check:focus
//
// `data/lessonFocus.ts` names one phrase per lesson to strike under the figure,
// and it is joined to the beat it belongs to by nothing but a string. That is a
// deliberate trade — see the header of that file for why the alternative costs a
// full re-measure of 186 lessons — and this is the other half of it.
//
// The failure it exists to prevent is silent in every other instrument: rewrite a
// beat and its maxim simply stops appearing. Nothing throws, nothing logs, the
// paragraph renders perfectly, and the one sentence the lesson wanted remembered
// is a sentence like any other. That is J9's stale "the trap is B" all over
// again, and J9 needed a reader to notice.
//
// Six rules, and every one of them was a real proposal that had to be rejected
// while the table was being written:
//
//   1. A LITERAL SUBSTRING of that beat's own text. Curly apostrophes count.
//   2. THE BEAT EXISTS, and the index is into the runtime BEATS array.
//   3. ONE PER LESSON — the table's shape gives that, so this only checks that
//      every id is a lesson that exists and is wired as cinematic.
//   4. NOT ON A QUESTION, A QUOTE OR THE SUMMARY. A quote is already struck, a
//      summary is already a list of points, and marking half a prompt tells the
//      reader which part of the question to answer.
//   5. FOUR TO FOURTEEN WORDS. Below four is not a claim; above fourteen is a
//      paragraph wearing a highlighter, which marks nothing.
//   6. NEVER OVER A PHILOSOPHER'S NAME. The name already carries its era colour
//      and its tap; a second mark on the same span is not more emphasis, it is a
//      collision of two meanings the reader has just been taught to tell apart.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { wiredLessons, scriptFor, readScript, decomment, beatsBody, beatChunks } from './lib/gestures.mjs';

const FOCUS = 'data/lessonFocus.ts';
const NAMES = 'data/lessonNames.ts';

const unquote = (raw) => raw
  .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');

const table = new Map();
for (const m of readScript(FOCUS).matchAll(
  /'([a-z0-9-]+)':\s*\{\s*beat:\s*(\d+),\s*phrase:\s*'((?:[^'\\]|\\.)*)',?\s*\}/g)) {
  table.set(m[1], { beat: Number(m[2]), phrase: unquote(m[3]) });
}

const names = new Map();
for (const m of readScript(NAMES).matchAll(/'([a-z0-9-]+)':\s*\[([\s\S]*?)\],\n/g)) {
  names.set(m[1], [...m[2].matchAll(/\['([^']+)',/g)].map((x) => x[1]));
}

const beatText = (chunk) => {
  const m = chunk.match(/\n {4}text:\s*'((?:[^'\\]|\\.)*)'/);
  return m ? unquote(m[1]) : null;
};

const wired = wiredLessons();
const bad = [];
let ok = 0;

for (const [id, f] of table) {
  const comp = wired.get(id);
  if (!comp) { bad.push([id, 'not a wired cinematic lesson']); continue; }
  const p = scriptFor(comp);
  if (!p) { bad.push([id, 'no script file']); continue; }
  const body = beatsBody(decomment(readScript(p)));
  if (!body) { bad.push([id, 'script has no BEATS array']); continue; }
  const chunks = beatChunks(body);

  if (f.beat < 0 || f.beat >= chunks.length) {
    bad.push([id, `beat ${f.beat} is out of range (${chunks.length} beats)`]);
    continue;
  }
  const chunk = chunks[f.beat];
  const held = /\n {4}(interact|quote|summary|tap):/.exec(chunk);
  if (held) { bad.push([id, `beat ${f.beat} carries a ${held[1]}`]); continue; }

  const text = beatText(chunk);
  if (!text) { bad.push([id, `beat ${f.beat} draws no narration`]); continue; }
  if (!text.includes(f.phrase)) {
    bad.push([id, `phrase is not in beat ${f.beat}\n      want: ${f.phrase}\n      beat: ${text}`]);
    continue;
  }

  const n = f.phrase.trim().split(/\s+/).length;
  if (n < 4 || n > 14) { bad.push([id, `${n} words — the mark must be 4 to 14`]); continue; }

  const hit = (names.get(id) ?? []).find((nm) => f.phrase.includes(nm));
  if (hit) { bad.push([id, `covers the name "${hit}", which already carries its own mark`]); continue; }

  ok++;
}

// A lesson with no maxim is not an error — see make-focus's floor — but the
// count is worth printing, because a table that quietly shrinks is the shape of
// rot this file exists to catch.
const cinematic = [...wired.keys()].filter((id) => scriptFor(wired.get(id)));
console.log(`check:focus — ${ok} of ${table.size} entries clean, across ${cinematic.length} cinematic lessons`);
console.log(`  ${cinematic.length - table.size} lessons carry no maxim`);

if (bad.length) {
  console.log(`\n${bad.length} BAD ENTR${bad.length === 1 ? 'Y' : 'IES'}:`);
  for (const [id, why] of bad) console.log(`  ${id}: ${why}`);
  process.exit(1);
}
if (!fs.existsSync(FOCUS)) process.exit(1);
