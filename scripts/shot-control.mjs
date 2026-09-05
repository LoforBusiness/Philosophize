// A PHOTOGRAPH OF ONE GRADED BEAT, so a new control can be looked at.
//
//   node scripts/shot-control.mjs <lesson-id> [outfile]
//
// Numbers say a label fits its box; only a picture says whether the control reads
// as the thing it is called (LESSON_RULES Part 3). Reuses the measure harness's
// own preview route and lock so it cannot collide with a sweep.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = Number(process.env.CDP_PORT || 9382);
const WEB = Number(process.env.WEB_PORT || 8853);
const SLUG = process.env.MUST_ROUTE || 'previewshot';
const ROUTE = `app/${SLUG}.tsx`;
const id = process.argv[2];
const out = process.argv[3] || `.moves-sheets/${id}.png`;
if (!id) { console.error('usage: node scripts/shot-control.mjs <lesson-id> [out.png]'); process.exit(1); }

const ROUTE_SRC = `// WRITTEN BY scripts/shot-control.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewShot() {
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

const put = (path) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path, method: 'PUT' }, (x) => {
    let b = ''; x.on('data', (d) => { b += d; }); x.on('end', () => res(JSON.parse(b || '{}')));
  });
  r.on('error', rej); r.end();
});

const { release } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'shot-control' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await sleep(1200);                                   // let Metro see the new route
  const tab = await put(`/json/new?http://localhost:${WEB}/${SLUG}?id=${id}`);
  const WS = (await import('ws')).default ?? (await import('ws'));
  const ws = new WS(tab.webSocketDebuggerUrl);
  let n = 0;
  const send = (method, params = {}) => new Promise((res) => {
    const msgId = ++n;
    const onMsg = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.id === msgId) { ws.off('message', onMsg); res(m.result); }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });
  await sleep(9000);

  // Tap forward until the beat carries one of the new controls.
  // STOP_AT=target photographs a SCENE-TARGET beat instead -- the third kind of
  // question, and the one whose affordance a reader said was hard to read.
  const has = process.env.STOP_AT === 'target'
    ? `(() => document.querySelectorAll('[nativeID="target-ring"], #target-ring').length > 0
         || [...document.querySelectorAll('*')].some((e) => e.id === 'target-ring'))()`
    : `(() => !!(document.getElementById('sort-bins') || document.getElementById('poll-ballot')))()`;
  // A GRADED BEAT DOES NOT ADVANCE ON A TAP, and the first version of this loop
  // did not know that: metaphysics21 opens with a scene-target question, the
  // clicks landed on nothing, and the shot came back of the beat it was stuck on
  // rather than the poll. Answer whatever is on the beat, then advance -- the
  // same order every other harness here uses.
  for (let k = 0; k < 40; k++) {
    const r = await send('Runtime.evaluate', { expression: has, returnByValue: true });
    if (r?.result?.value) break;
    await send('Runtime.evaluate', { expression: ANSWER_CONTROL, returnByValue: true });
    await sleep(260);
    await send('Runtime.evaluate', {
      expression: `(() => {
        const b = [...document.querySelectorAll('[role="button"]')]
          .filter((e) => e.getAttribute('aria-disabled') !== 'true');
        if (b.length) { b[0].dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; }
        return 0;
      })()`,
      returnByValue: true,
    });
    await sleep(260);
    await send('Runtime.evaluate', {
      expression: `document.elementFromPoint(195, 300)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))`,
    });
    await sleep(800);
  }
  await sleep(1400);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync('.moves-sheets', { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(out);
  ws.close();
} finally {
  release();
}
