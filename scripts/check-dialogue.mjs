// check:dialogue — the rules a DIALOGUE lesson is held to (LESSON_RULES group AP).
//
//   npm run check:dialogue
//
// A dialogue lesson has no narrator under the stage: its stickmen speak, each in a
// voice locked to his costume (components/lesson/cinematic/cast.ts). The failures this
// format invites are all SILENT — a line read in the wrong voice, a top hat the
// wardrobe table quietly swapped for a fez, a thought bubble a generator dropped on a
// stage that already has people talking — so each is a rule here:
//
//   AP1  every spoken beat names one speaker, from the cast
//   AP2  each figure wears its speaker's costume, forced in the scene with `wear=`
//        and marked `{/* cast: <speaker> */}`; every rendered line was recorded in
//        its speaker's voice, and no narrated line in a dialogue voice
//   AP6  no `order` control
//   AP8  no row in any table the narrated-lesson player layers read
//   AP13 at least two speakers, and nobody staged who never speaks
//   AP14 every cast member has a trait and a character, and no two share one
//
// Which lessons are dialogue lessons comes from scripts/lib/dialogue.mjs, which reads
// it out of the scripts. DIALOGUE_ROOT points the whole check at another tree, which is
// how scripts/countertest-dialogue.mjs stages defects without touching this one.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, dialogueLessons, wiredLessons } from './lib/dialogue.mjs';
import { paceFault, sentencesOf } from './lib/prosody.mjs';

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

// AP2 + AP14 — THE CAST ITSELF. Each member is one voice, one costume and one
// character, and no two share any of the three: two people in one voice are one
// person to the ear, and two with one trait are one person to the script.
{
  const { BY_ID } = await import(pathToFileURL(path.join(ROOT, 'components', 'lesson', 'cinematic', 'wardrobe.ts')).href);
  const seen = { voice: new Map(), costume: new Map(), trait: new Map() };
  for (const who of SPEAKERS) {
    const m = CAST[who];
    if (!m) { fail('AP2', 'cast', `${who} is in SPEAKERS and has no entry in CAST`); continue; }
    if (!BY_ID[m.costume]) fail('AP2', 'cast', `${who} wears "${m.costume}", which is not a costume in wardrobe.ts`);
    if (!/^[a-z]{2}-[A-Z]{2}-Chirp3-HD-[A-Za-z]+$/.test(m.voice?.name ?? '')) fail('AP2', 'cast', `${who}'s voice "${m.voice?.name}" is not a Chirp 3 HD voice name`);
    else if (!m.voice.name.startsWith(`${m.voice.languageCode}-`)) fail('AP2', 'cast', `${who}'s voice ${m.voice.name} does not belong to its languageCode ${m.voice.languageCode}`);
    if (!m.trait) fail('AP14', 'cast', `${who} has no trait`);
    if (!m.character || m.character.length < 60) fail('AP14', 'cast', `${who} has no character a script could be written from`);
    for (const [k, v] of [['voice', m.voice?.name], ['costume', m.costume], ['trait', m.trait]]) {
      if (seen[k].has(v)) fail(k === 'trait' ? 'AP14' : 'AP2', 'cast', `${who} and ${seen[k].get(v)} share one ${k} (${v})`);
      else seen[k].set(v, who);
    }
  }
}

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

  // AP17 — HOW EACH LINE IS SPOKEN IS DECIDED BY WHAT IT SAYS. Every voiced line states
  // its pace, its pauses come from its punctuation and nothing else, and a lesson says its
  // idea slowly at least once without dragging everything: a lesson spoken all at one
  // speed is the flat read the owner rejected.
  {
    const paces = [];
    beats.forEach((b, i) => {
      if (!spoken(b)) return;
      const pf = paceFault(b.text, b.pace);
      if (pf) { fail('AP17', l.id, `beat ${i} ${pf}`); return; }
      if (b.markup !== undefined) fail('AP17', l.id, `beat ${i} carries a hand-written markup; a paced line takes its pauses from its punctuation (prosody.markupOf)`);
      const ps = sentencesOf(b.text, b.pace);
      for (const s of ps) paces.push(s.pace);
      if (!/[.!?…]["’”)]?$/.test(b.text.trim())) fail('AP17', l.id, `beat ${i} does not end on a full stop, question or exclamation mark, so the voice has no way to end it`);
    });
    const slow = paces.filter((p) => p === 'slow').length;
    if (paces.length && !slow) fail('AP17', l.id, 'says nothing slowly: the line that names or defines the lesson\'s idea is `slow`');
    if (paces.length && slow / paces.length > 0.6) fail('AP17', l.id, `says ${slow} of its ${paces.length} sentences slowly; slow is for the idea, and a lesson that drags everything drags`);
    if (paces.length >= 6 && new Set(paces).size < 2) fail('AP17', l.id, 'says every sentence at one pace');
  }

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

  // AP13 — the cast is as many as the lesson needs: at least two (one voice is a
  // narrator again), and nobody staged who never says a word — a silent fourth figure
  // is four people's worth of movement for three people's worth of lesson.
  if (used.size < 2) fail('AP13', l.id, `has ${used.size} speaker(s); a dialogue needs at least two`);
  for (const who of onStage) if (!used.has(who)) fail('AP13', l.id, `${who} is on the stage and never speaks; cast only who the lesson needs`);

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

// AP16 — THE STAGE ACTS FOR THE WHOLE LINE. A scene paces each beat's action over the
// seconds in its `LINES` table, copied from the manifest because a scene cannot import
// it. When a line is re-voiced it gets longer or shorter, and a table left behind has the
// picture finish while the voice is still talking — the owner's rule is that the stage
// keeps acting for the whole voiced line. So every voiced beat's pace covers its line.
{
  const manifestFile = path.join(ROOT, 'lib', 'narration', 'manifest.ts');
  if (fs.existsSync(manifestFile)) {
    const src = fs.readFileSync(manifestFile, 'utf8');
    for (const l of lessons) {
      if (!l.sceneFile) continue;
      const m = fs.readFileSync(l.sceneFile, 'utf8').match(/const LINES = \[([^\]]*)\];/);
      if (!m) { fail('AP16', l.id, 'its scene has no LINES table to pace each beat over its voiced line'); continue; }
      const lines = m[1].split(',').map((x) => Number(x.trim()));
      const at = src.indexOf(`"${l.id}": {`);
      if (at < 0) continue;
      const block = src.slice(at, src.indexOf('\n  },', at));
      for (const e of block.matchAll(/\n {4}(\d+): \{[\s\S]*?dur: ([\d.]+),/g)) {
        const i = Number(e[1]), dur = Number(e[2]);
        if (!(lines[i] >= dur - 0.05)) fail('AP16', l.id, `beat ${i}'s action is paced over ${lines[i] ?? 0}s and its voiced line runs ${dur}s: copy the line's length into LINES`);
      }
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
