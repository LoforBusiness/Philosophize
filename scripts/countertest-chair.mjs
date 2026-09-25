// PUT EACH DEFECT BACK AND WATCH `check:chair` CATCH IT — on a COPY, never the tree.
//
//   node scripts/countertest-chair.mjs
//
// The four routine files are copied to a temp directory and the defect is staged
// there; `CHAIR_SRC` points the checker at the copy, and `CHAIR_TABLE` at a staged
// copy of the table. Another session is usually working in this repo, and a
// mutate-then-revert counter-test is a window in which their build takes the defect
// (group AL's rule).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SRC = 'components/lesson/cinematic';
const FILES = ['rig.ts', 'lawnChair.ts', 'chairRoutine.ts', 'chairPlay.ts'];
const TABLE = fs.readFileSync('data/lessonChair.ts', 'utf8');

function stage(name, edit = {}, table = null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ct-chair-${name}-`));
  for (const f of FILES) {
    let s = fs.readFileSync(path.join(SRC, f), 'utf8');
    if (edit[f]) {
      const next = edit[f](s);
      // A COUNTER-TEST MUST ASSERT ITS OWN MUTATION CHANGED THE FILE (CLAUDE.md §17):
      // a no-op scores as the check being blind.
      if (next === s) throw new Error(`${name}: the staged edit to ${f} changed nothing`);
      s = next;
    }
    fs.writeFileSync(path.join(dir, f), s);
  }
  const env = { ...process.env, CHAIR_SRC: dir };
  if (table) {
    const t = path.join(dir, 'lessonChair.ts');
    const next = table(TABLE);
    if (next === TABLE) throw new Error(`${name}: the staged table edit changed nothing`);
    fs.writeFileSync(t, next);
    env.CHAIR_TABLE = t;
  } else env.CHAIR_TABLE = path.resolve('data/lessonChair.ts');
  const r = spawnSync('node', ['scripts/check-chair.mjs'], { env, encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

const CASES = [
  { name: 'clean', want: 0 },
  {
    name: 'the arm crosses at shoulder height again', want: '§5',
    edit: {
      'chairRoutine.ts': (s) => s.replace('const ARM_DIP = 10;', 'const ARM_DIP = 0;')
        .replace('const SHOULDER_CLEAR = 16;', 'const SHOULDER_CLEAR = 0.5;'),
    },
  },
  {
    name: 'a tap hurries the routine at 4x', want: '§5',
    edit: { 'chairPlay.ts': (s) => s.replace('export const HURRY = 1.8;', 'export const HURRY = 4;') },
  },
  {
    name: 'the chair is held further out', want: '§4',
    edit: { 'chairRoutine.ts': (s) => s.replace('lerp(HELD_OFF.x, 22, flick)', 'lerp(HELD_OFF.x, 40, flick)') },
  },
  {
    name: 'a sip with no mug in hand', want: '§1',
    table: (t) => t.replace(/('logic-arguments-14': \[2, 10, 0, 0, 2, )3(, 0, 0,)/, '$14$2'),
  },
  {
    name: 'a chair in the lesson straight after a chair', want: '§2',
    table: (t) => t.replace(/  'logic-arguments-8': \[9, 12, 0, 0\],/,
      "  'logic-arguments-8': [9, 10, 0, 0, 9, 3, 0, 0, 10, 11, 0, 0],"),
  },
];

let bad = 0;
for (const c of CASES) {
  const r = stage(c.name, c.edit, c.table);
  const ok = c.want === 0 ? r.code === 0 : r.code !== 0 && r.out.includes(`✗ ${c.want}`);
  if (!ok) bad += 1;
  console.log(`${ok ? '  ok ' : '  ✗  '} ${c.name} — ${c.want === 0 ? 'stays silent' : `caught by ${c.want}`}${ok ? '' : `\n${r.out.split('\n').slice(-6).join('\n')}`}`);
}
process.exit(bad ? 1 : 0);
