// DOES THE STAGE ACTUALLY MOVE WHEN THE READER WORKS THE CONTROL?
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/check-moved.mjs '["epistemology-knowledge-23", …]'
//
// `check:react` is a SOURCE check: it asks whether the scene reads the control's
// value on its graded beat, and — since the 51 dead flags — whether the flag it
// reads can ever fire. Neither question is the same as "the picture moved", and
// the whole reason those 51 went unnoticed for so long is that every source-level
// question about them answered yes.
//
// So this one works the control in a real browser and measures the stage before
// and after. It is the end-to-end version, and it is the only thing that can
// catch a mapping that is wired, fires, and moves nothing — a table of identical
// values, a track the scene no longer draws, a `pickPos` the control never
// writes.
//
// It reads the STAGE only. The deck under it changes on every answer by design
// (the reading, the explanation, the reveal), so measuring the whole page would
// report every lesson as passing.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE = `${process.env.MOVED_ROUTE || 'previewmoved'}.tsx`;

const ROUTE_SRC = `// WRITTEN BY scripts/check-moved.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewMoved() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const id = q?.get('id') ?? '';
  const found = getLessonById(id);
  const Comp = (CINEMATIC as Record<string, any>)[id];
  if (!go || !found || !Comp) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
  return <Comp lesson={found.lesson} />;
}
`;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const TAP = `(() => { const w=innerWidth,h=innerHeight; const el=document.elementFromPoint(w/2,h*0.28);
  if(!el) return false; el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:w/2,clientY:h*0.28})); return true; })()`;

/** Every drawn box inside the stage, as one comparable string per element. */
const STAGE = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return null;
  const out = [];
  for (const el of clip.querySelectorAll('div,span')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const s = getComputedStyle(el);
    out.push([Math.round(r.x*10), Math.round(r.y*10), Math.round(r.width*10), Math.round(r.height*10), s.opacity].join(','));
  }
  return out;
})()`;

/**
 * Press a scene target, SCOPED TO THE STAGE. Taking the first [role=button] in
 * the document takes the header's back arrow, which leaves the lesson entirely
 * and then measures some other screen (§21).
 */
const ANSWER_TARGET = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return '';
  const c = clip.getBoundingClientRect();
  const els = [...document.querySelectorAll('[role="button"],[tabindex]')]
    .filter((e) => e.getAttribute('data-testid') !== 'thinker-name')
    .filter((e) => e.getAttribute('aria-disabled') !== 'true')
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 24 && r.height > 10 && r.top >= c.top - 2 && r.top < c.bottom + 240; });
  if (!els.length) return '';
  els[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
  return 'target';
})()`;

/** Is the player waiting for an answer? Needs no beat index and cannot drift. */
const WAITING = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return false;
  for (const id of ['drag-strip','split-bar','shape-plot','sort-bins','poll-ballot','field-pad','lever-arc']) {
    if (document.getElementById(id)) return true;
  }
  return false;
})()`;

const ids = process.argv[2] ? JSON.parse(process.argv[2]) : [];
if (!ids.length) { console.log('usage: node scripts/check-moved.mjs \'["lesson-id", …]\''); process.exit(1); }

// MOVED_REUSE names a preview route that is ALREADY in the bundle. Adding a route
// makes Expo Router rebuild its table, and while another harness is hammering the
// same Metro that rebuild can outlast any sane wait — which this script reported,
// correctly and uselessly, as four lessons that NEVER RENDERED.
const reuse = process.env.MOVED_REUSE;
const release = reuse
  ? () => {}
  : claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-moved', keep: !!process.env.MOVED_KEEP }).release;
const SLUG = reuse || path.basename(ROUTE, '.tsx');
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;
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

const rows = [];
for (const id of ids) {
  await send('Page.navigate', { url: `http://localhost:${WEB}/${SLUG}?id=${id}&notour=1` });
  let up = false;
  for (let i = 0; i < 90; i++) { const c = await ev("document.querySelectorAll('div').length"); if (c > 60) { up = true; break; } await wait(700); }
  if (!up) { rows.push({ id, verdict: 'NEVER RENDERED' }); continue; }
  await wait(2200);

  // Walk forward until a control is on screen — ANSWERING ANY EARLIER QUESTION on
  // the way. A lesson's analogue beat is rarely its first graded one: epistemology23
  // asks a scene-target question at beat 3 and its poll at beat 7, and a tap-only
  // walk parks on beat 3 forever. Reported as NO CONTROL REACHED, which reads
  // exactly like a lesson that has no control.
  let found = false;
  let sig = '';
  for (let b = 0; b < 30; b++) {
    if (await ev(WAITING)) { found = true; break; }
    const now = await ev("document.getElementById('stage-clip') ? document.body.innerText.length : 0");
    await ev(TAP);
    await wait(1000);
    const next = await ev("document.getElementById('stage-clip') ? document.body.innerText.length : 0");
    if (next === now && String(now) === sig) { await ev(ANSWER_TARGET); await wait(1200); await ev(TAP); await wait(900); }
    sig = String(now);
  }
  if (!found) { rows.push({ id, verdict: 'NO CONTROL REACHED' }); continue; }

  await wait(1400);
  const before = await ev(STAGE);
  const how = await ev(ANSWER_CONTROL);
  await wait(1500);
  const after = await ev(STAGE);
  if (!before || !after) { rows.push({ id, verdict: 'NO STAGE' }); continue; }

  const a = new Set(before);
  let moved = 0;
  for (const s of after) if (!a.has(s)) moved += 1;
  rows.push({ id, verdict: moved > 0 ? 'moved' : 'STILL', moved, of: after.length, how: how || '(none)' });
}

console.log('\nDID THE STAGE MOVE WHEN THE CONTROL WAS WORKED?\n');
let bad = 0;
for (const r of rows) {
  if (r.verdict === 'moved') console.log(`  ok    ${r.id.padEnd(30)} ${r.moved}/${r.of} boxes changed  (via ${r.how})`);
  else { bad += 1; console.log(`  FAIL  ${r.id.padEnd(30)} ${r.verdict}${r.of ? `  0/${r.of} boxes changed (via ${r.how})` : ''}`); }
}
console.log(`\n  ${rows.length - bad} of ${rows.length} move the picture.\n`);
release();
process.exit(bad ? 1 : 0);
