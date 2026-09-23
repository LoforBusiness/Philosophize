// CAN A READER TELL THE CHOICES APART? (S14)
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/check-named.mjs <stem> [<stem> …]
//
// A reader, on ethics37: *"you tap above the stickman and there is no words to press,
// its confusing."* Measured at that beat: three live targets, nothing written inside
// any of them and no word lying on any of them — three outlined regions and nothing
// to choose BY.
//
// ── WHY THIS HAS TO RENDER ──────────────────────────────────────────────────
//
//  S14 holds the cheap half offline: a scene whose targets are ALL
// wordless. It cannot say whether that is a fault, because a bare hit box over art
// that names itself is the commonest correct shape in the corpus — political7, the
// lesson the reader holds up as the standard, has two of them and reads perfectly.
// The question is whether a name is REACHABLE, and only the page knows.
//
// So this drives each lesson until its targets go live and reads, for every one, the
// words INSIDE it and the words lying ON it. Neither is a blank box; none of them
// having either is a question answered by guessing.
//
// Its first sweep of the thirteen all-wordless scenes found three: ethics37,
// metaphysics23 and metaphysics20, all since named. It passed political7, which is
// the test that matters — a checker that cannot tell the design from the defect is
// the boxiness metric again.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
// IT WRITES ITS OWN ROUTE, AND FOR ITS FIRST LIFE IT DID NOT.
//
// It used to navigate to `previewsheet23`, a route no script creates — a file
// somebody has to leave on disk by hand, which `check:routes` then (correctly)
// blocks every commit on. So the workflow was: write the route, sweep, delete the
// route before committing; and deleting it and then sweeping reported all sixteen
// lessons as NEVER RENDERED with nothing wrong anywhere in the app. A harness that
// depends on manual setup is one that can be blind without saying so, which is the
// same failure as the green it used to print (see the summary at the foot).
const ROUTE = process.env.NAMED_ROUTE || 'previewnamed';
const ROUTE_SRC = fs.readFileSync(path.join(REPO, 'scripts/lib/previewnamed.txt'), 'utf8');
const { ANSWER_CONTROL } = await import(pathToFileURL(path.join(REPO, 'scripts/lib/answerctl.mjs')).href);
const { claimRoute } = await import(pathToFileURL(path.join(REPO, 'scripts/lib/previewroute.mjs')).href);

// ── THE TWO THAT MUST STAY WORDLESS ─────────────────────────────────────────
//
// Both are lessons whose CONTENT is that the choices cannot be told apart by a
// word, so a caption on each would not make them clearer — it would answer them.
// They are listed rather than budgeted, because a number would let a new one in
// and neither of these is a kind of scene anybody should copy by accident.
const EXEMPT = {
  logic23: 'a truth table drawn as lamps, never letters — each row IS its pattern, and '
    + 'naming the rows would teach a notation the scene exists to avoid',
  epistemology36: 'four pairs of stockings the experiment requires to be identical (A1). '
    + 'What separates them is position in the row, which is the answer',
};

let bad = 0;
/** Lessons this run could not read at all — the machine, not the lesson, and never a pass. */
let blind = 0;

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const idOf = (stem) => {
  const want = stem.toLowerCase();
  for (const m of route.matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*([A-Za-z0-9]+)/g)) {
    const c = m[2].replace(/Lesson$/, '');
    if (`${c[0].toLowerCase()}${c.slice(1)}`.toLowerCase() === want) return m[1];
  }
  return null;
};

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;

const READ = '(function(){'
  + 'var stage=document.querySelector("#stage-clip");'
  + 'if(!stage)return JSON.stringify({err:"no stage"});'
  + 'var sr=stage.getBoundingClientRect();'
  + 'function box(e){var r=e.getBoundingClientRect();return {x:+(r.x-sr.x).toFixed(1),y:+(r.y-sr.y).toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};}'
  + 'function vis(e){var s=getComputedStyle(e);return s.visibility!=="hidden"&&+s.opacity>0.05;}'
  + 'var out={targets:[],words:[]};'
  + 'var all=stage.querySelectorAll("*");'
  + 'for(var i=0;i<all.length;i++){var e=all[i];if(!vis(e))continue;'
  + ' if(e.getAttribute("role")==="button"&&e.getAttribute("aria-disabled")!=="true"){var b=box(e);if(b.w>8&&b.h>8)out.targets.push({b:b,t:(e.innerText||"").trim()});}'
  + ' if(e.children.length===0&&(e.innerText||"").trim())out.words.push({b:box(e),t:(e.innerText||"").trim()});}'
  + 'return JSON.stringify(out);})()';
const NEXT = '(function(){var w=innerWidth,h=innerHeight;'
  + 'var el=document.elementFromPoint(w*0.82,h*0.62);if(!el)return false;'
  + 'el.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window,clientX:w*0.82,clientY:h*0.62}));return true;})()';

const ov = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const stems = process.argv.slice(2);
const { release: dropRoute, wrote } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-named' });
// A ROUTE WRITTEN UNDER A RUNNING METRO IS NOT A ROUTE YET. Expo Router builds its
// table from the bundle, so the first navigation after a fresh write can land on
// the not-found screen — and that screen renders, so a wait on "has the page any
// divs" would pass on it. The first lesson is given time for Metro to compile it.
if (wrote) await new Promise((r) => setTimeout(r, 6000));
process.on('exit', () => dropRoute());
console.log('CAN A READER TELL THE CHOICES APART?\n');
for (const stem of stems) {
  const id = idOf(stem);
  if (!id) { console.log(`  ${stem.padEnd(16)} — no lesson id`); continue; }
  const tab = await put('/json/new?about:blank');
  const ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
  let mid = 0; const pend = new Map();
  ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); } });
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const ev = async (e) => {
    const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r?.exceptionDetails) return null;
    return r?.result?.value;
  };
  await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });
  let up = false; let saw = '';
  for (let i = 0; i < 70; i += 1) {
    const c = await ev("document.querySelectorAll('div').length");
    if (typeof c === 'number' && c > 60) { up = true; break; }
    // AND A NOT-FOUND SCREEN IS RELOADED RATHER THAN WAITED OUT. Expo Router may
    // not have the freshly written route on the first navigation, and its
    // not-found screen renders perfectly well — so waiting on it burns the whole
    // budget and then reports the LESSON as never rendered. check:readable learned
    // the same thing on its one-lesson runs.
    saw = (await ev('(document.body.innerText || "").slice(0, 80)')) || '';
    if (/doesn't exist|does not exist|Unmatched/i.test(saw) && i % 5 === 4) {
      await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });
    }
    await wait(1000);
  }
  if (!up) {
    // SAY WHAT THE PAGE SHOWED. "NEVER RENDERED" alone cannot tell a broken scene
    // from a missing route from a starved machine, and those want three different
    // answers.
    console.log(`  ${stem.padEnd(16)} — NEVER RENDERED${saw ? `  (page said: ${JSON.stringify(saw.replace(/\s+/g, ' ').trim().slice(0, 48))})` : ''}`);
    blind += 1; await send('Page.close'); ws.close(); continue;
  }

  let said = false;
  for (let step = 0; step < 16 && !said; step += 1) {
    await wait(1800);
    const raw = await ev(READ);
    if (!raw) break;
    const r = JSON.parse(raw);
    if (r.targets && r.targets.length >= 2) {
      // A WORD BELONGS TO ONE TARGET, AND USUALLY IT IS THE NEAREST ONE.
      //
      // Inside is the plain case and lying on it is the next. Neither reaches the
      // commonest shape in this corpus: a caption set just ABOVE or BELOW the thing
      // it names — logic40's three stones, metaphysics36's numbered doors,
      // political19's two panels. Held to overlap alone those read as blank boxes,
      // which is the boxiness metric again: a checker that cannot tell the design
      // from the defect.
      //
      // So a word outside every target may still name the one it is NEAREST to, on
      // three conditions, and the third is the one that matters. It has to be CLOSE
      // (a caption sits against its subject); it has to be LINED UP with it, since a
      // word off to one side is a different thing's label; and the nearest target has
      // to be nearer by half again than the next, because ethics17 sets BEING
      // BELIEVED — one answer's own caption — six units under another answer's row,
      // and handing that word to both is how a genuinely blank box passes.
      const LEAN = 16;   // px on screen, about twenty design units at the usual fit
      const gap = (w, t) => Math.hypot(
        Math.max(0, t.b.x - (w.b.x + w.b.w), w.b.x - (t.b.x + t.b.w)),
        Math.max(0, t.b.y - (w.b.y + w.b.h), w.b.y - (t.b.y + t.b.h)),
      );
      const lined = (w, t) => {
        const wc = w.b.x + w.b.w / 2; const tc = t.b.x + t.b.w / 2;
        return (wc >= t.b.x && wc <= t.b.x + t.b.w) || (tc >= w.b.x && tc <= w.b.x + w.b.w);
      };
      const beside = r.targets.map(() => []);
      for (const w of r.words) {
        if (r.targets.some((t) => ov(w.b, t.b) > w.b.w * w.b.h * 0.5)) continue;
        const d = r.targets.map((t) => (lined(w, t) ? gap(w, t) : Infinity));
        const best = Math.min(...d);
        if (!(best <= LEAN)) continue;
        const k = d.indexOf(best);
        const next = Math.min(...d.filter((_, j) => j !== k));
        if (next < best * 1.5) continue;
        beside[k].push(w.t.replace(/\s+/g, ' '));
      }
      const named = r.targets.map((t, k) => {
        const inside = (t.t || '').replace(/\s+/g, ' ').trim();
        const on = r.words.filter((w) => ov(w.b, t.b) > w.b.w * w.b.h * 0.5).map((w) => w.t.replace(/\s+/g, ' ')).join('/');
        return inside || on || beside[k].join('/') || '';
      });
      const blank = named.filter((n) => !n).length;
      const why = EXEMPT[stem];
      const mark = !blank ? 'ok'
        : why ? 'by design'
        : blank === named.length ? '✗ NONE NAMED' : `✗ ${blank} of ${named.length} blank`;
      if (blank && !why) bad += 1;
      console.log(`  ${stem.padEnd(16)} ${String(mark).padEnd(16)} ${named.map((n) => `"${n.slice(0, 18)}"`).join(' ')}`);
      if (why) console.log(`  ${''.padEnd(16)} ${''.padEnd(16)} ${why}`);
      said = true;
      break;
    }
    const how = await ev(ANSWER_CONTROL);
    if (how) { await wait(900); await ev(NEXT); } else { await ev(NEXT); }
  }
  if (!said) { console.log(`  ${stem.padEnd(16)} — no beat with 2+ live targets reached`); blind += 1; }
  await send('Page.close');
  ws.close();
}
// A SWEEP THAT MEASURED NOTHING MUST NOT LOOK CLEAN. This printed NEVER RENDERED
// for all sixteen lessons of one run and still ended on "every choice has a name"
// with exit 0 — the fifth time this repo has recorded that shape, and the first in
// a checker written the same week the other four were read. A page that never came
// up is a fact about the MACHINE rather than about the lesson, so it is not a
// finding; but it is counted, named in the summary, and it fails the run, because
// the alternative is a green that means nothing.
const notes = [];
if (bad) notes.push(`${bad} lesson(s) leave a choice unnamed`);
if (blind) notes.push(`${blind} MEASURED NOTHING — re-run on a quiet machine before believing this`);
console.log(notes.length ? `\n${notes.join(' · ')}.\n` : '\nevery choice has a name.\n');
process.exit(bad || blind ? 1 : 0);
