// check:dialogue — the rules a DIALOGUE lesson is held to (LESSON_RULES group AP).
//
//   npm run check:dialogue
//
// A dialogue lesson has no narrator under the stage: three stickmen speak, each in a
// voice locked to his costume (components/lesson/cinematic/cast.ts). The failures this
// format invites are all SILENT — a line read in the wrong voice, a top hat the
// wardrobe table quietly swapped for a fez, a thought bubble a generator dropped on a
// stage that already has three people talking — so each is a rule here:
//
//   AP1  every spoken beat names one speaker, from the cast
//   AP2  each figure wears its speaker's costume, forced in the scene with `wear=`
//        and marked `{/* cast: <speaker> */}`; every rendered line was recorded in
//        its speaker's voice, and no narrated line in a dialogue voice
//   AP6  no `order` control
//   AP8  no row in any table the narrated-lesson player layers read
//
// Which lessons are dialogue lessons comes from scripts/lib/dialogue.mjs, which reads
// it out of the scripts. DIALOGUE_ROOT points the whole check at another tree, which is
// how scripts/countertest-dialogue.mjs stages defects without touching this one.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, dialogueLessons, wiredLessons } from './lib/dialogue.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(path.join(REPO, 'package.json'))('typescript');
const { CAST, SPEAKERS, NARRATOR_VOICE } = await import(
  pathToFileURL(path.join(ROOT, 'components', 'lesson', 'cinematic', 'cast.ts')).href
);

const TABLES = ['lessonThoughts', 'lessonMarks', 'lessonWander', 'lessonChair', 'lessonVisitor', 'lessonWardrobe'];
const errs = [];
const fail = (rule, id, say) => errs.push(`${rule}  ${id}: ${say}`);

function beatsOf(file) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = {};
  new Function('exports', 'require', js)(mod, () => new Proxy({}, { get: () => () => ({}) }));
  if (!Array.isArray(mod.BEATS)) throw new Error(`${file}: no BEATS export`);
  return mod.BEATS;
}
// The same test narration.mjs uses: a teaching line, not a quote, question or summary.
const spoken = (b) => typeof b.text === 'string' && b.text.trim().length > 0
  && !b.quote && !b.interact && !b.summary && !b.tap && !b.mc;

const lessons = dialogueLessons();
const ids = new Set(lessons.map((l) => l.id));

for (const l of lessons) {
  const beats = beatsOf(l.scriptFile);
  const src = fs.readFileSync(l.scriptFile, 'utf8');

  // AP1 — one speaker a spoken beat, from the cast.
  const used = new Set();
  beats.forEach((b, i) => {
    if (!spoken(b)) return;
    if (!b.speaker) fail('AP1', l.id, `beat ${i} speaks ("${b.text.slice(0, 40)}…") and names no speaker`);
    else if (!SPEAKERS.includes(b.speaker)) fail('AP1', l.id, `beat ${i} names "${b.speaker}", who is not in the cast (${SPEAKERS.join(', ')})`);
    else used.add(b.speaker);
  });

  // AP6 — no ordering question.
  if (/\border\s*:\s*\{/.test(src)) fail('AP6', l.id, 'uses an `order` control; a dialogue lesson asks by tapping the stage');

  // AP2 — every figure is a cast member in that member's costume.
  if (!l.sceneFile) { fail('AP2', l.id, 'has no scene file to read the cast from'); continue; }
  const scene = fs.readFileSync(l.sceneFile, 'utf8');
  const figures = [...scene.matchAll(/<Stickman\b[\s\S]*?\/>/g)];
  const onStage = new Set();
  for (const f of figures) {
    const before = scene.slice(Math.max(0, f.index - 120), f.index);
    const mark = [...before.matchAll(/cast:\s*(\w+)/g)].pop();
    const lineOf = scene.slice(0, f.index).split('\n').length;
    if (!mark) { fail('AP2', l.id, `the <Stickman> at line ${lineOf} has no {/* cast: <speaker> */} marker`); continue; }
    const who = mark[1];
    if (!SPEAKERS.includes(who)) { fail('AP2', l.id, `line ${lineOf} is marked "${who}", who is not in the cast`); continue; }
    onStage.add(who);
    const wear = f[0].match(/\bwear=\{([^}]*)\}/);
    const want = CAST[who].costume;
    if (!wear) fail('AP2', l.id, `${who} (line ${lineOf}) takes his costume from the wardrobe table; force it with wear=`);
    else if (want === 'plain' ? wear[1].trim() !== '[]' : !new RegExp(`BY_ID\\.${want}\\.pieces`).test(wear[1])) {
      fail('AP2', l.id, `${who} (line ${lineOf}) must wear ${want === 'plain' ? 'nothing (wear={[]})' : `BY_ID.${want}.pieces`}, not ${wear[1].trim()}`);
    }
  }
  for (const who of used) if (!onStage.has(who)) fail('AP2', l.id, `${who} speaks but no figure on the stage is marked as ${who}`);

  // AP8 — none of the narrated-lesson layers has a row for it.
  for (const t of TABLES) {
    const file = path.join(ROOT, 'data', `${t}.ts`);
    if (!fs.existsSync(file)) continue;
    const esc = l.id.replace(/[-]/g, '\\-');
    if (new RegExp(`['"]${esc}['"]\\s*:`).test(fs.readFileSync(file, 'utf8'))) {
      fail('AP8', l.id, `has a row in data/${t}.ts; the generator that wrote it must skip dialogue lessons`);
    }
  }
}

// AP2 — the voice each installed take was rendered in.
const rendersFile = path.join(ROOT, 'assets', 'narration', 'renders.json');
if (fs.existsSync(rendersFile)) {
  const renders = JSON.parse(fs.readFileSync(rendersFile, 'utf8'));
  const beatsBy = new Map(lessons.map((l) => [l.id, beatsOf(l.scriptFile)]));
  for (const [key, rec] of Object.entries(renders)) {
    const [id, beat] = key.split('/');
    const i = Number(beat.replace('beat-', ''));
    if (ids.has(id)) {
      const b = beatsBy.get(id)[i];
      const want = b?.speaker ? CAST[b.speaker]?.voice.name : undefined;
      if (!rec.voice) fail('AP2', key, `was installed with no recorded voice; ${b?.speaker ?? 'its speaker'} speaks as ${want}`);
      else if (want && rec.voice !== want) fail('AP2', key, `was rendered as ${rec.voice}, but ${b.speaker} speaks as ${want}`);
    } else if (rec.voice && rec.voice !== NARRATOR_VOICE.name) {
      fail('AP2', key, `is a narrated line rendered as ${rec.voice}; narration is ${NARRATOR_VOICE.name}`);
    }
  }
}

const wired = wiredLessons().length;
if (errs.length) {
  console.log(`\ncheck:dialogue — ${errs.length} problem(s) in ${lessons.length} dialogue lesson(s)\n`);
  for (const e of errs) console.log(`  ${e}`);
  console.log('');
  process.exit(1);
}
console.log(`check:dialogue — ${lessons.length} dialogue lesson(s) of ${wired} wired: every line spoken by one cast member in his own voice and costume, no order control, no narrated-lesson layers`);
