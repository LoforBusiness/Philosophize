// LOOK AT THE THREE PASS SCREENS, AND MEASURE THEM.
//
// §21's rule: a contact sheet cannot catch a module-load or React fault, because
// it never imports the component. These three screens pull in the rank seal, the
// struck tiles, the metal plates, a gradient column and a ticking clock — so they
// get loaded for real, in a browser, exactly as the app draws them.
//
// It reports three things no screenshot answers by itself:
//   · did React actually mount, or is this a blank page that photographs well;
//   · is any element wider than the viewport (the page must never scroll
//     sideways) or clipped inside its own box;
//   · did every part that is supposed to be on the screen actually paint.
//
// And it writes a PNG per screen so the thing can be looked at.
//
// USAGE — ports default away from every other harness (8847/9382, 8852/9392) so
// this can run beside them:
//   npx expo start --web --port 8853 --clear
//   curl -s -o /dev/null "http://localhost:8853/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9393 --user-data-dir=<tmp>
//   node scripts/sheet-pass.mjs
//
// It writes app/previewpass.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9393);
const WEB = +(process.env.WEB_PORT || 8853);
const OUT = process.env.OUT_DIR || 'scripts/.pass-shots';

const ROUTE = 'app/previewpass.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewpass.txt'), 'utf8');

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the probe ────────────────────────────────────────────────────────────────
//
// Runs in the page. Everything it asks is something arithmetic cannot answer:
// whether React committed, and what the layout engine actually did with the text.
const PROBE = `(() => {
  const root = document.getElementById('pass-root');
  if (!root) return JSON.stringify({ mounted: false });

  const vw = document.documentElement.clientWidth;
  const seen = new Set();
  const overflow = [];
  const clipped = [];

  for (const el of root.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;

    const id = el.getAttribute('data-testid');
    if (id) { seen.add(id); }

    // THE PAGE MUST NEVER SCROLL SIDEWAYS. A struck panel pinned to the right,
    // or a run of ticks that is meant to overflow its own clipped box, are both
    // one mistake away from widening the document instead.
    if (r.right > vw + 1 || r.left < -1) {
      // ...unless an ancestor clips it, which is exactly what the tick run does.
      let n = el.parentElement, clippedBy = null;
      while (n && n !== document.body) {
        const ps = getComputedStyle(n);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') { clippedBy = n; break; }
        n = n.parentElement;
      }
      if (!clippedBy) {
        overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40),
                        left: Math.round(r.left), right: Math.round(r.right), vw,
                        text: (el.textContent || '').trim().slice(0, 40) });
      }
    }

    // A <Text> whose content does not fit the box it was given. numberOfLines
    // truncates with an ellipsis, which is deliberate; a horizontal overflow of
    // a single line is not.
    if (el.childElementCount === 0 && (el.textContent || '').trim()) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && s.overflow !== 'hidden' && s.textOverflow !== 'ellipsis') {
        clipped.push({ text: el.textContent.trim().slice(0, 40), over: Math.round(over) });
      }
    }
  }

  // Words actually on the page, for "did the part I expect exist".
  const text = root.innerText.replace(/\\s+/g, ' ').trim();

  return JSON.stringify({
    mounted: true,
    docWider: document.documentElement.scrollWidth > vw + 1,
    scrollW: document.documentElement.scrollWidth, vw,
    height: Math.round(root.getBoundingClientRect().height),
    // flex:1 makes the root exactly viewport-tall, so the CONTENT height is the
    // scroll extent of whatever inside it actually scrolls. Without this the
    // screenshot below silently photographs one screenful and looks complete.
    content: Math.max(...[...root.querySelectorAll('*')]
      .map((e) => (e.scrollHeight > e.clientHeight + 1 ? e.scrollHeight : 0)), 0),
    marks: [...seen],
    overflow, clipped,
    text: text.slice(0, 6000),
  });
})()`;

// ── screens to visit ─────────────────────────────────────────────────────────
const SCREENS = [
  // Each `want` names a part that has to have PAINTED, not a phrase that happens
  // to be in the file — the point of loading the real screen is that a component
  // can be imported, typechecked and still render nothing.
  // ── THE PASS TAB ─────────────────────────────────────────────────────────
  //
  // Two certificates, a stickman and a frame drawn from a measured height. That
  // last one is why this screen has to be LOADED rather than reasoned about: the
  // frame is an SVG sized from onLayout, so a mistake in it does not fail a type
  // check or a contact sheet — it renders at the wrong size, or not at all.
  { key: 'pass-tab', q: 's=tab',
    want: ['THE SCHOLAR’S PASS', 'WHAT THE PASS ADDS', 'AND EVERYTHING BELOW, AS ALWAYS',
           'ISSUED TO', 'THE DAY PASS', 'WHAT YOU HOLD TODAY', 'WHERE IT STOPS',
           'The whole library', 'Replay what you finished'] },
  { key: 'pass-tab-new', q: 's=tab&seed=new',
    want: ['THE SCHOLAR’S PASS', 'THE DAY PASS'] },
  { key: 'pass-tab-pro', q: 's=tab&pro=1',
    want: ['THE SCHOLAR’S PASS', 'Yours already'] },
  { key: 'paywall', q: 's=paywall',
    want: ['ADMIT THE BEARER', 'FREE AGAINST THE PASS', 'WHERE YOU ARE',
           'AT 1 LESSON A DAY', 'no wait at all', 'Start —'] },
  // A reader on day one: every bar empty, and the wait is the whole library.
  { key: 'paywall-new', q: 's=paywall&seed=new',
    want: ['FREE AGAINST THE PASS', '0 of 222 lessons opened', '222 more days'] },
  { key: 'paywall-pro', q: 's=paywall&pro=1', want: ['You’re a Scholar', 'ACTIVE'] },
  { key: 'limit', q: 's=limit',
    want: ['WAITING FOR YOU', 'Opens in', 'TODAY BANKED', 'DAY PASS', 'USED ·'] },
  { key: 'locked-replay', q: 's=locked&k=replay',
    want: ['already finished', 'WHAT THE PASS OPENS', 'Reopen'] },
  { key: 'locked-ahead', q: 's=locked&k=ahead',
    want: ['jump ahead', 'WHAT THE PASS OPENS'] },
  // The one money cannot fix: no paywall, and the lesson they should open named.
  { key: 'locked-unreached', q: 's=locked&k=unreached',
    want: ['Not yet', 'OPEN THIS ONE INSTEAD'], notWant: ['WHAT THE PASS OPENS'] },
];

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-pass', keep: !!process.env.PASS_KEEP });

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

try {
  fs.mkdirSync(OUT, { recursive: true });
  // A tab this script made, not /json/list[0] — attaching to the wrong target
  // makes Page.navigate a silent no-op (§19).
  const tab = await put('/json/new?about:blank');
  const sock = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id; pending.set(n, res);
    sock.send(JSON.stringify({ id: n, method, params }));
  });
  await new Promise((r) => { sock.onopen = r; });
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  // Only the front tab of a headless window is laid out; a background one never
  // fires its ResizeObserver, so every rect comes back zero (measure-must).
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });

  for (const sc of SCREENS) {
    console.log(`\n${sc.key}`);
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewpass?${sc.q}` });

    // POLL FOR THE MOUNT, DO NOT SLEEP AT IT. A fixed wait raced the bundle:
    // the same seven screens came back four mounted and three "module or render
    // fault" on one run and the reverse on the next, which reads exactly like a
    // real intermittent bug and is not one. Metro compiles the first navigation
    // to a route variant, so the honest condition is "is it on the page yet".
    let up = false;
    for (let i = 0; i < 80 && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('pass-root');
          return e ? e.getBoundingClientRect().height : 0; })()`,
        returnByValue: true,
      });
      up = (probe?.result?.value ?? 0) > 100;
      if (!up) await wait(250);
    }
    // Fonts, and Moti's enter animations, once it is actually there.
    await wait(1200);

    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    let r;
    try { r = JSON.parse(result.value); } catch { r = { mounted: false, raw: result.value }; }

    ok(r.mounted, 'React mounted and the screen drew itself',
      r.mounted ? `${r.height}px viewport · ${r.content || r.height}px of content` : 'no #pass-root — a module or render fault');
    if (!r.mounted) continue;

    ok(!r.docWider, 'the page does not scroll sideways', `doc ${r.scrollW} vs viewport ${r.vw}`);
    ok(r.overflow.length === 0, 'nothing sticks out past the viewport unclipped',
      r.overflow.slice(0, 3).map((o) => `${o.tag} "${o.text}" ${o.left}–${o.right}`).join(' · ') || 'clear');
    ok(r.clipped.length === 0, 'no line of text is cut off inside its own box',
      r.clipped.slice(0, 3).map((c) => `"${c.text}" +${c.over}px`).join(' · ') || 'clear');

    for (const w of sc.want) {
      ok(r.text.includes(w), `it says "${w}"`,
        r.text.includes(w) ? '' : `not on the page. It says: ${r.text.slice(0, 220)}…`);
    }
    for (const w of sc.notWant ?? []) {
      ok(!r.text.includes(w), `it does NOT say "${w}"`,
        r.text.includes(w) ? 'a paywall in front of something money cannot buy' : '');
    }

    // MEASURED AT PHONE HEIGHT, PHOTOGRAPHED TALL. `captureBeyondViewport` is
    // the obvious way to get a whole scrolling page and it HANGS in
    // --headless=new when paired with a clip (§19); growing the viewport for the
    // shot and putting it back is the same picture with no trap in it. The
    // measurements above were all taken at 844, which is the height that matters.
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: Math.min(6000, Math.max(900, (r.content || r.height) + 120)),
      deviceScaleFactor: 2, mobile: true,
    });
    await wait(700);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) {
      fs.writeFileSync(path.join(OUT, `${sc.key}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`        → ${OUT}/${sc.key}.png`);
    }
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
    });
  }
  sock.close();
} finally {
  release();
}

console.log(bad === 0 ? '\nPASS — all three screens render and fit.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
