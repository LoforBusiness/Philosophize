// Does the first-run update path do the one thing it must never get wrong?
//
//   node scripts/check-firstrun.mjs        (npm run check:firstrun)
//
// `lib/updates/firstRun.ts` is the code path EVERY cold start goes through, and
// a mistake in it is an app that does not open — the one bug an over-the-air
// update cannot repair. Its own header says so, and says the decision tree is
// injected "so the whole tree can be exercised in plain Node rather than hoped
// about". Nothing ever exercised it. For a year it was a claim of testability
// with no test, which is the shape this repo keeps finding (a budget nobody
// runs, a rule in no npm script, a stamp that hashes everything but the probe).
//
// So this RUNS it. The tree is pure and takes every effect as an argument, so
// the checker scripts an env, calls the real exported function, and reads what
// it actually did — which outcome, what it wrote, whether it restarted, and in
// what order. That is a different class of evidence from a regex over the
// source, and it is the only class that can speak for this file: there is no
// expo-updates on the web, so §21's browser is structurally blind here, and the
// only other instrument is uninstalling the app and reinstalling it.
//
//   §1  the four guards that must never fetch or restart;
//   §2  the loop guard spends its attempt BEFORE the work, not after;
//   §3  nothing to take — no restart;
//   §4  LATE MEANS NEXT TIME: past the budget it must not restart, and must
//       not leave the marker that would make the next launch think it had;
//   §5  and the deadline is read AFTER the download, because that is where the
//       time goes;
//   §6  the reload screen is the app's own, executed rather than asserted;
//   §7  the two things only the source can say, the hook being React.
//
// WHY §4 EXISTS. The budget used to release the launch screen and nothing more:
// the fetch carried on and called reload() whenever it landed. On a fresh
// install of build 21 that fetch pulls 87.8MB of narration the binary predates,
// so the restart arrived tens of seconds after the screen had lifted — on top of
// the welcome, or a lesson. A reader reported it as "a white screen for a long
// time", which is exactly what a restart looks like from outside.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const REPO = process.cwd();
const req = createRequire(import.meta.url);
const { transform } = req('sucrase');

// Absolute paths pass through, so FIRSTRUN_SRC can point at a damaged COPY in a
// scratch directory and the counter-test never has to touch the working tree.
const read = (p) => fs.readFileSync(path.isAbsolute(p) ? p : path.join(REPO, p), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

console.log('check-firstrun: the one path every cold start takes');

// ── loading the real module in plain Node ────────────────────────────────────
//
// The same CommonJS shim introtime.mjs uses, and it THROWS on an import it has
// not been taught about rather than handing back an empty object. A loader that
// quietly returns {} for a module it cannot find is how a checker ends up
// reporting on something it never loaded.
//
// Only `runFirstRunUpdate` and `RELOAD_SCREEN` are used here, and neither
// touches the three native modules — they exist to satisfy module scope. The
// launch art is NOT stubbed with invented values: the two colours are read out
// of the real file, because §6 is checking that the reload screen is the colour
// the app actually starts on, and inventing either end would prove nothing.
const SRC = process.env.FIRSTRUN_SRC || 'lib/updates/firstRun.ts';
const raw = read(SRC);
const artSrc = read('components/launch/launchArt.ts');
const artConst = (name) => {
  const m = artSrc.match(new RegExp(`export const ${name} = '(#[0-9A-Fa-f]{6})'`));
  if (!m) { ok(false, `launchArt declares ${name}`); return '#000000'; }
  return m[1];
};

const load = () => {
  const code = transform(raw, { transforms: ['typescript', 'imports'] }).code;
  const module = { exports: {} };
  const deps = {
    react: { useEffect() {}, useRef: () => ({ current: null }), useState: () => [false, () => {}] },
    '@react-native-async-storage/async-storage': {
      __esModule: true,
      default: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} },
    },
    'expo-updates': {
      isEnabled: false,
      isEmbeddedLaunch: false,
      checkForUpdateAsync: async () => ({ isAvailable: false }),
      fetchUpdateAsync: async () => ({ isNew: false }),
      reloadAsync: async () => {},
    },
    '@/components/launch/launchArt': { INK: artConst('INK'), SPLASH_BG: artConst('SPLASH_BG') },
  };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'require', code)(module, module.exports, (id) => {
    if (id in deps) return deps[id];
    throw new Error(`check-firstrun: firstRun.ts now imports "${id}" — teach this loader about it`);
  });
  return module.exports;
};

let mod;
try {
  mod = load();
  ok(typeof mod.runFirstRunUpdate === 'function', 'the decision tree loads and is callable');
} catch (e) {
  ok(false, 'the decision tree loads and is callable', String(e.message || e));
  console.log('\ncheck-firstrun: 1 FAILING');
  process.exit(1);
}

const { runFirstRunUpdate, RELOADED_KEY, TRIED_KEY, BUDGET_MS, RELOAD_SCREEN } = mod;

// A scripted environment. `order` is the transcript — it is what lets one
// assertion pin every sequencing rule in the file at once.
const envFor = (over = {}) => {
  const log = { store: new Map(), order: [], reloaded: false, reloadArgs: undefined };
  const env = {
    isEnabled: true,
    isEmbeddedLaunch: true,
    isFirstRun: true,
    getItem: async (k) => (log.store.has(k) ? log.store.get(k) : null),
    setItem: async (k, v) => { log.order.push(`set:${k}`); log.store.set(k, v); },
    checkForUpdate: async () => { log.order.push('check'); return { isAvailable: true }; },
    fetchUpdate: async () => { log.order.push('fetch'); return { isNew: true }; },
    reload: async (...a) => { log.order.push('reload'); log.reloaded = true; log.reloadArgs = a; },
    mayRestart: () => true,
    ...over,
  };
  return { env, log };
};

const run = async (over) => {
  const { env, log } = envFor(over);
  const outcome = await runFirstRunUpdate(env);
  return { outcome, log };
};

// ── 1 · the guards that must never fetch or restart ──────────────────────────
{
  console.log('\n  1 · nobody who should be left alone is touched');
  const cases = [
    ['disabled', { isEnabled: false }, 'web, Expo Go, a dev client'],
    ['not-embedded', { isEmbeddedLaunch: false }, 'already on a downloaded bundle'],
    ['not-first-run', { isFirstRun: false }, 'they have met the app before'],
  ];
  for (const [want, over, why] of cases) {
    const { outcome, log } = await run(over);
    ok(outcome === want && !log.reloaded && log.order.length === 0,
      `${why} → ${want}`, `got ${outcome}, ${log.order.length} effects`);
  }

  // THE LOOP GUARD. `isEmbeddedLaunch` is also true when a downloaded update
  // FAILED to launch and expo-updates rolled back to the embedded copy — which
  // is indistinguishable from a fresh install without this marker. Fetch,
  // reload, fall back, fetch again, for ever, on a device that never gets far
  // enough to accept a fix.
  const { env, log } = envFor();
  log.store.set(TRIED_KEY, '1');
  const outcome = await runFirstRunUpdate(env);
  ok(outcome === 'already-tried' && !log.reloaded,
    'a second attempt on one install → already-tried', `got ${outcome}`);
}

// ── 2 · the attempt is spent before the work ─────────────────────────────────
{
  console.log('\n  2 · a crash halfway still costs the one attempt');
  const { outcome, log } = await run({
    checkForUpdate: async () => { throw new Error('offline'); },
  });
  ok(outcome === 'error', 'a throw anywhere is swallowed', `got ${outcome}`);
  ok(log.store.get(TRIED_KEY) === '1', 'and the marker was already written', 'no boot loop');
  ok(!log.reloaded, 'and nothing restarted');
}

// ── 3 · nothing to take ──────────────────────────────────────────────────────
{
  console.log('\n  3 · nothing newer than us');
  const a = await run({ checkForUpdate: async () => ({ isAvailable: false }) });
  ok(a.outcome === 'no-update' && !a.log.reloaded, 'no update offered → no-update', `got ${a.outcome}`);
  const b = await run({ fetchUpdate: async () => ({ isNew: false }) });
  ok(b.outcome === 'no-update' && !b.log.reloaded, 'nothing new fetched → no-update', `got ${b.outcome}`);
}

// ── 4 · late means next time ─────────────────────────────────────────────────
{
  console.log('\n  4 · past the budget it must not restart — and must not pretend it did');
  const late = await run({ mayRestart: () => false });
  ok(late.outcome === 'too-late', 'a download that misses the budget → too-late', `got ${late.outcome}`);
  ok(!late.log.reloaded, 'it does not restart on top of the reader',
    'the launch screen stopped covering for it at BUDGET_MS');
  // BOTH HALVES, because the second is the one that is easy to leave out. That
  // key means "this process is the second boot of one cold start"; written
  // without a restart, the NEXT launch skips its animation to hide something
  // that never happened, and the reader gets no opening at all.
  ok(!late.log.store.has(RELOADED_KEY), 'and it leaves no marker claiming it did',
    `${RELOADED_KEY} unset`);

  const now = await run({ mayRestart: () => true });
  ok(now.outcome === 'reloading' && now.log.reloaded, 'inside the budget it does restart',
    `got ${now.outcome}`);
  // One assertion for every ordering rule in the file: the attempt is spent
  // first, the marker is written and awaited before the restart, and the
  // restart is last because after it there is no "after".
  ok(now.log.order.join(' → ') === `set:${TRIED_KEY} → check → fetch → set:${RELOADED_KEY} → reload`,
    'in exactly the order the file argues for', now.log.order.join(' → '));
}

// ── 5 · the deadline is read after the download ──────────────────────────────
{
  console.log('\n  5 · the guard is where the time actually goes');
  // The bug this pins is subtle and looks fixed from either side: a deadline
  // consulted BEFORE the fetch answers "yes, plenty of time" and then the fetch
  // takes forty seconds. So the env says yes until the download has happened
  // and no afterwards — the exact shape of a real slow first run.
  let downloaded = false;
  const { outcome, log } = await run({
    fetchUpdate: async () => { downloaded = true; return { isNew: true }; },
    mayRestart: () => !downloaded,
  });
  ok(outcome === 'too-late' && !log.reloaded,
    'a fetch that starts in time and ends late does not restart', `got ${outcome}`);
  // …and the bytes are still worth having: expo-updates launches the newest
  // ready bundle next cold start, so a late download is not a wasted one. Read
  // off the flag the stub sets rather than the transcript, since this case
  // supplies its own fetchUpdate and so does not write to it.
  ok(downloaded, 'but it is still fetched, for the next cold start');
}

// ── 6 · the reload screen is the app's own ───────────────────────────────────
{
  console.log('\n  6 · what the reader looks at while it restarts');
  const cfg = JSON.parse(read('app.json')).expo;
  const plug = (cfg.plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  const splash = plug?.[1]?.backgroundColor ?? null;
  ok(!!RELOAD_SCREEN, 'the module exports a reload screen at all',
    'expo-updates defaults to #ffffff with a #007aff spinner and no fade');
  // Executed, not asserted: RELOAD_SCREEN is built at module scope out of
  // launchArt's own constants, so this compares what the code produces against
  // what the binary is compiled with.
  ok(!!splash && String(RELOAD_SCREEN?.backgroundColor).toLowerCase() === splash.toLowerCase(),
    'it is the colour the app starts on, not a third constant',
    `reload ${RELOAD_SCREEN?.backgroundColor} · splash ${splash}`);
  ok(RELOAD_SCREEN?.fade === true, 'it fades out rather than cutting',
    'the native screen is held to RUN_JS_BUNDLE_END, which is before the first paint');
  const spin = RELOAD_SCREEN?.spinner ?? {};
  ok(spin.enabled === true, 'something on it moves',
    'the complaint was "not knowing what is going on", so a still page is the defect');
  ok(String(spin.color).toLowerCase() !== '#007aff',
    'and it is not expo-updates’ iOS blue', String(spin.color));
}

// ── 7 · the two things only the source can say ───────────────────────────────
{
  console.log('\n  7 · the hook, which is React and cannot be run here');
  const src = strip(raw);
  ok(/reloadAsync\(\{\s*reloadScreenOptions:/.test(src),
    'the hook passes the reload screen to reloadAsync',
    'declaring the options and not handing them over is the whole failure mode');

  // A WALL CLOCK, NOT THE FLAG. The obvious wiring is the `done` boolean the
  // timeout already sets — but the effect's cleanup clears that timeout, so on
  // unmount `done` stays false for ever and a download landing minutes later
  // reads as "inside the budget". A timestamp cannot be disarmed by anything.
  ok(/const deadline = Date\.now\(\) \+ BUDGET_MS;/.test(src)
    && /mayRestart: \(\) => Date\.now\(\) < deadline/.test(src),
    'and the deadline is a wall clock, not the flag a cleanup can clear',
    'clearTimeout must not be able to re-arm the restart');

  ok(typeof BUDGET_MS === 'number' && BUDGET_MS > 0 && BUDGET_MS <= 6000,
    'the budget is still a budget', `${BUDGET_MS}ms`);
}

console.log(bad ? `\ncheck-firstrun: ${bad} FAILING` : '\ncheck-firstrun: all green');
process.exit(bad ? 1 : 0);
