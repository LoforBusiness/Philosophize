// ONE LOCK FOR EVERY HARNESS THAT WRITES A ROUTE INTO app/.
//
// Five scripts drive the real app in a browser — measure-must, check-frame,
// check-spoiler, check-cover and check-readable — and each does it by writing a screen
// into app/, because that is the only way to reach an authenticated screen by
// URL (§21). They shared a Metro, a Chrome, and — fatally — a filename:
// check-frame and check-spoiler both write app/previewframe.tsx, and only
// measure-must ever took a lock. Two of them together means one deletes the
// other's route mid-sweep, and the victim reports lesson after lesson as
// NEVER RENDERED A STAGE while every symptom points at the app.
//
// The lock is PER ROUTE, not per repo, because two harnesses on two different
// routes are genuinely independent and serialising them would cost hours for
// nothing. It is created with the 'wx' flag, which is the only atomic
// create-if-absent primitive available here — two scripts starting in the same
// millisecond cannot both win.
//
// A DEAD OWNER IS NOT AN OWNER. Stopping a background task does not always kill
// the node process under it, so a lock whose pid has gone is taken over rather
// than obeyed — otherwise one crashed sweep blocks the harness until somebody
// notices a file nobody knows about. Taking over also removes the route the dead
// run left behind, which is the thing that would otherwise get SHIPPED: an
// orphaned app/previewcover.tsx is a live route that sets _hasHydrated and
// launchDone, so the app lies to itself about its own state.
import fs from 'node:fs';
import path from 'node:path';

const alive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};

/**
 * Take the route, write it if absent, and clean up on the way out however the
 * process ends. Returns { release, createdHere }.
 *
 * `keep` honours the harnesses' own escape hatch (SPOILER_KEEP=1): creating the
 * file is the slow half, because Metro rebuilds its route table for a NEW file
 * and a sweep that starts before that lands gets "This screen doesn't exist" for
 * every lesson. Keeping it between runs is a real saving while iterating — and
 * check-routes.mjs is what stops a kept route reaching a build.
 */
export function claimRoute({ route, src, owner, keep = false }) {
  const lock = path.join('scripts', `.preview-${path.basename(route, '.tsx')}.lock`);
  const take = () => {
    try {
      fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, owner }), { flag: 'wx' });
      return true;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      return false;
    }
  };

  if (!take()) {
    let held = {};
    try { held = JSON.parse(fs.readFileSync(lock, 'utf8')); } catch { /* unreadable = abandoned */ }
    if (alive(held.pid)) {
      console.error(
        `\n${owner}: ${held.owner ?? 'another harness'} is already driving ${route} (pid ${held.pid}).\n` +
        'Two of these share one Chrome and delete each other\'s route mid-run, so this one is stopping.\n' +
        'Wait for it to finish, or stop it first.\n',
      );
      process.exit(1);
    }
    // The owner is gone. Its route is an orphan, and an orphan is the one that
    // gets shipped, so it goes too.
    console.log(`${owner}: taking over ${route} from a dead pid ${held.pid ?? '?'}`);
    try { fs.unlinkSync(route); } catch { /* already gone */ }
    try { fs.unlinkSync(lock); } catch { /* raced with another taker */ }
    if (!take()) {
      console.error(`${owner}: lost the race for ${route}; try again.`);
      process.exit(1);
    }
  }

  // Only remove what this run CREATED — deleting a file that was already there
  // invalidates Metro's file map, and the next bundle cannot find modules that
  // plainly exist.
  //
  // But a route left behind by a DIFFERENT harness is not this one's screen, and
  // check-frame's previewframe.tsx is not check-spoiler's however alike they look.
  // So the content is rewritten when it differs, which Metro handles as an
  // ordinary edit — it is creating and deleting the FILE that churns the route
  // table, not changing what is in it.
  const createdHere = !fs.existsSync(route);
  const stale = !createdHere && fs.readFileSync(route, 'utf8') !== src;
  if (createdHere || stale) fs.writeFileSync(route, src);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    if (createdHere && !keep) { try { fs.unlinkSync(route); } catch {} }
    try {
      const held = JSON.parse(fs.readFileSync(lock, 'utf8'));
      if (held.pid === process.pid) fs.unlinkSync(lock);
    } catch { /* somebody else's now, or already gone */ }
  };

  process.on('exit', release);
  // Every way a run can end, not just the tidy one: an uncaught throw used to
  // leave both the lock and the route behind.
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { release(); process.exit(130); });
  }
  process.on('uncaughtException', (e) => { release(); throw e; });

  // `wrote` is what a caller should wait on: a NEW file makes Metro rebuild its
  // route table, and navigating before that lands gets "This screen doesn't exist"
  // for every lesson — a sweep that then finishes green having measured nothing.
  return { release, createdHere, wrote: createdHere || stale };
}
