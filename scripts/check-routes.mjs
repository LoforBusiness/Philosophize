// NO STRAY ROUTE MAY REACH A BUILD.
//
// The browser harnesses (§21) reach authenticated screens by writing a throwaway
// screen into app/ — and anything in app/ is a REAL ROUTE. Both `eas build` and
// `eas update` bundle the WORKING TREE, so a harness that was killed, or one left
// deliberately in place by SPOILER_KEEP=1, ships its scaffolding to users.
//
// That is not inert. previewcover.tsx forces:
//     useUserDataStore.setState({ _hasHydrated: true })
//     useUIStore.setState({ launchDone: true })
// so anyone reaching it gets a store claiming to be hydrated when it is not.
//
// ── TWO THINGS THIS LEARNED THE HARD WAY, BOTH ON THE SAME PUBLISH ───────────
//
// 1. GIT IS THE ORACLE, NOT A FILENAME PATTERN. The first version matched
//    /^preview.*\.tsx$/, which is exactly the set of names that had burned us so
//    far — and `app/recscene.tsx` had already been seen in a working tree that
//    week. A throwaway is not obliged to be called preview-anything. What every
//    one of them IS: untracked. A route that is not in git is not part of the
//    app, so that is what gets tested. Adding a genuinely new screen therefore
//    needs `git add` before the suite passes, which is a fair price and arguably
//    the right prompt.
//
// 2. THE VERDICT IS THE LAST LINE, ALWAYS. This check ran, failed, printed its
//    ✗ lines — and the publish went ahead anyway, because it had been invoked as
//    `node scripts/check-routes.mjs | tail -2 && eas update`. A pipe hands the
//    exit code to `tail`, which always succeeds, so the `&&` guarded nothing and
//    the visible tail was advice text that read like prose rather than a verdict.
//    Two dev routes shipped. Callers should gate on the exit code and never pipe
//    a check they are gating on — but a tool cannot rely on being used correctly,
//    so the last line it prints is now unambiguous however far it is truncated.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

let stray = [];
try {
  stray = execSync('git ls-files --others --exclude-standard app/', { encoding: 'utf8' })
    .split('\n').map((l) => l.trim()).filter(Boolean);
} catch {
  // No git, or app/ absent. Fall back to the old pattern rather than passing
  // blind — a check that cannot see is not a check that succeeded.
  stray = fs.existsSync('app')
    ? fs.readdirSync('app').filter((f) => /^preview.*\.tsx$/.test(f)).map((f) => `app/${f}`)
    : [];
}

console.log('\nNO STRAY ROUTES\n');

if (!stray.length) {
  console.log('  ok    every file in app/ is tracked — no harness scaffolding (§21)\n');
  console.log('all clear.');
  process.exit(0);
}

for (const f of stray) {
  let owner = 'unknown';
  try {
    const m = fs.readFileSync(f, 'utf8').slice(0, 200).match(/WRITTEN BY (\S+)/);
    if (m) owner = m[1];
  } catch { /* vanished between listing and reading */ }
  console.log(`  ✗ ${f}  — untracked, written by ${owner}`);
}
console.log(
  '\n  A file in app/ is a live route, and a build or an OTA bundles the working\n' +
  '  tree. Delete it, or let its harness finish — if none is running, the lock in\n' +
  '  scripts/.preview-*.lock is stale too. A genuinely new screen just needs\n' +
  '  `git add`.\n',
);
console.log(`FAILED — ${stray.length} stray route(s) in app/`);
process.exit(1);
