// TABS ACCUMULATE, AND A BROWSER FULL OF THEM REPORTS ITSELF AS BROKEN LESSONS.
//
// Every harness in §21 opens its page with `PUT /json/new`. Only one of the seven
// ever closed it, so each run left its tabs alive — check-readable one per LANE.
// After a day of runs the headless Chrome held **64 live pages**, each with a
// React tree in it, and the same sweep on identical source went from 1613 beats
// audited to 1386 with **29 lessons reported NOT AUDITED**. That reads exactly
// like the app having got worse, and it is the instrument leaking.
//
// ── WHY CLOSING AT EXIT IS NOT ENOUGH ───────────────────────────────────────
//
// The runs that leaked most were the ones that were KILLED — a sweep of 186
// lessons is long enough that it gets interrupted, and an interrupted run never
// reaches its teardown. So the cleanup that actually works happens at STARTUP:
// close what previous runs left behind before opening anything new.
//
// It only ever closes `about:blank` and pages on the dev-server origin, so a
// browser somebody is using for something else is left alone.
import http from 'node:http';

const req = (port, path, method = 'GET') => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port, path, method }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => res(b));
  });
  r.on('error', rej); r.end();
});

/**
 * Close pages left behind by earlier runs. Returns how many it closed.
 * `origin` is the dev server ('http://localhost:8877'); pass it so a page that
 * is not ours is never touched.
 */
export async function sweepStaleTabs(cdpPort, origin) {
  let list;
  try { list = JSON.parse(await req(cdpPort, '/json/list')); } catch { return 0; }
  const pages = list.filter((t) => t.type === 'page');
  // Never close the last one: Chrome exits when its final page goes, and the
  // harness that opened the browser is usually not the one running now.
  const mine = pages.filter((t) => t.url === 'about:blank' || (origin && t.url.startsWith(origin)));
  const doomed = pages.length === mine.length ? mine.slice(1) : mine;
  let n = 0;
  for (const t of doomed) {
    try { await req(cdpPort, '/json/close/' + t.id); n += 1; } catch { /* already gone */ }
  }
  return n;
}

/** Open a page and hand back the id, so a caller can close exactly its own. */
export async function newTab(cdpPort) {
  return JSON.parse(await req(cdpPort, '/json/new?about:blank', 'PUT'));
}

/**
 * Close one page by id — unless it is the LAST one, because Chrome exits with its
 * final page and the next harness then meets ECONNREFUSED and reports every
 * lesson as NEVER RENDERED A STAGE. Leaving one about:blank behind costs nothing
 * and keeps the browser alive between runs.
 */
export async function closeTab(cdpPort, id) {
  try {
    const list = JSON.parse(await req(cdpPort, '/json/list'));
    if (list.filter((t) => t.type === 'page').length <= 1) return;
  } catch { return; }
  try { await req(cdpPort, '/json/close/' + id); } catch { /* already gone */ }
}
