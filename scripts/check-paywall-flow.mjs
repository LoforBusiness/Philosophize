// THE HARD PAYWALL AND THE PROFESSOR'S INTRO, WALKED THROUGH IN A BROWSER.
//
//   node scripts/check-paywall-flow.mjs            (npm run check:paywall-flow)
//
// The owner's rules (2026-09-25), each a case below, drawn with the REAL screens —
// Home's Quick Start card, the Learn tab, the intro screen and the lesson route — in
// one preview route with a seeded store:
//
//   1. Not seen: Quick Start IS the intro, Learn shows the intro and no branch, and
//      nothing plays by itself — five seconds on each screen and no film has started.
//   2. A free reader who skips the intro meets the paywall (source: intro).
//   3. A reader on the trial who skips it does not: the film just ends.
//   4. Seen: Quick Start names a lesson and Learn shows the six branches.
//   5. A free reader who has seen it and opens a lesson meets the paywall.
//   6. A reader with the Pass who has seen it opens the lesson.
//   7. The backstop: a lesson opened before the intro has been seen plays it first.
//
// It needs Metro and a Chrome, like every §21 harness, so it is not in `npm run
// check`; ports 8853/9393 by default (sheet-pass's). It writes app/previewflow.tsx
// on the way in and deletes it on the way out.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9393);
const WEB = +(process.env.WEB_PORT || 8853);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 240);
const ROUTE = 'app/previewflow.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewflow.txt'), 'utf8');
const LESSON = 'logic-arguments-1';

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'check-paywall-flow', keep: !!process.env.FLOW_KEEP });
try {
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
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true }))?.result?.value;
  const has = (nid) => ev(`!!document.getElementById(${JSON.stringify(nid)})`);
  const text = () => ev(`(document.body.innerText || '').replace(/\\s+/g, ' ')`);
  /** Poll until `cond` (a page expression) is true; reload a not-found page on the way. */
  const until = async (cond, tries = MOUNT_TRIES) => {
    for (let i = 0; i < tries; i++) {
      if (await ev(cond)) return true;
      if (i % 20 === 19 && (await ev(`/doesn.t exist/.test(document.body.innerText || '')`))) await send('Page.reload', {});
      await wait(250);
    }
    return false;
  };
  const open = async (qs) => {
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewflow?${qs}` });
    return until(`!!document.getElementById('flow-root')`);
  };
  const click = (label) => ev(`(() => { const e = [...document.querySelectorAll('[aria-label]')].find((n) => n.getAttribute('aria-label') === ${JSON.stringify(label)}); if (!e) return false; e.click(); return true; })()`);
  // FLOW_SHOTS=<dir> saves a picture of each door as the proof loads it.
  const snap = async (name) => {
    if (!process.env.FLOW_SHOTS) return;
    fs.mkdirSync(process.env.FLOW_SHOTS, { recursive: true });
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) fs.writeFileSync(path.join(process.env.FLOW_SHOTS, `${name}.png`), Buffer.from(shot.data, 'base64'));
  };
  const seenFlag = () => ev(`(() => { try { return JSON.parse(localStorage.getItem('philosophize-userdata') || '{}').state?.seenProfessorIntro ?? null; } catch { return null; } })()`);

  // ── 1 ─────────────────────────────────────────────────────────────────────
  console.log('\n1 · not seen: both doors are the intro, and nothing plays by itself');
  ok(await open('case=home&pass=free'), 'Home mounted');
  await wait(1500);
  let t = await text();
  ok(t.includes('QUICK START · INTRO') && t.includes('START THE INTRO'), 'Quick Start is the intro', t.slice(0, 120));
  await snap('home-door');
  await wait(5000);
  ok(!(await has('professor-intro')), 'and five seconds later no film has started');
  // THE WHOLE OF HOME, not just its card. The intro takes the Quick Start slot and
  // nothing else: every other section of Home is still there for a reader who has
  // not watched it (owner, 2026-09-25: "make sure the home tab still has everything
  // it had before").
  ok(await open('case=homefull&pass=free'), 'the whole Home screen mounted');
  await until(`/DAILY REFLECTION/.test(document.body.innerText || '')`, 80);
  await wait(2500);
  t = await text();
  for (const part of ['QUICK START · INTRO', 'DAILY REFLECTION', 'THINKER OF THE DAY', 'YOUR STREAK']) {
    ok(t.includes(part), `Home still shows ${part}`, t.includes(part) ? '' : t.slice(0, 160));
  }
  if (process.env.FLOW_SHOTS) {
    const h = await ev(`Math.ceil(document.documentElement.scrollHeight)`);
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: Math.min(4000, Math.max(844, h)), deviceScaleFactor: 2, mobile: true });
    await wait(800);
    await snap('home-full');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  }
  await wait(3000);
  ok(!(await has('professor-intro')), 'and Home does not start the film by itself');

  ok(await open('case=learn&pass=free'), 'Learn mounted');
  await until(`!!document.getElementById('learn-intro')`, 60);
  ok(await has('learn-intro'), 'Learn shows the intro card');
  await wait(1200);
  await snap('learn-door');
  const branches = await ev(`[...document.querySelectorAll('[aria-label]')].filter((n) => /^Open /.test(n.getAttribute('aria-label'))).length`);
  ok(branches === 0, 'and no branch card', `${branches} branch cards`);
  await wait(5000);
  ok(!(await has('professor-intro')), 'and five seconds later no film has started');

  // ── 2 ─────────────────────────────────────────────────────────────────────
  console.log('\n2 · a free reader skips the intro and meets the paywall');
  ok(await open('case=intro&pass=free&from=learn'), 'the intro screen mounted');
  ok(await until(`!!document.getElementById('professor-intro')`, 80), 'the film is playing');
  ok(await click('Skip the introduction'), 'Skip pressed');
  ok(await until(`!!document.getElementById('hard-paywall')`, 60), 'the paywall is up');
  t = await text();
  ok(t.includes('Unlock every lesson'), 'and it is the one paywall');
  await wait(1800);
  await snap('after-intro-paywall');
  ok((await seenFlag()) === true, 'and the intro is marked seen');

  // ── 3 ─────────────────────────────────────────────────────────────────────
  console.log('\n3 · a reader on the trial skips it and meets no paywall');
  ok(await open('case=intro&pass=trial&from=learn'), 'the intro screen mounted');
  ok(await until(`!!document.getElementById('professor-intro')`, 80), 'the film is playing');
  ok(await click('Skip the introduction'), 'Skip pressed');
  await wait(2500);
  ok(!(await has('hard-paywall')), 'no paywall for somebody holding the trial');
  ok((await seenFlag()) === true, 'and the intro is marked seen');

  // ── 4 ─────────────────────────────────────────────────────────────────────
  console.log('\n4 · seen: the doors are the lessons again');
  ok(await open('case=home&seen=1&pass=paid'), 'Home mounted');
  await wait(1500);
  t = await text();
  ok(!t.includes('INTRO') && t.includes('START LESSON'), 'Quick Start names a lesson', t.slice(0, 120));
  ok(await open('case=learn&seen=1&pass=paid'), 'Learn mounted');
  await until(`[...document.querySelectorAll('[aria-label]')].some((n) => /^Open /.test(n.getAttribute('aria-label')))`, 60);
  const six = await ev(`[...document.querySelectorAll('[aria-label]')].filter((n) => /^Open /.test(n.getAttribute('aria-label'))).length`);
  ok(six === 6 && !(await has('learn-intro')), 'Learn shows the six branches and no intro', `${six} branch cards`);

  // ── 5 ─────────────────────────────────────────────────────────────────────
  console.log('\n5 · seen, free, a lesson: the paywall');
  ok(await open(`case=lesson&seen=1&pass=free&lessonId=${LESSON}`), 'the lesson route mounted');
  ok(await until(`!!document.getElementById('hard-paywall')`, 80), 'the paywall is drawn instead of the lesson');

  // ── 6 ─────────────────────────────────────────────────────────────────────
  console.log('\n6 · seen, with the Pass, a lesson: the lesson');
  ok(await open(`case=lesson&seen=1&pass=paid&lessonId=${LESSON}`), 'the lesson route mounted');
  await wait(4000);
  ok(!(await has('hard-paywall')) && !(await has('professor-intro')), 'no paywall and no intro');
  // The lesson's own stage, after its loader: nothing weaker counts as a lesson.
  ok(await until(`!!document.getElementById('stage-clip')`, 120), 'the lesson’s stage is up');

  // ── 7 ─────────────────────────────────────────────────────────────────────
  console.log('\n7 · the backstop: a lesson opened before the intro plays the intro first');
  ok(await open(`case=lesson&pass=free&lessonId=${LESSON}`), 'the lesson route mounted');
  ok(await until(`!!document.getElementById('professor-intro')`, 80), 'the intro plays first');
  ok(await click('Skip the introduction'), 'Skip pressed');
  ok(await until(`!!document.getElementById('hard-paywall')`, 60), 'then the paywall, for a free reader');

  sock.close();
} finally {
  release();
}
console.log(bad === 0 ? '\nPASS — the doors, the intro and the paywall do what the owner asked.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
