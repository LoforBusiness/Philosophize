// E39 IN THE RENDER — DOES THE WHOLE ANSWER MOVE, OR ONLY ITS OUTLINE?
//
//   npx expo start --web --port 8873 --clear
//   chrome --headless=new --remote-debugging-port=9403 --user-data-dir=<tmp>
//   node scripts/check-reveal.mjs            # every cinematic lesson
//   node scripts/check-reveal.mjs ids.json   # a chosen list
//
// The reader has now reported this three times, and the third time is why this
// exists rather than another source heuristic:
//
//   "I know that was fixed for, like, a couple lessons, but I've noticed that it
//    has not been fixed for all lessons … I need every single lesson to be fixed."
//
// `check:lift` reads the SOURCE and asks whether a Target has art inside it. That
// is a proxy, and a proxy has blind spots by construction — it said zero while the
// reader could still see the defect. What is actually true is a thing about the
// RENDER: when the answer lands, everything that belongs to the correct answer has
// to move together.
//
// ── THE MEASUREMENT ─────────────────────────────────────────────────────────
//
// At the graded beat, before answering, every Target draws a ring; the ring's
// parent IS the pressable, so the correct answer's box is known exactly. Record
// every element inside the stage with its rect. Tap the correct target. Record
// again, once the reaction has settled.
//
// Then: of the elements that sat INSIDE the correct answer's box, how many moved?
//   · all of them        -> the whole answer rose (E39 satisfied)
//   · none of them       -> nothing replied; the reader gets no reveal at all
//   · some but not all   -> THE DEFECT. An outline slid off its own words.
//
// The last case is reported with the words that stayed behind, because that is
// the sentence the reader will use when they see it again.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const CDP = +(process.env.CDP_PORT || 9403);
const WEB = +(process.env.WEB_PORT || 8873);
const ROUTE = process.env.REVEAL_ROUTE || 'previewreveal';
const LANES = +(process.env.LANES || 4);
const SETTLE = +(process.env.REVEAL_SETTLE || 1100);
const STAGE_TRIES = +(process.env.STAGE_TRIES || 240);

const ROUTE_FILE = path.join('app', `${ROUTE}.tsx`);

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
const ASKED = `(!document.body.innerText.includes('Tap to continue')) && ${RINGS}.length > 0`;
const TAP_ADVANCE = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";

/**
 * Every element in the stage that a READER CAN SEE: its rect, its own text, and
 * whether it is painted.
 *
 * ONLY VISIBLE THINGS MAY BE JUDGED, and the first version of this got it wrong in
 * a way that reported every lesson as broken. `Target` renders a <Pressable> whose
 * CHILD is the animated wrapper, so the pressable and the ring it draws never move
 * — by design, because `measureLayout` has to keep reporting the same box to the
 * camera (H60c). Counting those as "stayed" makes a correctly-lifting answer look
 * split in two.
 */
const SNAP = `(()=>{
  const host = ${STAGE};
  if (!host) return null;
  const out = [];
  for (const el of host.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    let own = '';
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue;
    own = own.trim().slice(0, 40);
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor || '';
    const painted = !(bg === '' || bg === 'transparent' || /rgba\\(0, 0, 0, 0\\)/.test(bg))
      || parseFloat(cs.borderTopWidth || '0') > 0
      || parseFloat(cs.borderLeftWidth || '0') > 0;
    const isRing = el.id === 'target-ring' || el.getAttribute('data-nativeid') === 'target-ring';
    if (!own && !painted) continue;
    if (isRing) continue;
    // THE FIGURE IS NEVER PART OF AN ANSWER, and he stands wherever the staging
    // put him — which on political2 is squarely inside the ledger row that IS the
    // answer. His head and two ankles were reported as four things that failed to
    // rise while the row and both its lines plainly did. He carries testID="figure"
    // for exactly this sort of question (see Stickman.tsx).
    if (el.closest('[data-testid="figure"]')) continue;
    out.push({ x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), t: own, p: painted ? 1 : 0 });
  }
  return out;
})()`;

async function reveal(tab, id) {
  const { evalJs } = tab;
  await tab.send('Page.navigate', { url: 'about:blank' });
  await new Promise((r) => setTimeout(r, 120));
  await tab.send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });
  for (let i = 0; i < STAGE_TRIES; i++) {
    if (await evalJs(`!!${STAGE}`)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!await evalJs(`!!${STAGE}`)) return { id, skip: 'never rendered a stage' };

  let reached = false;
  for (let b = 0; b < 16; b++) {
    if (await evalJs(ASKED)) { reached = true; break; }
    await evalJs(TAP_ADVANCE);
    await new Promise((r) => setTimeout(r, 1300));
  }
  if (!reached) return { id, skip: 'no scene-target question' };

  // WHERE THE CORRECT ANSWER IS. Tapping each in turn would end the beat, so the
  // right one is found by asking the page: a Target renders `correct` into its
  // own onPress, which we cannot read — so instead tap each candidate in a fresh
  // load until one is graded correct. Cheaper: the explain panel says so. We use
  // the simplest reliable signal — tap a candidate, then read whether the deck
  // says Correct; if not, this lesson's correct target is a different one and we
  // reload. Most lessons have 2-3 candidates, so this is at most a few loads.
  const boxes = await evalJs(`${RINGS}.map((r) => { const p = r.parentElement; const b = p.getBoundingClientRect();
    return { x:+b.x.toFixed(2), y:+b.y.toFixed(2), w:+b.width.toFixed(2), h:+b.height.toFixed(2) }; })`);
  if (!boxes?.length) return { id, skip: 'no targets on the graded beat' };

  const n = boxes.length;
  for (let k = 0; k < n; k++) {
    if (k > 0) {
      // reload and replay to the same beat to try the next candidate
      await tab.send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });
      for (let i = 0; i < STAGE_TRIES; i++) { if (await evalJs(`!!${STAGE}`)) break; await new Promise((r) => setTimeout(r, 1000)); }
      for (let b = 0; b < 16; b++) { if (await evalJs(ASKED)) break; await evalJs(TAP_ADVANCE); await new Promise((r) => setTimeout(r, 1300)); }
    }
    // THE "BEFORE" IS TAKEN AFTER THE RELOAD, NOT ONCE AT THE TOP.
    //
    // Where the correct answer is not the first candidate this page has been
    // navigated and replayed, so a snapshot from the first load describes a DOM
    // that no longer exists — every element would look like it had moved or
    // vanished, and the harness would invent findings in exactly the lessons that
    // took the most work to reach. Snap immediately before the tap, every time.
    const before = await evalJs(SNAP);
    const boxNow = await evalJs(`(()=>{const p=${RINGS}[${k}]?.parentElement; if(!p) return null;
      const b=p.getBoundingClientRect(); return {x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}; })()`);
    if (!before || !boxNow) continue;
    await evalJs(`(()=>{const p=${RINGS}[${k}]?.parentElement; if(p) p.dispatchEvent(new MouseEvent('click',{bubbles:true})); return !!p })()`);
    await new Promise((r) => setTimeout(r, SETTLE));
    const right = await evalJs("/Correct/.test(document.body.innerText)");
    if (!right) continue;

    const after = await evalJs(SNAP);
    if (!after) return { id, skip: 'stage vanished after answering' };
    const box = boxNow;

    // Everything that sat inside the correct answer's box before the tap.
    const inside = [];
    for (const e of before) {
      const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
      if (cx >= box.x - 2 && cx <= box.x + box.w + 2 && cy >= box.y - 2 && cy <= box.y + box.h + 2) inside.push(e);
    }
    if (!inside.length) return { id, skip: 'nothing measurable inside the answer' };

    // Did each of them move? Match by nearest same-sized element afterwards.
    const moved = [], still = [];
    for (const e of inside) {
      let best = null, bestD = Infinity;
      for (const a of after) {
        if (Math.abs(a.w - e.w) > Math.max(3, e.w * 0.12)) continue;
        if (Math.abs(a.h - e.h) > Math.max(3, e.h * 0.12)) continue;
        if (a.t !== e.t) continue;
        const d = Math.hypot(a.x - e.x, a.y - e.y);
        if (d < bestD) { bestD = d; best = a; }
      }
      if (best == null) continue;                 // scaled or replaced — not judgeable
      (bestD > 2 ? moved : still).push(e);
    }
    return { id, box, moved: moved.length, still: still.length,
             stillWords: still.filter((s) => s.t).map((s) => s.t).slice(0, 4),
             // the rects that stayed, so the scene edit does not need a second run
             stillRects: still.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h, t: s.t })).slice(0, 8),
             movedRects: moved.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h, t: s.t })).slice(0, 8) };
  }
  return { id, skip: 'no candidate graded correct' };
}

(async () => {
  const route = fs.readFileSync('scripts/measure-must.mjs', 'utf8');
  const src = /const ROUTE_SRC = `([\s\S]*?)`;\n/.exec(route)[1];
  if (!fs.existsSync(ROUTE_FILE)) fs.writeFileSync(ROUTE_FILE, src);

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
      try { tab = await makeTab(); r = await reveal(tab, ids[i]); } catch (e) { r = { id: ids[i], skip: 'threw: ' + String(e).slice(0, 80) }; }
      finally { if (tab) { try { await tab.close(); } catch { /* gone already */ } } }
      results.push(r);
      done++;
      const tag = r.skip ? r.skip : `${r.moved} moved · ${r.still} stayed`;
      console.log(`  ${String(done).padStart(3)}/${ids.length}  ${r.id.padEnd(28)} ${tag}`);
    }
  }));

  const judged = results.filter((r) => !r.skip);
  const broken = judged.filter((r) => r.still > 0 && r.moved > 0);
  const dead = judged.filter((r) => r.moved === 0);

  console.log('\nE39 IN THE RENDER\n');
  console.log(`  ${judged.length} lesson(s) measured · ${results.length - judged.length} skipped (no scene-target question)`);
  if (broken.length) {
    console.log('\n  the outline moved and these words did not:');
    for (const r of broken) console.log(`      ${r.id.padEnd(28)} ${r.still} stayed  ${r.stillWords.join(' · ')}`);
  }
  if (dead.length) {
    console.log('\n  nothing moved at all when the answer landed:');
    for (const r of dead) console.log(`      ${r.id}`);
  }
  fs.writeFileSync('scripts/.reveal.json', JSON.stringify(results, null, 1));
  console.log(`\n  ${broken.length} split · ${dead.length} dead · wrote scripts/.reveal.json`);
  process.exit(broken.length + dead.length ? 1 : 0);
})();
