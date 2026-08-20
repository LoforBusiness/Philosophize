// NO PREVIEW ROUTE MAY REACH A BUILD.
//
// The browser harnesses (§21) reach authenticated screens by writing a throwaway
// screen into app/ — and anything in app/ is a REAL ROUTE. Both `eas build` and
// `eas update` bundle the WORKING TREE, so a harness that was killed, or one left
// deliberately in place by SPOILER_KEEP=1, ships its scaffolding to users.
//
// That is not inert. app/previewcover.tsx forces:
//     useUserDataStore.setState({ _hasHydrated: true })
//     useUIStore.setState({ launchDone: true })
// so anyone reaching /previewcover gets a store claiming to be hydrated when it
// is not, and no launch screen.
//
// This existed as a rule in CLAUDE.md §21 — "delete it before committing" — and a
// rule enforced by remembering is the same thing this repo already learned about
// check-moves: a budget nobody executes is not a budget. An orphaned route was
// found on disk twice in one afternoon, both times by hand.
import fs from 'node:fs';

const strays = fs.existsSync('app')
  ? fs.readdirSync('app').filter((f) => /^preview.*\.tsx$/.test(f))
  : [];

if (!strays.length) {
  console.log('\nNO PREVIEW ROUTES\n\n  ok    app/ holds no harness scaffolding (§21)\n\nall clear.');
  process.exit(0);
}

console.log('\nNO PREVIEW ROUTES\n');
for (const f of strays) {
  let owner = 'unknown';
  const head = fs.readFileSync(`app/${f}`, 'utf8').slice(0, 200);
  const m = head.match(/WRITTEN BY (\S+)/);
  if (m) owner = m[1];
  console.log(`  ✗ app/${f}  — written by ${owner}`);
}
console.log(
  '\n  A file in app/ is a live route, and a build or an OTA bundles the working\n' +
  '  tree. Delete it, or let its harness finish. If no harness is running, the\n' +
  '  lock in scripts/.preview-*.lock is stale too.\n',
);
process.exit(1);
