// DOES THE PROJECT BIBLE STILL DESCRIBE THIS PROJECT?
//
// CLAUDE.md is read by everyone who touches this repo and believed by all of
// them, which makes a stale line in it more expensive than a stale comment. It
// drifts in one direction only: the app moves and the file does not.
//
// A single pass found it claiming versionCode 16 when 19 was live and gating
// every user, ~223 philosophers when there are 322, sixteen cinematic lessons a
// branch when the invariant is seventeen, two validators in `npm run check` when
// there are eleven, and — worst — a whole section explaining that reminders reach
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
//
// DERIVED FROM THE GATE, NOT TYPED IN AGAIN. These four claims used to carry
// their own copy of the version — `is **19**`, `gate === '19'`, `versionCode 19`,
// `19 (current)` — written when 19 was the live build. Build 20 shipped, the gate
// was raised, CLAUDE.md was updated correctly, and THIS FILE started reporting the
// bible as wrong about four things it had right. A checker that hard-codes the
// number it is checking is not a check, it is a second copy of the fact, and it
// rots the same way the first one does. Worse: `gate === '19'` asserted a
// CONSTANT, so raising the gate could only ever fail it.
//
// `MIN_VERSION_CODE` is the one shipping version this repo holds on disk (the
// versionCode itself lives on EAS, `appVersionSource: remote`), so everything
// hangs off it. Raise the gate and this names the sections that have not caught up.
const gate = /MIN_VERSION_CODE = (\d+)/.exec(
  fs.readFileSync('components/shared/UpdateGate.tsx', 'utf8'))[1];
ok(md.includes(`\`MIN_VERSION_CODE\` is **${gate}**`), 'S20 states the real gate', `code says ${gate}`);
// THE GATE IS A FLOOR, NOT THE CURRENT BUILD — and it stopped being both at 21.
//
// Every build up to 20 raised the gate to itself, so "current === gate" held by
// accident and this asserted it directly. Build 21 shipped with the gate
// deliberately left at 20 (§20: a wall aimed at a release still rolling out points
// at a version nobody can download), and three checks here failed on a file that
// was right. A check that fails when the project does the correct thing teaches
// people to ignore it, which is worse than not having it.
//
// What must actually hold is that the current binary is at or above the gate.
const current = /Current binary is \*\*versionCode (\d+)\*\*/.exec(md)?.[1];
ok(current && +current >= +gate, 'S1 states a live binary at or above the gate',
  current ? `binary ${current}, gate ${gate}` : 'S1 does not state a versionCode');
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
// A SUPERSEDED NUMBER MAY STILL APPEAR — this file keeps "it used to say X, it is
// now Y" notes deliberately, and they are worth more than the correction alone.
// So the rule is not "never mention 223", it is "never mention it ALONE": every
// occurrence must sit within sight of the number that replaced it. The first
// version of this check banned the string outright and immediately failed on the
// paragraph explaining why the string was wrong.
const stale = [...md.matchAll(/~223/g)].filter((m) => {
  const around = md.slice(Math.max(0, m.index - 240), m.index + 240);
  return !around.includes('322');
});
ok(stale.length === 0, 'no bare ~223 left — only ones shown against 322',
  stale.length ? `${stale.length} unqualified` : `${[...md.matchAll(/~223/g)].length} mention(s), all comparative`);

// ── the runtime table ────────────────────────────────────────────────────────
//
// Also derived. This used to hard-code build 19's runtime hash and the string
// `19 (current)`, so the table it was guarding could be perfectly right and still
// fail. What actually has to hold is a RELATION, and it is one worth enforcing:
// the build the table calls current must be the build the gate lets in, and that
// row must carry a real fingerprint — because §18's whole warning is that
// publishing to a runtime nobody is on reaches nobody, silently.
ok(md.includes(`${current} (current)`), 'S18 marks the newest build as current',
  `binary is ${current}`);

// AND EVERY REACHABLE RUNTIME MUST BE IN THE TABLE WITH A REAL FINGERPRINT.
//
// This is the check that earns its place. The gate is a floor, so every build from
// the gate upward can still open the app and still needs every update — and §18's
// whole warning is that publishing to a runtime nobody is on reaches nobody,
// silently. The mirror of that, new at 21, is FORGETTING one: an OTA sent only to
// the newest runtime reaches only the people who already updated, and it fails
// just as loudly, which is to say not at all.
const missing = [];
for (let v = +gate; v <= +current; v++) {
  const line = md.split('\n').find((l) => l.includes('**' + v + '**') || l.includes('**' + v + ' (current)**'));
  if (!line || !/`[0-9a-f]{40}`/.test(line)) missing.push(v);
}
ok(missing.length === 0, 'and every runtime at or above the gate has a fingerprint',
  missing.length ? `build ${missing.join(', ')} has no 40-hex runtime row`
                 : `${+current - +gate + 1} reachable runtime(s) listed`);

// ── every validator in `npm run check` must be NAMED in the file ─────────────
//
// Counting them was the first attempt and it was too weak by half: it went stale
// within the hour, when a `check-camera` was added in another working copy and
// "ten" quietly became eleven. Naming them is self-maintaining — add a validator
// and this says which one the file has not heard of.
const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts.check;
// NOT /node scripts\/…/ — that anchor silently lost a validator.
//
// `check-mentions` is invoked as `node --import ./scripts/lib/register.mjs
// scripts/check-mentions.mjs`, so the token before its path is the register
// shim, not `node`. The old pattern therefore never saw it: it counted 22 where
// the script runs 23, and — worse than the count — it excluded check-mentions
// from the "is it named in CLAUDE.md" test, so the one validator this check
// could not see was also the one it could never hold the file to.
//
// Matching the path alone is safe: `[\w-]+` cannot cross a `/`, so
// `./scripts/lib/register.mjs` does not match and the shim is not mistaken for
// a validator.
const validators = [...scripts.matchAll(/scripts\/([\w-]+)\.mjs/g)].map((m) => m[1]);
const unlisted = validators.filter((v) => !md.includes(v));
ok(unlisted.length === 0, 'S11 names every validator in `npm run check`',
  unlisted.length ? `missing: ${unlisted.join(', ')}` : `all ${validators.length}`);
// THIS ARRAY RAN OUT, AND A CHECK THAT RUNS OUT REPORTS A PASS IT CANNOT MAKE.
//
// It stopped at 'fifteen'. The suite passed fifteen validators a long time ago,
// so `WORDS[validators.length]` has been `undefined` ever since — and
// `md.includes('**undefined** validators')` is false for every possible file, so
// this assertion could not be satisfied by any wording of CLAUDE.md at all. It
// reported `22 = undefined`, which is the shape of a checker failing rather than
// a claim being wrong, and the fix belonged here rather than in the prose.
//
// Extended well past the current count so the next validator does not re-break
// it. Anything above the end of this list is still caught, but as an explicit
// "extend WORDS" rather than as a mystery mismatch.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two',
  'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven',
  'twenty-eight', 'twenty-nine', 'thirty', 'thirty-one', 'thirty-two'];
if (!WORDS[validators.length]) {
  console.log(`  FAIL  WORDS has no entry for ${validators.length} — extend it in this file`);
}
ok(md.includes(`**${WORDS[validators.length]}** validators`),
  'and states how many there are', `${validators.length} = ${WORDS[validators.length]}`);
// They must also all exist — a script named in `check` but missing breaks the
// build for everyone, and it is a one-line typo away.
const ghosts = validators.filter((v) => !fs.existsSync(`scripts/${v}.mjs`));
ok(ghosts.length === 0, 'and every one of them exists', ghosts.join(', ') || 'all present');

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
// The tech-stack table is its own claim and drifts separately from the prose —
// this row said "absent from every shipped binary" for a whole pass after S22
// had been corrected, because nothing tied the two together.
ok(!/expo-notifications \| ~56 \|.*absent from every shipped binary/.test(md),
  'S2 reminders row agrees with S22');
ok(/expo-audio/.test(md), 'S2 lists the audio dependency at all');

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
