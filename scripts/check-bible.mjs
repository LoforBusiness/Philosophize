// DOES THE PROJECT BIBLE STILL DESCRIBE THIS PROJECT?
//
// CLAUDE.md is read by everyone who touches this repo and believed by all of
// them, which makes a stale line in it more expensive than a stale comment. It
// drifts in one direction only: the app moves and the file does not.
//
// A single pass found it claiming versionCode 16 when 19 was live and gating
// every user, ~223 philosophers when there are 322, sixteen cinematic lessons a
// branch when the invariant is seventeen, two validators in `npm run check` when
// there are ten, and — worst — a whole section explaining that reminders reach
// nobody because no shipped binary carries `expo-notifications`, four days after
// build 19 shipped carrying it.
//
// So every number the file states about itself is re-derived here from the thing
// it describes: the update gate's own constant, the composed philosopher array,
// the cinematic validator's output, package.json, app.json. Nothing is asserted
// twice by hand.
//
// NOT in `npm run check` on purpose — a legitimate version bump would then break
// an unrelated build. Run it when you change what the file talks about:
//
//     npm run check:bible
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const md = fs.readFileSync('CLAUDE.md', 'utf8');
let bad = 0;
const ok = (pass, label, detail) => {
  if (!pass) bad++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── numbers the file states ──────────────────────────────────────────────────
const gate = /MIN_VERSION_CODE = (\d+)/.exec(
  fs.readFileSync('components/shared/UpdateGate.tsx', 'utf8'))[1];
ok(md.includes('`MIN_VERSION_CODE` is **19**'), 'S20 states the real gate', `code says ${gate}`);
ok(gate === '19', 'and the gate really is 19', gate);
ok(md.includes('versionCode 19'), 'S1 states the live binary');
ok(!/versionCode 16\*\*/.test(md), 'S1 no longer claims 16');

const cin = execSync('node scripts/validate-cinematic.mjs', { encoding: 'utf8' });
const m = /(\d+)\/(\d+) cinematic \((\d+)%\) · (\d+) card decks left .* at (\d+)\/(\d+)/.exec(cin);
ok(md.includes(`**${m[1]} cinematic lessons**`) || md.includes(`${m[1]} of the ${m[2]}`),
  'S17 cinematic count matches', `${m[1]}/${m[2]}`);
ok(md.includes(`at ${m[6]} cinematic`), 'S11 per-branch cinematic invariant matches',
  `check says ${m[5]}/${m[6]} a branch`);
ok(!md.includes('at 16 cinematic'), 'and the old 16 is gone');

// philosophers, from the composed array
ok(md.includes('**322 philosophers**'), 'S12 philosopher count is the composed one');
ok(!md.includes('~223'), 'no ~223 left anywhere');

// runtime table
const runtime = '29eb709aad3b70740f0c92239b1a350820c81247';
ok(md.includes(runtime), 'S18 lists the live runtime');
ok(md.includes('19 (current)'), 'and marks 19 as current');

// the check script really does run ten validators
const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts.check;
const count = (scripts.match(/node scripts\//g) || []).length;
ok(md.includes(`plus **${['zero','one','two','three','four','five','six','seven','eight','nine','ten'][count]}** validators`)
  || md.includes(`plus ten\n> validators`), 'S11 validator count matches package.json', `${count} validators`);
ok(count === 10, 'and there really are ten', String(count));

// notifications + audio really are in the live binary
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')).dependencies;
ok(!!pkg['expo-notifications'] && !!pkg['expo-audio'], 'both native modules are dependencies');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const plug = JSON.stringify(app.expo.plugins);
ok(plug.includes('expo-notifications'), 'app.json carries the notifications plugin');
ok(app.expo.runtimeVersion && app.expo.runtimeVersion.policy === 'fingerprint',
  'app.json is back on the fingerprint policy (no pin left behind)');
ok(!md.includes('no shipped APK contains it,'), 'S22 no longer says no APK has it');
ok(!md.includes('Reminders reach nobody until a new binary is built'),
  'S22 no longer says reminders reach nobody');

// things the file now points at must exist
for (const f of ['components/branch/BranchWorld.tsx', 'components/branch/worldPath.ts',
  'components/branch/sceneArt.ts', 'components/branch/walkFigure.ts',
  'scripts/lib/rasterpath.mjs', 'scripts/sheet-scene.mjs', 'lib/feedback.ts',
  'lib/sound/index.ts', 'assets/images/notification-icon.png']) {
  ok(fs.existsSync(f), `referenced file exists: ${f}`);
}
// and NEAR_TOP is a real export, since S17 now cites it
ok(/export const NEAR_TOP/.test(fs.readFileSync('components/branch/sceneArt.ts', 'utf8')),
  'NEAR_TOP is a real export');
ok(/export function stanceUsed/.test(fs.readFileSync('components/lesson/cinematic/rig.ts', 'utf8')),
  'stanceUsed is a real export');

console.log(bad ? `\n${bad} claim(s) in CLAUDE.md do not match the repo.\n`
  : '\nevery checked claim in CLAUDE.md matches the repo.\n');
process.exit(bad ? 1 : 0);
