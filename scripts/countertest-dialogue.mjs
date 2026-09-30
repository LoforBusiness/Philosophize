// PUT EACH DIALOGUE-LESSON DEFECT BACK AND WATCH check:dialogue NAME IT.
//
//   node scripts/countertest-dialogue.mjs
//
// It builds a small fixture tree in a temp folder — a lesson route, one dialogue
// lesson's script and scene, the generated tables and a renders.json — points the
// checker at it with DIALOGUE_ROOT, and stages one defect at a time. The working tree
// is never edited (group AL's rule for counter-tests). Each defect must be caught by
// ITS OWN rule, and the clean fixture must pass: a counter-test in which every case
// fails for one shared reason proves nothing (LESSON_RULES AI, countertest-guide).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = path.join(REPO, 'scripts', 'check-dialogue.mjs');

const ROUTE_REL = path.join('app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx');
const CIN = path.join('components', 'lesson', 'cinematic');

const SCRIPT = `// Theme: a fixture.
import type { BaseBeat } from './cinematicKit';
export interface FixBeat extends BaseBeat { act?: number }
export const BEATS: FixBeat[] = [
  {
    speaker: 'plain',
    text: 'One note, and I want everything here.',
    act: 0,
    dur: 3,
  },
  {
    speaker: 'cap',
    text: 'Everyone does, mate.',
    act: 1,
    dur: 3,
  },
  {
    speaker: 'tophat',
    text: 'That gap is called scarcity.',
    act: 2,
    dur: 3,
  },
  {
    summary: { title: 'x', points: ['a'], closing: 'b' },
    dur: 3,
  },
];
`;

const SCENE = `export function FixScene() {
  return (
    <>
      {/* cast: tophat */}
      <Stickman D={A} k={K} wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={B} k={K} wear={BY_ID.stroller.pieces} />
      {/* cast: plain */}
      <Stickman D={C} k={K} wear={[]} />
    </>
  );
}
export function FixLesson() { return null; }
`;

const ROUTE = `import { FixLesson } from '@/components/lesson/cinematic/fixScene';
import { OldLesson } from '@/components/lesson/cinematic/oldScene';
export const CINEMATIC = {
  'econ-fixture-1': FixLesson,
  'old-fixture-1': OldLesson,
};
`;

const OLD_SCRIPT = `export const BEATS = [
  {
    text: 'A narrated line.',
    dur: 3,
  },
];
`;

const TABLES = ['lessonThoughts', 'lessonMarks', 'lessonWander', 'lessonChair', 'lessonVisitor', 'lessonWardrobe'];
const table = (name, rows = '') => `export const T_${name} = {\n  'old-fixture-1': {},\n${rows}};\n`;

const RENDERS = {
  'econ-fixture-1/beat-00': { text: 'One note, and I want everything here.', wav: 'x', voice: 'en-GB-Chirp3-HD-Sadachbia' },
  'econ-fixture-1/beat-01': { text: 'Everyone does, mate.', wav: 'x', voice: 'en-AU-Chirp3-HD-Zubenelgenubi' },
  'econ-fixture-1/beat-02': { text: 'That gap is called scarcity.', wav: 'x', voice: 'en-GB-Chirp3-HD-Algieba' },
  'old-fixture-1/beat-00': { text: 'A narrated line.', wav: 'x' },
};

function build(mut = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-dialogue-'));
  const w = (rel, body) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), body); };
  w(ROUTE_REL, ROUTE);
  w(path.join(CIN, 'fixScript.ts'), mut.script ?? SCRIPT);
  w(path.join(CIN, 'fixScene.tsx'), mut.scene ?? SCENE);
  w(path.join(CIN, 'oldScript.ts'), OLD_SCRIPT);
  w(path.join(CIN, 'oldScene.tsx'), 'export function OldLesson() { return null; }\n');
  fs.copyFileSync(path.join(REPO, CIN, 'cast.ts'), path.join(root, CIN, 'cast.ts'));
  for (const t of TABLES) w(path.join('data', `${t}.ts`), table(t, (mut.tables ?? {})[t] ?? ''));
  w(path.join('assets', 'narration', 'renders.json'), JSON.stringify(mut.renders ?? RENDERS, null, 2));
  return root;
}

function run(root) {
  const r = spawnSync(process.execPath, [CHECK], { env: { ...process.env, DIALOGUE_ROOT: root }, encoding: 'utf8' });
  fs.rmSync(root, { recursive: true, force: true });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

const CASES = [
  { name: 'a spoken beat with no speaker', rule: 'AP1', mut: { script: SCRIPT.replace("    speaker: 'cap',\n", '') } },
  { name: 'a speaker outside the cast', rule: 'AP1', mut: { script: SCRIPT.replace("speaker: 'cap'", "speaker: 'narrator'") } },
  { name: 'the top hat in the wrong costume', rule: 'AP2', mut: { scene: SCENE.replace('BY_ID.magistrate.pieces', 'BY_ID.dandy.pieces') } },
  { name: 'a figure left to the wardrobe table', rule: 'AP2', mut: { scene: SCENE.replace(' wear={BY_ID.stroller.pieces}', '') } },
  { name: 'a figure with no cast marker', rule: 'AP2', mut: { scene: SCENE.replace('{/* cast: plain */}', '') } },
  { name: 'an order control', rule: 'AP6', mut: { script: SCRIPT.replace('    act: 2,\n', "    act: 2,\n    interact: { prompt: 'p', explain: 'e', xp: 5, order: { items: ['a', 'b', 'c'] } },\n") } },
  { name: 'a thought bubble row', rule: 'AP8', mut: { tables: { lessonThoughts: "  'econ-fixture-1': { at: [] },\n" } } },
  { name: 'a wardrobe row', rule: 'AP8', mut: { tables: { lessonWardrobe: "  'econ-fixture-1': ['dandy', 'plain'],\n" } } },
  { name: 'a line in the wrong voice', rule: 'AP2', mut: { renders: { ...RENDERS, 'econ-fixture-1/beat-01': { ...RENDERS['econ-fixture-1/beat-01'], voice: 'en-GB-Chirp3-HD-Algieba' } } } },
  { name: 'a dialogue line with no recorded voice', rule: 'AP2', mut: { renders: { ...RENDERS, 'econ-fixture-1/beat-02': { text: 'That gap is called scarcity.', wav: 'x' } } } },
  { name: 'a narrated line in a dialogue voice', rule: 'AP2', mut: { renders: { ...RENDERS, 'old-fixture-1/beat-00': { ...RENDERS['old-fixture-1/beat-00'], voice: 'en-AU-Chirp3-HD-Zubenelgenubi' } } } },
];

let bad = 0;
const clean = run(build());
if (clean.code !== 0) { bad += 1; console.log(`FAIL  the clean fixture did not pass:\n${clean.out}`); }
else console.log('ok    the clean fixture passes');

for (const c of CASES) {
  const r = run(build(c.mut));
  const caught = r.code !== 0 && r.out.includes(c.rule);
  if (!caught) { bad += 1; console.log(`FAIL  ${c.name} — not caught by ${c.rule}\n${r.out}`); }
  else console.log(`ok    ${c.name} — caught by ${c.rule}`);
}

console.log(bad ? `\n${bad} counter-test(s) failed` : `\nall ${CASES.length} defects caught, clean fixture passes`);
process.exit(bad ? 1 : 0);
