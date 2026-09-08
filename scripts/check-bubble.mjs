// AB IN THE RENDER — DOES THE THOUGHT BUBBLE FOLLOW HIM, AND DOES IT CHANGE
// SENTENCE WHERE THE READER CAN SEE IT?
//
//   npx expo start --web --port 8847 --clear
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   npm run check:bubble                 # the default worklist
//   npm run check:bubble -- ids.json     # a chosen list
//
// A reader reported five things about the bubbles across two sittings, and every
// one of them was true: *"they don't seem to be following the Stickman
// correctly"*, *"sometimes they'll skip from one sentence to another all of a
// sudden"*, *"it appears way too much … I don't want it every single tab"*, *"the
// thinking boxes need to be closer to the [stickman]"*, and *"the bubble needs to
// disappear and reappear really smoothly. Right now, it really doesn't."*
//
// Two of those are answered offline — how MANY there are and how HIGH they sit are
// properties of the table, and `check:thoughts` holds both. The three left are
// relationships between FRAMES, and only the render can answer them.
//
// ── WHY NONE OF IT COULD BE SEEN FROM THE SOURCE ────────────────────────────
//
// Every one was a TIMING relationship between two things that are each
// individually correct. The placement table is right — `check:thoughts` re-derives
// every box and none covers a word. The entrance curve is right. The figure's walk
// is right. What was wrong was that the box took the next beat's placement on the
// frame the reader tapped while keeping the previous beat's words for another
// 620ms; that a placement measured for a beat's RESTING frame was pinned there
// while the figure was still walking toward it; and that changing a bubble's PHASE
// remounted it, which resets the layout it had measured and hands it a driver that
// is a frame behind React.
//
// ── WHAT IT MEASURES, AND WHY IT RECORDS RATHER THAN POLLS ──────────────────
//
// A `requestAnimationFrame` loop inside the page writes one row per painted frame:
// every bubble's opacity, words and position, and every figure's centre. It used
// to poll from out here every 90ms, which cannot see a defect that lasts one or
// two frames — and the defect it was built for lasted exactly that. Reading
// everything in ONE frame also means the two clocks this file exists to catch
// apart cannot come apart inside a single reading.
//
// Five rules, each a thing the reader named:
//
//   CUT       the words may never change while the box is readable. A sentence
//             that swaps at opacity 1 is the "skip from one sentence to another".
//   TELEPORT  the box may not jump while the figure is standing still. That is the
//             placement changing under a bubble that has not been taken down.
//   FROZEN    while the figure WALKS, the box must not stand still. Measured as
//             the share of his travel the box kept over the window they are both
//             visible for. NOT "the same distance": the box is also restoring the
//             sideways offset the generator searched out, so on a long walk it
//             legitimately travels a little less — or a little more. It read 0%
//             before the fix and 109% after.
//   BLINK     bright, dark and bright again inside 450ms. No transition does that;
//             a remount does.
//   SNAP      how much of its own opacity a bubble may gain or lose in a frame,
//             as a RATE so a dropped frame is not mistaken for a switch. This is
//             the one that caught the exit being too fast: the box occupies the
//             last 30% of the driver, so a 240ms exit faded it in 72ms.
//
// The floors are the corpus's own measured behaviour and not numbers picked to
// feel strict — see FLOORS below, each with what it was measured at.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const SLUG = process.env.BUBBLE_ROUTE || 'previewbubble';
const ROUTE = `app/${SLUG}.tsx`;
// ONE LANE, AND THAT IS NOT TIMIDITY. Every other harness here STEPS a page and
// reads it; this one SAMPLES a running animation, and a second tab in the same
// headless Chrome is put in the background, where requestAnimationFrame is
// throttled to nothing while `setTimeout` keeps firing. That is precisely the
// divergence this file exists to detect, so on two lanes it reports it — moving
// from lesson to lesson between runs, which is the tell. The same eight lessons
// on one lane came back clean. Raise it only to find candidates, never to judge.
const LANES = +(process.env.LANES || 1);
const STAGE_TRIES = +(process.env.STAGE_TRIES || 300);
// How long a beat is watched. The bubble is told to appear at 620ms and fades in
// over 520, so a window shorter than about 1.3s never sees a settled box at all —
// and the walks that carry a thought run to 3.6s, which is the whole point.
const WATCH_MS = +(process.env.BUBBLE_WATCH || 4200);
// Bright, dark and bright again inside this is a blink rather than a transition:
// an exit takes 340ms to reach nothing and the next thought is 620ms behind it.
const BLINK_MS = 450;

const FLOORS = {
  // Zero, and it can be zero: a sentence changing in front of the reader is the
  // defect itself rather than a matter of degree.
  cut: 0,
  // 6 page px. Sub-pixel drift and the edge clamp both live under this; the
  // defect it replaces moved the box the full width of the next placement.
  teleport: 6,
  // HOW FAR THE BOX MUST MOVE, IN PIXELS, WHILE HE WALKS — not a share of his
  // travel, which is what this was and which punishes the wrong thing.
  //
  // The box rides `figX + (x - refX) * settle`, so over a walk it covers his
  // travel PLUS the sideways offset the generator searched out, and that offset
  // can point the other way: `logic-arguments-21` beat 6 walked him 136 units
  // right to a box placed 154 units left, so the box legitimately moved 12px
  // while he moved 90 — 13% of his travel, which the old floor of 15% failed.
  // (That placement is now refused outright, because a trail can only lean 51
  // units and past that the bubble stops being his — but the metric was wrong
  // either way.) The defect the reader actually named is a box that stands
  // PERFECTLY still while he walks into it, and that is zero.
  move: 8,
  // Zero, for the same reason `cut` is: a bubble that goes dark and comes back is
  // not a gentler version of anything, it is the remount the fix removed.
  blink: 0,
  // How much of its own opacity a bubble may gain or lose per 16.7ms.
  //
  // A whole bubble arriving in one frame — which is what a remount does — is 1.00.
  // The design's own worst, measured across twelve lessons and a hundred readable
  // boxes, is 0.30: the box fades over the last 30% of the driver, so the 340ms
  // exit moves it about 0.16 a frame with the easing peaking above that. 0.45 sits
  // between the two with room for the frame timing to wander, which matters
  // because a budget sitting ON the measurement fails on the next slow machine
  // rather than on the next defect. It caught the exit at 240ms (0.37) when the
  // budget was 0.34, which is what it is for.
  //
  // Measured as a RATE, and the divisor is never less than ONE frame: two reads
  // can land inside a single painted frame (9ms was measured) and dividing by
  // 0.54 turns a legitimate 0.20 step into a 0.38 snap.
  snap: 0.45,
};
// Only a walk this long can say anything, and the number is measured rather than
// picked. The figure's centre here is the union of every limb rect, so a gesture
// that puts an arm out shifts it by tens of pixels without him going anywhere:
// `logic-arguments-17` beat 3 reported 28px of "walk" and a box that correctly
// did not move, which at a 20px threshold read as a failure. The corpus's median
// real walk is 68 stage units — about 72 page px at this device width — so 60
// separates a journey from an elbow.
const REAL_WALK = 60;

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
const TAP_STAGE = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return 'stage'})()";
/**
 * ADVANCE — AND ANSWER, WHICH THIS COULD NOT DO AND HAD TO LEARN.
 *
 * It tapped the middle of the stage and returned true whatever happened. On a
 * GRADED beat a tap on the stage does nothing, so the run parked there and every
 * later beat was a copy of the one it stuck on — §21's own warning, arriving in a
 * sixth harness. It looked productive only because the old table put a thought on
 * almost every beat, so there were readable boxes before the first question;
 * rationing them to two a lesson (AB9) moved most thoughts PAST it and the same
 * blindness came back as "no lesson walked far enough", which was true of what it
 * could reach and false of the corpus.
 *
 * The order is check-spoiler's and the reason is its: a control beat still has
 * `role=button` elements that are not its answer, so a generic branch firing first
 * clicks something inert and reports success. Analogue controls, then a card, then
 * the stage. It returns WHAT it did, so a caller can tell an answer from an
 * advance from nothing at all.
 */
const ANSWER_OR_TAP = `(()=>{
  const drove = ${ANSWER_CONTROL};
  if (drove) return drove;
  // A LIVE TARGET ON THE STAGE. Excluded when it is disabled, which matters here
  // and not in measure-must: 132 targets are written \`disabled={!live || answered}\`,
  // so on an ordinary beat there is a target-shaped element that swallows the
  // click and advances nothing. Skipping them is what lets an ordinary beat fall
  // through to the stage tap below.
  const live = (e) => e.getAttribute('aria-disabled') !== 'true';
  const ring = document.querySelector('#target-ring');
  if (ring && ring.parentElement && live(ring.parentElement)) {
    ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    return 'target';
  }
  // CHOICE CARDS DRAWN ON THE PICTURE. Searched across the DOCUMENT rather than
  // inside #stage-clip: the PLAYER renders them, so they are siblings overlaying
  // the crop rather than descendants of it. The size floor keeps the header's
  // 28x28 close button out, which would leave the lesson instead of answering it.
  const card = [...document.querySelectorAll('[role="button"]')].find((e) => {
    const r = e.getBoundingClientRect();
    return live(e) && r.width > 60 && r.height > 28;
  });
  if (card) { card.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 'card'; }
  // A DECK CHOICE IS A [tabindex] DIV, NOT A [role=button] — cinematicKit's
  // Choices renders plain Pressables with no accessibilityRole, so selecting on
  // the role alone finds none of them and every deck-answered lesson stops short.
  const clip = document.getElementById('stage-clip');
  const below = clip ? clip.getBoundingClientRect().bottom : 0;
  const row = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
    if (e.getAttribute('data-testid') === 'thinker-name') return false;
    const r = e.getBoundingClientRect();
    return live(e) && r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
  });
  if (row) { row.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 'deck'; }
  const e = document.elementFromPoint(210, 320);
  (e || document.body).dispatchEvent(new MouseEvent('click', {bubbles:true}));
  return 'stage';
})()`;

/**
 * THE RECORDER, WHICH RUNS IN THE PAGE ON EVERY ANIMATION FRAME.
 *
 * IT USED TO POLL FROM OUT HERE, EVERY 90ms, AND THAT CANNOT SEE THE DEFECT IT
 * WAS BUILT FOR. A reader said the bubble *"needs to disappear and reappear
 * really smoothly. Right now, it really doesn't"*, and what was wrong lasted one
 * or two frames: the player zeroed a shared driver while the old bubble was still
 * mounted, so it went dark, and then a fresh copy mounted at full opacity and
 * began its fade. Bright, gone, bright, fade — about 30ms of it, between two
 * samples taken 90ms apart. A poller reports that as clean, forever.
 *
 * Recording inside the page fixes both halves. Every frame is a frame the browser
 * actually painted, so nothing is inferred between them; and the opacity, the
 * words, the position and the figure are read in ONE frame, so the two clocks
 * this file exists to catch apart cannot come apart inside a single reading. A
 * throttled tab now records FEWER frames rather than inconsistent ones — a missed
 * defect rather than an invented one, which is the right way round.
 *
 * EVERY BUBBLE, NOT JUST THE LIVE ONE. A thought on its way out gives up the
 * `thought-lead` id precisely so a harness cannot end up watching it, so a
 * recorder that asked for that id alone would see the stage go empty during every
 * exit and call it smooth.
 *
 * `nativeID` reaches the DOM as `id` on web and as `data-nativeid` on some
 * versions, so both are asked for — the same defensiveness every harness here
 * needs and for the same reason (§21: selecting on one attribute finds half of
 * what you are looking for).
 *
 * EVERY FIGURE IS RECORDED AND THE CALLER PICKS ONE ONCE. The first draft took
 * the WIDEST, on the reasoning that the lead is the biggest thing on the stage.
 * `Visitor` parks his man OFF-STAGE at x −60 for the whole lesson rather than
 * fading him in, so two are mounted from beat 0 in the 24 lessons that have one —
 * and the widest flips as the walking one's arms swing. `logic-arguments-19` duly
 * reported 283px of drift on a beat where nothing had moved.
 */
const INSTALL = `(()=>{
  if (window.__bubTick) cancelAnimationFrame(window.__bubTick);
  window.__bubLog = [];
  const t0 = performance.now();
  let limbs = null; let age = 0;
  const tick = () => {
    // The limb list is re-queried every ten frames rather than every frame: it is
    // the expensive half of this, and a recorder heavy enough to drop frames is
    // measuring itself.
    if (!limbs || age-- <= 0) {
      limbs = [];
      for (const f of document.querySelectorAll('[data-testid="figure"]')) limbs.push([...f.querySelectorAll('*')]);
      age = 10;
    }
    const bubs = [];
    for (const w of document.querySelectorAll('[id^="thought-"], [data-nativeid^="thought-"]')) {
      const wid = w.id || w.getAttribute('data-nativeid') || '';
      if (!wid || wid.endsWith('-box')) continue;
      const bx = document.getElementById(wid + '-box')
        || document.querySelector('[data-nativeid="' + wid + '-box"]');
      if (!bx) continue;
      const r = w.getBoundingClientRect();
      if (r.width < 0.5) continue;
      bubs.push({
        id: wid,
        x: +(r.x + r.width / 2).toFixed(2),
        op: +(+getComputedStyle(bx).opacity || 0).toFixed(3),
        text: (w.innerText || '').replace(/[\\s]+/g, ' ').trim(),
      });
    }
    const fxs = [];
    for (const parts of limbs) {
      let x0 = Infinity; let x1 = -Infinity;
      for (const el of parts) {
        const r = el.getBoundingClientRect();
        if (r.width < 0.5 || r.height < 0.5) continue;
        if (r.x < x0) x0 = r.x;
        if (r.x + r.width > x1) x1 = r.x + r.width;
      }
      fxs.push(x1 > x0 ? +((x0 + x1) / 2).toFixed(2) : null);
    }
    window.__bubLog.push({ t: +(performance.now() - t0).toFixed(1), b: bubs, f: fxs });
    window.__bubTick = requestAnimationFrame(tick);
  };
  window.__bubTick = requestAnimationFrame(tick);
  return true;
})()`;

/** Take the trace and start a fresh one, so each beat is measured on its own. */
const DRAIN = "(()=>{const l=window.__bubLog||[];window.__bubLog=[];return l})()";

/** Was the box readable in this frame? Below this it is arriving or leaving. */
const VISIBLE = 0.35;

async function watch(tab, id) {
  const { evalJs } = tab;
  await tab.send('Page.navigate', { url: 'about:blank' });
  await new Promise((r) => setTimeout(r, 120));
  await tab.send('Page.navigate', { url: `http://localhost:${WEB}/${SLUG}?id=${id}&notour=1` });
  for (let k = 0; k < STAGE_TRIES; k++) {
    if (await evalJs(`!!${STAGE}`)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!await evalJs(`!!${STAGE}`)) return { id, skip: 'never rendered a stage', threw: true };

  const cuts = [];
  const blinks = [];
  let gaps = 0;
  let teleport = 0;
  let snap = 0;
  let snapAt = '';
  // NULL UNTIL A WINDOW QUALIFIES, not 1. Initialised to 1 and only lowered, a
  // bubble that kept ALL of his travel — the best case, and what the fix produces
  // — left `kept` at exactly 1, which the report read as "this rule was never
  // exercised" and turned into a FAIL. The best possible result must not be
  // indistinguishable from no result.
  let kept = null;
  let keptAt = '';
  let seen = 0;
  let beats = 0;
  const acts = [];
  let answered = false;

  if (!await evalJs(INSTALL)) return { id, skip: 'the recorder would not install', threw: true };

  // ENOUGH ITERATIONS TO GET PAST BOTH QUESTIONS. Answering a graded beat costs
  // one iteration and advancing off it costs another, so a lesson of eleven beats
  // needs thirteen — and a run that stops short reports the beats it never reached
  // as clean.
  for (let b = 0; b < 15; b += 1) {
    await new Promise((r) => setTimeout(r, WATCH_MS));
    const frames = await evalJs(DRAIN);
    beats += 1;
    if (!frames || frames.length < 8) { gaps += 1; acts.push(await evalJs(TAP_STAGE)); continue; }

    // The strongest bubble on stage, per frame — leaving ones included, since an
    // exit is exactly when the reader is watching one.
    const top = frames.map((f) => {
      let best = null;
      for (const x of f.b) if (!best || x.op > best.op) best = x;
      return best;
    });

    // ── CUT · the words changing where they can be read ─────────────────────
    //
    // One ELEMENT, its own words, between two frames the browser painted. It used
    // to be two polls 90ms apart and could not tell a swap from a fade-and-return
    // — run across two lanes it reported `logic-arguments-37` cutting its sentence
    // in half, and the same "defect" moved to another lesson on the next run. A
    // finding that changes lesson between runs is a fact about the instrument.
    for (let k = 1; k < frames.length; k += 1) {
      for (const n of frames[k].b) {
        const p = frames[k - 1].b.find((z) => z.id === n.id);
        if (!p || p.text === n.text) continue;
        if (p.op <= VISIBLE || n.op <= VISIBLE) continue;
        cuts.push(`beat ${b}: "${p.text.slice(0, 24)}" -> "${n.text.slice(0, 24)}" at opacity ${n.op.toFixed(2)}, ${(frames[k].t - frames[k - 1].t).toFixed(0)}ms apart`);
      }
    }

    // ── BLINK · bright, gone, bright ────────────────────────────────────────
    //
    // The reader's *"it needs to disappear and reappear really smoothly"*, stated
    // as the one thing a legitimate transition can never do. An exit takes 240ms
    // to reach nothing and the next thought is 620ms behind it, so a bubble that
    // is bright, dark and bright again inside 450ms did not leave — it dropped a
    // frame's worth of itself and came back, which is what a remount looks like.
    for (let k = 0; k < frames.length; k += 1) {
      if (!top[k] || top[k].op < 0.5) continue;
      let dark = -1;
      for (let j = k + 1; j < frames.length && frames[j].t - frames[k].t < BLINK_MS; j += 1) {
        if (dark < 0 && (!top[j] || top[j].op < 0.12)) dark = j;
        else if (dark >= 0 && top[j] && top[j].op > 0.5) {
          blinks.push(`beat ${b}: ${top[k].op.toFixed(2)} -> ${top[dark] ? top[dark].op.toFixed(2) : 'gone'} -> ${top[j].op.toFixed(2)} in ${(frames[j].t - frames[k].t).toFixed(0)}ms`);
          k = j; break;
        }
      }
    }

    // ── SNAP · how much of itself a bubble can gain or lose in one frame ────
    //
    // NORMALISED BY THE FRAME GAP, which is what makes it honest on a slow
    // machine: the entrance moves the box about 0.10 of its opacity per 16ms and
    // the exit about 0.07, so a dropped frame legitimately doubles a step and a
    // SNAP is a whole bubble arriving in one. Dividing by the gap measures the
    // rate rather than the step, and a throttled tab then reports the same number
    // a fast one does.
    for (let k = 1; k < frames.length; k += 1) {
      const dt = frames[k].t - frames[k - 1].t;
      // A GAP SHORTER THAN A FRAME IS STILL ONE FRAME. Two reads can land inside a
    // single painted frame — 9ms was measured — and dividing by 0.54 turned a
    // legitimate 0.20 step into a 0.38 "snap". The divisor is what a frame costs
    // at worst, never less than one.
    if (dt <= 0 || dt > 120) continue;
    const frames16 = Math.max(1, dt / 16.7);
      for (const n of frames[k].b) {
        const p = frames[k - 1].b.find((z) => z.id === n.id);
        if (!p) continue;
        const rate = Math.abs(n.op - p.op) / frames16;
        if (rate > snap) { snap = rate; snapAt = `beat ${b}: ${p.op.toFixed(2)} -> ${n.op.toFixed(2)} in ${dt.toFixed(0)}ms`; }
      }
    }

    // WHICH FIGURE THIS BUBBLE BELONGS TO, decided once and then held — the
    // nearest one on the first frame the box is readable.
    const readable = frames.filter((f, k) => top[k] && top[k].op > VISIBLE);
    let lead = -1;
    if (readable.length) {
      const f = readable[0];
      const bub = f.b.reduce((x, y) => (x.op > y.op ? x : y));
      let near = Infinity;
      for (let k = 0; k < f.f.length; k += 1) {
        if (f.f[k] === null) continue;
        const d = Math.abs(f.f[k] - bub.x);
        if (d < near) { near = d; lead = k; }
      }
    }
    const fxOf = (f) => (lead >= 0 && f.f && f.f[lead] !== undefined ? f.f[lead] : null);
    const bubOf = (f) => (f.b.length ? f.b.reduce((x, y) => (x.op > y.op ? x : y)) : null);

    // ── TELEPORT · the box moving while the man does not ────────────────────
    for (let k = 1; k < frames.length; k += 1) {
      const p = bubOf(frames[k - 1]); const n = bubOf(frames[k]);
      const pf = fxOf(frames[k - 1]); const nf = fxOf(frames[k]);
      if (!p || !n || p.id !== n.id || pf === null || nf === null) continue;
      if (p.op <= VISIBLE || n.op <= VISIBLE) continue;
      if (Math.abs(nf - pf) > 1.5) continue;
      teleport = Math.max(teleport, Math.abs(n.x - p.x));
    }

    // ── ADRIFT · what each of them did over the window they share ───────────
    const vis = readable.filter((f) => fxOf(f) !== null && bubOf(f));
    if (vis.length >= 2) {
      seen += 1;
      const first = vis[0]; const last = vis[vis.length - 1];
      const walked = Math.abs(fxOf(last) - fxOf(first));
      if (walked > REAL_WALK) {
        const moved = Math.abs(bubOf(last).x - bubOf(first).x);
        if (kept === null || moved < kept) { kept = moved; keptAt = `beat ${b}: he moved ${walked.toFixed(0)}px, the box ${moved.toFixed(0)}px`; }
      }
    }

    if (process.env.BUBBLE_TRACE) {
      const w = vis.length >= 2 ? Math.abs(fxOf(vis[vis.length - 1]) - fxOf(vis[0])) : -1;
      console.log(`      beat ${b}: ${frames.length} frames, ${readable.length} readable, lead ${lead}, walked ${w.toFixed(1)}px, last act ${acts[acts.length - 1] || '-'}`);
    }
    // ANSWER, THEN ADVANCE. An analogue control stays mounted after it has been
    // answered, so a harness that always reaches for the control it can see drives
    // the same beat again and again — six windows on one `split` before this. What
    // a reader does is answer once and tap on, so that is what this does.
    acts.push(answered ? await evalJs(TAP_STAGE) : await evalJs(ANSWER_OR_TAP));
    answered = !answered && acts[acts.length - 1] !== 'stage';
  }

  return {
    id,
    beats,
    seen,
    cuts,
    blinks,
    gaps,
    teleport: +teleport.toFixed(1),
    snap: +snap.toFixed(2),
    snapAt,
    kept,
    keptAt,
  };
}

// THE DEFAULT WORKLIST, chosen rather than sampled: the lessons whose figure
// walks FURTHEST on a beat that still carries a thought, so the follow rule has
// something to measure at all.
//
// IT HAD TO BE RE-DERIVED WHEN THE TABLE CHANGED, and that is the sort of thing
// that rots quietly. `make:thoughts` now shows two thoughts a lesson rather than
// every beat that had a line, so most of the old list no longer has a bubble on a
// walking beat — and a worklist that has stopped covering the rule it was chosen
// for reports a clean sweep with nothing in it. `node scripts/pick-bubble-work.mjs`
// re-derives it; the guards below are what make a hollow run fail rather than pass.
// Pass a JSON file of ids to look at anything else.
const DEFAULT = [
  'metaphysics-being-35',      // 202 units under a thought, the longest in the corpus
  'logic-arguments-19',        // 136
  'logic-arguments-20',        // 136
  'logic-arguments-21',        // 136
  'epistemology-knowledge-24', // 136
  'ethics-ethics-10',          // 100
  'metaphysics-being-13',      // 98
  'metaphysics-being-15',      // 98
  'political-political-15',    // 98
  'aesthetics-aesthetics-11',  // 98
  'epistemology-knowledge-2',  // 98
  'epistemology-knowledge-21', // 98
];

const ROUTE_SRC = `// WRITTEN BY scripts/check-bubble.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { setToursOff } from '@/components/lesson/cinematic/tourFlag';

export default function PreviewBubble() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  setToursOff(q?.get('notour') === '1');
  const id = q?.get('id') ?? '';
  const found = getLessonById(id);
  const Comp = (CINEMATIC as Record<string, any>)[id];
  if (!go || !found || !Comp) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
  return <Comp lesson={found.lesson} />;
}
`;

(async () => {
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : DEFAULT;
  const { release } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-bubble' });

  console.log(`\nTHE THOUGHT BUBBLE, IN THE RENDER\n`);
  console.log(`  ${ids.length} lesson(s), ${WATCH_MS}ms a beat\n`);

  const results = [];
  let next = 0; let done = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(LANES, ids.length) }, async () => {
      for (;;) {
        const k = next++;
        if (k >= ids.length) return;
        let r; let tab = null;
        try { tab = await makeTab(); r = await watch(tab, ids[k]); }
        catch (e) { r = { id: ids[k], skip: 'threw: ' + String(e).slice(0, 70), threw: true }; }
        finally { if (tab) { try { await tab.close(); } catch { /* gone */ } } }
        results.push(r); done += 1;
        const tag = r.skip
          ? r.skip
          : `${String(r.seen).padStart(2)} beat(s) with a readable box · cuts ${String(r.cuts.length).padStart(2)} · blinks ${String(r.blinks.length).padStart(2)} · snap ${r.snap.toFixed(2)} · teleport ${String(r.teleport).padStart(5)}px · the box moved ${r.kept === null ? ' n/a' : `${r.kept.toFixed(0)}px`}`;
        console.log(`  ${String(done).padStart(3)}/${ids.length}  ${r.id.padEnd(28)} ${tag}`);
      }
    }));
  } finally {
    release();
  }

  const judged = results.filter((r) => !r.skip);
  const unmeasured = results.filter((r) => r.threw);
  const cut = judged.filter((r) => r.cuts.length > FLOORS.cut);
  const tele = judged.filter((r) => r.teleport > FLOORS.teleport);
  const ad = judged.filter((r) => r.kept !== null && r.kept < FLOORS.move);
  const boxesSeen = judged.reduce((a, r) => a + r.seen, 0);
  const blink = judged.filter((r) => r.blinks.length > FLOORS.blink);
  const snapped = judged.filter((r) => r.snap > FLOORS.snap);
  const thinFrames = judged.reduce((a, r) => a + (r.gaps || 0), 0);

  console.log('');
  let bad = 0;
  const ok = (m, d) => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
  const no = (m, d) => { bad += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

  if (!boxesSeen) {
    // A SWEEP THAT MEASURED NOTHING MUST NOT LOOK CLEAN. `check:readable` shipped
    // that exact failure: a probe that threw read as a lesson that had finished,
    // and 186 lessons came back with no findings and exit 0.
    no('no readable bubble was seen at all', 'the probe measured nothing — check the ids and the route');
  } else {
    ok(`${boxesSeen} beat(s) showed a readable box`, `across ${judged.length} lesson(s)`);
  }

  if (cut.length) {
    no(`${cut.length} lesson(s) change the sentence in front of the reader`, `budget ${FLOORS.cut}`);
    for (const r of cut.slice(0, 4)) for (const c of r.cuts.slice(0, 2)) console.log(`          ${r.id}  ${c}`);
  } else ok('no bubble swaps its words while it can be read');

  if (tele.length) {
    no(`${tele.length} lesson(s) jump the box while the figure stands still`, `worst ${Math.max(...tele.map((r) => r.teleport))}px, budget ${FLOORS.teleport}px`);
    for (const r of tele.slice(0, 4)) console.log(`          ${r.id}  ${r.teleport}px`);
  } else ok(`no box moves while the figure does not`, `budget ${FLOORS.teleport}px`);

  if (blink.length) {
    no(`${blink.length} lesson(s) blink the bubble out and back`, 'a transition never does this');
    for (const r of blink.slice(0, 4)) for (const c of r.blinks.slice(0, 2)) console.log(`          ${r.id}  ${c}`);
  } else ok('no bubble goes dark and comes back', `within ${BLINK_MS}ms`);

  const worstSnap = judged.length ? Math.max(...judged.map((r) => r.snap)) : 0;
  if (snapped.length) {
    no(`${snapped.length} lesson(s) snap the bubble on or off`, `worst ${worstSnap.toFixed(2)} of its opacity in a frame, budget ${FLOORS.snap}`);
    for (const r of snapped.slice(0, 4)) console.log(`          ${r.id}  ${r.snap} — ${r.snapAt}`);
  } else ok('the bubble fades rather than switching', `worst ${worstSnap.toFixed(2)} of its opacity a frame, budget ${FLOORS.snap}`);

  const walkers = judged.filter((r) => r.kept !== null);
  if (ad.length) {
    no(`${ad.length} lesson(s) leave the bubble standing while he walks`, `worst ${Math.min(...ad.map((r) => r.kept)).toFixed(1)}px, floor ${FLOORS.move}px`);
    for (const r of ad.slice(0, 4)) console.log(`          ${r.id}  moved ${r.kept.toFixed(1)}px — ${r.keptAt}`);
  } else if (!walkers.length) {
    // NOT SILENTLY CLEAN. If no lesson in the list walked far enough while a box
    // was readable, this rule judged nothing and must say so rather than pass.
    no('no lesson walked far enough to test the follow', 'add one whose figure crosses the stage under a thought');
  } else {
    ok(`every visible bubble travels with the figure`, `${walkers.length} lesson(s) walked far enough to test it · the box moved at least ${Math.min(...walkers.map((r) => r.kept)).toFixed(0)}px, floor ${FLOORS.move}px`);
  }

  if (thinFrames) {
    // Said out loud rather than swallowed: a beat whose trace came back almost
    // empty is a beat nothing was judged on, and a browser that is being starved
    // makes more of them. A run reporting many is a run to take again.
    console.log(`
  ~ ${thinFrames} beat(s) recorded too few frames to judge — re-run if that number is large.`);
  }

  if (unmeasured.length) {
    console.log(`\n  ~ ${unmeasured.length} lesson(s) could not be measured:`);
    for (const r of unmeasured) console.log(`      ${r.id}: ${r.skip}`);
  }

  console.log(bad ? `\n${bad} rule(s) broken.\n` : '\nthe bubble follows him, and never changes its mind where it shows.\n');
  process.exit(bad ? 1 : 0);
})();
