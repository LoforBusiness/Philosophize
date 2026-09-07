// EVERYTHING NEEDED TO REWRITE ONE LESSON'S NARRATION, WITHOUT OPENING A BROWSER.
//
//   node scripts/lesson-dossier.mjs <lessonKey> [<lessonKey> …]
//   node scripts/lesson-dossier.mjs --branch aesthetics
//
// A narration rewrite is cheap now (the must-stamp ignores prose) but it is not
// SAFE by default, because a beat's words are pinned to four things that live
// somewhere else:
//
//   A1   what the stage actually draws. Writing "a judge passes sentence" over a
//        scene that draws a slab and two pillars is the one unforgivable defect,
//        and it is invisible from the script alone. `mustBoxes.ts.json` already
//        records every word and box each beat puts on stage — so the stage's own
//        vocabulary is available offline, per beat, for nothing.
//   W2   the maxim in `data/lessonFocus.ts` is a VERBATIM substring of one beat.
//        Rewrite that beat carelessly and `check:focus` goes red. The discipline
//        this forces is a good one: the maxim is the best sentence in the lesson,
//        so it should survive the rewrite word for word.
//   W1   philosopher names are colour-marked off a GENERATED index. Dropping or
//        reshaping a name silently un-marks it until `make:names` is re-run.
//   H52  the beat count and the graded/quote/summary structure are checked.
//
// So this prints, per beat: the narration, the words the stage is showing at that
// moment, whether the beat carries the maxim (and what it is), which philosophers
// it names, and the beat's own kind. Rewrite against that, not against the script.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const focus = fs.readFileSync('data/lessonFocus.ts', 'utf8');
const route = fs.readFileSync(ROUTE, 'utf8');

/** lesson id → component stem, e.g. 'epistemology-knowledge-23' → 'epistemology23' */
const stems = new Map();
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[2].replace(/Lesson$/, '');
  stems.set(m[1], `${comp[0].toLowerCase()}${comp.slice(1)}`);
}
const byStem = new Map([...stems].map(([id, s]) => [s, id]));

/** Beats, with every field that matters, in order. */
function beatsOf(src) {
  const body = src.slice(src.indexOf('export const BEATS'));
  const out = [];
  let depth = 0; let start = -1;
  // THE ARRAY, NOT THE TYPE. `export const BEATS: Epi23Beat[] = [` puts a `[` in
  // the annotation first, and starting there hits its `]` at depth 0 and breaks
  // immediately — which reports every lesson as having 0 beats.
  const open = body.indexOf('= [') >= 0 ? body.indexOf('= [') + 2 : body.indexOf('[');
  for (let i = open; i < body.length; i += 1) {
    const c = body[i];
    if (c === '{') { if (!depth) start = i; depth += 1; }
    else if (c === '}') {
      depth -= 1;
      if (!depth && start >= 0) { out.push(body.slice(start, i + 1)); start = -1; }
    } else if (c === ']' && !depth) break;
  }
  return out;
}

const grab = (blk, key) => {
  const m = blk.match(new RegExp(`\\b${key}:\\s*(['"])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`));
  return m ? m[2].replace(/\\'/g, "'").replace(/\\n/g, ' ') : null;
};

const args = process.argv.slice(2);
let keys = args;
if (args[0] === '--branch') {
  keys = [...byStem.keys()].filter((s) => s.startsWith(args[1])).sort();
}

for (const key of keys) {
  const stem = byStem.has(key) ? key : stems.get(key);
  const id = byStem.get(stem) || key;
  const p = path.join(DIR, `${stem}Script.ts`);
  if (!fs.existsSync(p)) { console.log(`\n### ${key}  — NO SCRIPT (${p})`); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const blocks = beatsOf(src);

  const theme = (src.match(/^\/\/ Theme:\s*(.+)$/m) || [])[1] || '';
  const fm = focus.match(new RegExp(`'${id}':\\s*\\{ beat: (\\d+), phrase: '((?:\\\\.|[^'])*)' \\}`));
  const focusBeat = fm ? +fm[1] : -1;
  const focusPhrase = fm ? fm[2].replace(/\\'/g, "'") : null;

  console.log(`\n${'='.repeat(78)}\n### ${stem}   (${id})   ${blocks.length} beats`);
  if (theme) console.log(`THEME: ${theme}`);
  if (focusPhrase) console.log(`MAXIM (beat ${focusBeat}, must survive VERBATIM): "${focusPhrase}"`);

  const stageWords = side.words[id] || [];
  for (const [i, blk] of blocks.entries()) {
    const text = grab(blk, 'text');
    const cite = grab(blk, 'cite');
    const prompt = grab(blk, 'prompt');
    const quote = /quote:\s*\{/.test(blk);
    const kind = quote ? 'QUOTE' : prompt ? 'GRADED' : text ? 'beat' : '—';
    const onStage = (stageWords[i] || [])
      .filter((w) => w.k === 'text' && w.t)
      .map((w) => w.t.trim())
      .filter(Boolean);

    console.log(`\n [${i}] ${kind}${i === focusBeat ? '  ← carries the maxim' : ''}`);
    if (text) console.log(`   text  : ${text}`);
    if (cite) console.log(`   cite  : ${cite}`);
    if (prompt) console.log(`   prompt: ${prompt}`);
    console.log(`   STAGE : ${onStage.length ? onStage.join(' · ') : '(no words drawn)'}`);
  }
}
