// Puts each defect check-guide exists to catch back into the tree, one at a time,
// runs the check, and restores the file byte for byte. A detector is only trusted
// once it has been seen to fail (CLAUDE.md §17, L8).
//
//   node scripts/countertest-guide.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const CASES = [
  {
    name: 'a click with no position read literally, as a tap at the left edge',
    file: 'components/lesson/cinematic/tapNav.ts',
    from: 'if (!(x > 0)) return \'forward\';',
    to: 'if (Number.isNaN(x)) return \'forward\';',
  },
  {
    name: 'the body disabled while a question is open, so back stops working there',
    file: 'components/lesson/cinematic/CinematicPlayer.tsx',
    from: '        style={styles.body}\n        onPress={onBody}',
    to: '        style={styles.body}\n        disabled={locked}\n        onPress={onBody}',
  },
  {
    name: 'an older player that forgot to keep its answers',
    file: 'components/lesson/cinematic/PremisesBuilderLesson.tsx',
    from: '    kept.current[i] = id;',
    to: '',
  },
  {
    name: 'a button role on the guide\'s tap-anywhere layer',
    file: 'components/lesson/cinematic/LessonGuide.tsx',
    from: '<Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)}>',
    to: '<Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} accessibilityRole="button">',
  },
  {
    name: 'the guide mounted by a harness route',
    file: 'scripts/measure-must.mjs',
    from: "import { claimRoute } from './lib/previewroute.mjs';",
    to: "import { claimRoute } from './lib/previewroute.mjs';\n// <LessonGuideHost>",
  },
];

let caught = 0;
for (const c of CASES) {
  const orig = fs.readFileSync(c.file, 'utf8');
  if (orig.split(c.from).length !== 2) throw new Error(`${c.name}: the anchor is not in ${c.file} exactly once`);
  const next = orig.replace(c.from, c.to);
  if (next === orig) throw new Error(`${c.name}: the mutation did not change the file`);
  fs.writeFileSync(c.file, next);
  let code = 0;
  try { execFileSync('node', ['scripts/check-guide.mjs'], { stdio: 'pipe' }); } catch (e) { code = e.status ?? 1; }
  fs.writeFileSync(c.file, orig);
  if (fs.readFileSync(c.file, 'utf8') !== orig) throw new Error(`${c.file} was not restored`);
  console.log(`  ${code ? 'caught ' : 'MISSED '} ${c.name}`);
  if (code) caught += 1;
}
let clean = 0;
try { execFileSync('node', ['scripts/check-guide.mjs'], { stdio: 'pipe' }); } catch (e) { clean = e.status ?? 1; }
console.log(`\n${caught} of ${CASES.length} defects caught; the clean tree ${clean ? 'FAILS' : 'passes'}.`);
process.exit(caught === CASES.length && !clean ? 0 : 1);
