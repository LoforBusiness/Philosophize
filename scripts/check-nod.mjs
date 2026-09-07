// AA5 IN THE RENDER — DOES THE FIGURE ACTUALLY ANSWER YOU BACK?
//
//   npx expo start --web --port 8847 --clear
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   node scripts/check-nod.mjs             # every cinematic lesson
//   node scripts/check-nod.mjs ids.json    # a chosen list
//
// AA5 says the mascot nods when the reader gets it right and draws back when they
// get it wrong — "the stickman's purpose is to learn with the user". It is wired
// through ONE module-level shared value: `REACT` in cinematicKit, written by the
// player's `choose()` and read by `lookPose`, which 164 scenes call in place of
// `pose`. That design is why it reached the whole corpus without editing a single
// scene. It is also why nothing would notice if it stopped.
//
// ── WHY A SOURCE CHECK CANNOT ANSWER THIS ───────────────────────────────────
//
// This is the shape §17 records twice already. 51 scenes carried a `reacting`
// flag that could never fire, and `check:react` counted every one of them as
// wired, because its test was whether the scene MENTIONED the value. A grep here
// would be worse still: no scene mentions `REACT` at all — the whole point is
// that they do not. The only honest question is whether the figure MOVED, and
// only the render can answer it.
//
// ── THE MEASUREMENT, AND THE ONE THING THAT MAKES IT HARD ───────────────────
//
// Reach a graded beat. Record every element inside `[data-testid="figure"]`.
// Answer. Record again, repeatedly, and keep the LARGEST displacement seen.
//
// SAMPLING ONCE WOULD REPORT A WORKING NOD AS DEAD. The reaction is a
// withSequence: 220ms out to full, 260ms held, 420ms back to zero. It is a
// ROUND TRIP, so a probe that reads at 1000ms — the settle time every other
// harness here uses — finds the figure back exactly where it started and calls
// it dead. Sampling across the whole window and taking the peak is the only
// reading that does not depend on guessing the phase.
//
// The figure also has ambient life of its own (group N: he breathes, and a
// living hold reads the monotonic clock), so a still figure is never perfectly
// still. The floor is set from the CONTROL below rather than from zero.
import fs from 'node:fs';
import http from 'node:http';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const ROUTE = process.env.NOD_ROUTE || 'previewreveal';
const LANES = +(process.env.LANES || 3);
const STAGE_TRIES = +(process.env.STAGE_TRIES || 300);

// A nod moves the head about twelve units; ambient breathing moves it under two.
//
// THE FLOOR IS LOW BECAUSE A WRONG ANSWER IS DELIBERATELY SMALL. `reacted` uses
// 0.46/0.28 radians for a right answer and 0.15/0.10 for a wrong one — about a
// third — because this is a mascot who is pleased for you rather than
// disappointed in you (§7). This probe taps whichever target it finds first, so
// most of what it measures is the SMALL move, and a floor set for a nod would
// report a working draw-back as dead. The real discrimination is the per-lesson
// idle comparison below, which is measured rather than assumed.
const MOVED = +(process.env.NOD_FLOOR || 2);

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
  });
  r.on('error', rej); r.end();
});

async function makeTab() {
  const t = await put('/json/new?about:blank');
  const tabId = t.id;
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let mid = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
  });
  await new Promise((r) => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r?.exceptionDetails) throw new Error(String(r.exceptionDetails.exception?.description ?? '').slice(0, 300));
    return r?.result?.value;
  };
  const close = () => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port: CDP, path: '/json/close/' + tabId }, (x) => { x.resume(); x.on('end', res); });
    r.on('error', res); r.end();
  });
  return { send, evalJs, close };
}

const STAGE = "document.querySelector('#stage-cam')";
const RINGS = `[...document.querySelectorAll('[id="target-ring"],[data-nativeid="target-ring"]')]`;
const CONTROLS = `[...document.querySelectorAll('[id$="-strip"],[id$="-bar"],[id$="-plot"],[id$="-bins"],[id$="-ballot"],[data-nativeid$="-strip"],[data-nativeid$="-bar"],[data-nativeid$="-plot"],[data-nativeid$="-bins"],[data-nativeid$="-ballot"]')]`;
// A graded beat is one the reader cannot walk past: the deck stops offering
// "Tap to continue" and something answerable is on screen. Deck cards are bare
// Pressables, so they carry a tabindex and no role (§21).
const DECK = `[...document.querySelectorAll('[role="button"],[tabindex]')].filter(e=>e.getBoundingClientRect().width>60&&e.getAttribute('aria-disabled')!=='true'&&!e.getAttribute('data-testid'))`;
const ASKED = `(!document.body.innerText.includes('Tap to continue')) && (${RINGS}.length>0 || ${CONTROLS}.length>0 || ${DECK}.length>1)`;
const TAP_ADVANCE = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";

/**
 * Every drawn part of EVERY figure, in page coordinates.
 *
 * `querySelector` takes the first match in DOM order, and DOM order is MOUNT
 * order, which is PAINT order rather than importance — the same trap that once
 * made a citizen the lead of politicalScene. In a two-figure scene the lead is
 * often mounted LAST so it paints over the other, so the singular selector
 * measured the figure that is correctly standing still and reported the lesson
 * dead: ethics2, ethics8, logic9, ethics10 and political9 all mount their
 * principal after somebody else.
 *
 * The honest question is whether ANY figure answered, so all of them are read and
 * the largest displacement wins. Element order is stable across samples because
 * the page is never reloaded between them.
 */
const FIG = `(()=>{
  const fs = document.querySelectorAll('[data-testid="figure"]');
  if (!fs.length) return null;
  const out = [];
  for (const f of fs) {
    for (const el of f.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue;
      out.push([+r.x.toFixed(2), +r.y.toFixed(2)]);
    }
  }
  return out;
})()`;

/** Answer whatever this beat is asking, by whichever of the three routes fits. */
const ANSWER_ANY = `(()=>{
  const rings = ${RINGS};
  if (rings.length) {
    const p = rings[0].parentElement || rings[0];
    p.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return 'target';
  }
  const deck = ${DECK};
  if (deck.length > 1) {
    deck[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return 'deck';
  }
  return null;
})()`;

/** The largest distance any one part of the figure has travelled since `base`. */
const shift = (base, now) => {
  if (!base || !now) return 0;
  const n = Math.min(base.length, now.length);
  let worst = 0;
  for (let i = 0; i < n; i++) {
    const dx = now[i][0] - base[i][0];
    const dy = now[i][1] - base[i][1];
    const d = Math.hypot(dx, dy);
    if (d > worst) worst = d;
  }
  return worst;
};

async function nod(tab, id) {
  const { evalJs } = tab;
  await tab.send('Page.navigate', { url: 'about:blank' });
  await new Promise((r) => setTimeout(r, 120));
  await tab.send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });
  for (let i = 0; i < STAGE_TRIES; i++) {
    if (await evalJs(`!!${STAGE}`)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!await evalJs(`!!${STAGE}`)) return { id, skip: 'never rendered a stage', threw: true };

  let reached = false;
  for (let b = 0; b < 16; b++) {
    if (await evalJs(ASKED)) { reached = true; break; }
    await evalJs(TAP_ADVANCE);
    await new Promise((r) => setTimeout(r, 1300));
  }
  if (!reached) return { id, skip: 'no graded beat reached', threw: true };

  // LET THE BEAT LAND FIRST. The graded beat arrives with its own entrance —
  // figures walk to their marks, props slide in — and sampling straight away
  // measures that, not the idle. `epistemology-knowledge-3` read 8.96px of
  // "idling" against 1.29px of reaction, which is the arrival being timed and
  // then used as the floor the reaction has to beat. A reaction that has to
  // out-move a walk-in is being asked the wrong question.
  await new Promise((r) => setTimeout(r, 2600));

  // THE CONTROL. The same sampling, over the same window, with NOBODY answering.
  // Whatever it reports is this scene's own ambient life, and the reaction has to
  // beat it — a fixed floor would call a lesson with a big idle gesture reactive.
  const idleBase = await evalJs(FIG);
  let idle = 0;
  for (let i = 0; i < 9; i++) {
    await new Promise((r) => setTimeout(r, 110));
    idle = Math.max(idle, shift(idleBase, await evalJs(FIG)));
  }

  const base = await evalJs(FIG);
  if (!base || !base.length) return { id, skip: 'no figure on stage', threw: true };
  const how = await evalJs(ANSWER_ANY) || await evalJs(ANSWER_CONTROL);
  if (!how) return { id, skip: 'could not answer the beat', threw: true };

  // ACROSS THE WHOLE ROUND TRIP, and keep the peak. 220 out, 260 held, 420 back.
  let peak = 0;
  for (let i = 0; i < 9; i++) {
    await new Promise((r) => setTimeout(r, 110));
    peak = Math.max(peak, shift(base, await evalJs(FIG)));
  }

  // AND CHECK THE ANSWER ACTUALLY LANDED. A tap that misses — a disabled target,
  // a hit box that is not the pressable — leaves the beat still asking, and the
  // figure correctly does not move. Reported as a low peak that is a lesson
  // defect; reported as an unregistered answer it is what it is, a probe that
  // could not drive this control. The beat stops asking once it is answered.
  if (await evalJs(ASKED)) return { id, skip: `answer did not register (${how})`, threw: true };

  return { id, peak: +peak.toFixed(2), idle: +idle.toFixed(2), how };
}

(async () => {
  const routeFile = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  const all = [...routeFile.matchAll(/'([a-z0-9-]+)':\s*[A-Za-z0-9_]+/g)].map((m) => m[1]);
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : all;

  const results = [];
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: LANES }, async () => {
    for (;;) {
      const i = next++;
      if (i >= ids.length) return;
      let r, tab = null;
      try { tab = await makeTab(); r = await nod(tab, ids[i]); }
      catch (e) { r = { id: ids[i], skip: 'threw: ' + String(e).slice(0, 70), threw: true }; }
      finally { if (tab) { try { await tab.close(); } catch { /* gone */ } } }
      results.push(r); done++;
      const tag = r.skip ? r.skip : `peak ${String(r.peak).padStart(7)}px  idle ${String(r.idle).padStart(6)}px  (${r.how})`;
      console.log(`  ${String(done).padStart(3)}/${ids.length}  ${r.id.padEnd(28)} ${tag}`);
    }
  }));

  const judged = results.filter((r) => !r.skip);
  const unmeasured = results.filter((r) => r.threw);
  // A reaction has to beat this scene's own idling by a clear margin.
  const dead = judged.filter((r) => r.peak < MOVED || r.peak <= r.idle * 1.5);

  console.log('\nAA5 IN THE RENDER — THE FIGURE ANSWERS BACK\n');
  console.log(`  ${judged.length} lesson(s) measured · ${unmeasured.length} unmeasured`);
  if (judged.length) {
    const med = judged.map((r) => r.peak).sort((a, b) => a - b)[Math.floor(judged.length / 2)];
    console.log(`  median peak movement ${med.toFixed(1)}px · floor ${MOVED}px`);
  }
  if (dead.length) {
    console.log(`\n  ${dead.length} lesson(s) where the figure did NOT react to the answer:`);
    for (const r of dead.slice(0, 20)) console.log(`      ${r.id.padEnd(28)} peak ${r.peak}px against ${r.idle}px of idling`);
    if (dead.length > 20) console.log(`      … and ${dead.length - 20} more`);
  }
  if (unmeasured.length) {
    console.log(`\n  ${unmeasured.length} NOT MEASURED — this sweep proves nothing about them:`);
    for (const r of unmeasured.slice(0, 10)) console.log(`      ${r.id.padEnd(28)} ${r.skip}`);
    if (unmeasured.length > 10) console.log(`      … and ${unmeasured.length - 10} more`);
  }
  fs.writeFileSync('scripts/.nod.json', JSON.stringify(results, null, 1));
  console.log(`\n  ${dead.length} dead · ${unmeasured.length} unmeasured · wrote scripts/.nod.json`);
  process.exit(dead.length + unmeasured.length ? 1 : 0);
})();
