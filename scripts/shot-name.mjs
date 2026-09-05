// A PHOTOGRAPH OF A NARRATION BEAT THAT NAMES SOMEBODY, with the snapshot open.
//
//   node scripts/shot-name.mjs <lesson-id> [out.png]
//
// The colour of a name and the fall of the card are the two things no number can
// judge, so this steps a lesson until a coloured name appears, taps it, and
// photographs the result.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = Number(process.env.CDP_PORT || 9382);
const WEB = Number(process.env.WEB_PORT || 8853);
const SLUG = 'previewname';
const ROUTE = `app/${SLUG}.tsx`;
const id = process.argv[2];
const out = process.argv[3] || `.moves-sheets/${id}-name.png`;
if (!id) { console.error('usage: node scripts/shot-name.mjs <lesson-id> [out.png]'); process.exit(1); }

const ROUTE_SRC = `// WRITTEN BY scripts/shot-name.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewName() {
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

// A coloured, underlined name inside the deck. Selecting on the STYLE rather than
// on a testID keeps this honest: it finds what a reader would actually see.
//
// `button` IS IN THE SELECTOR BECAUSE THE NAME IS ONE. React Native Web renders a
// nested <Text> carrying an onPress as a real <button>, not as a span — so the
// house `div,span` sweep every other harness here uses cannot see a tappable
// name at all, and reports a lesson full of them as having none. That is §21's
// "selecting on [role=button] alone finds half the buttons in this app" arriving
// upside down, and it cost a whole debugging pass.
const NAME_SEL = `(() => {
  const hits = [...document.querySelectorAll('div,span,button')].filter((e) => {
    const s = getComputedStyle(e);
    if (s.textDecorationLine !== 'underline') return false;
    const c = s.color;
    return c && c !== 'rgb(26, 26, 26)' && (e.textContent || '').trim().length > 2
      && (e.textContent || '').trim().length < 40;
  });
  return hits;
})()`;

const { release } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'shot-name' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await sleep(1200);
  const tab = await put(`/json/new?http://localhost:${WEB}/${SLUG}?id=${id}`);
  const WS = (await import('ws')).default;
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
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(10000);

  // BEAT=<n> photographs one named beat instead of hunting for a coloured name —
  // the maxim highlight sits wherever data/lessonFocus.ts puts it, which is
  // usually not the beat that happens to name somebody.
  // A two-card question has no analogue control, so ANSWER_CONTROL returns '' and
  // the beat never moves — which is what stalled the first run of this at beat 6
  // and photographed a question while claiming to photograph beat 7.
  const ANSWER_DECK = `(() => {
    const clip = document.getElementById('stage-clip');
    const below = clip ? clip.getBoundingClientRect().bottom : 0;
    const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
      if (e.getAttribute('data-testid') === 'thinker-name') return false;
      const r = e.getBoundingClientRect();
      return r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
    });
    if (b) { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; }
    return 0;
  })()`;

  if (process.env.BEAT) {
    for (let k = 0; k < Number(process.env.BEAT); k++) {
      await send('Runtime.evaluate', { expression: ANSWER_CONTROL, returnByValue: true });
      await sleep(200);
      await send('Runtime.evaluate', { expression: ANSWER_DECK, returnByValue: true });
      await sleep(300);
      await send('Runtime.evaluate', {
        expression: `document.elementFromPoint(195, 300)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))`,
      });
      await sleep(750);
    }
    const shot0 = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync('.moves-sheets', { recursive: true });
    fs.writeFileSync(out, Buffer.from(shot0.data, 'base64'));
    console.log(out);
    ws.close();
    release();
    process.exit(0);
  }

  let found = false;
  for (let k = 0; k < 30; k++) {
    const r = await send('Runtime.evaluate', {
      expression: `${NAME_SEL}.length`, returnByValue: true,
    });
    if (r?.result?.value > 0) { found = true; break; }
    await send('Runtime.evaluate', { expression: ANSWER_CONTROL, returnByValue: true });
    await sleep(200);
    await send('Runtime.evaluate', {
      expression: `document.elementFromPoint(195, 300)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))`,
    });
    await sleep(750);
  }
  if (!found) { console.log('no coloured name reached in 30 beats'); }
  else {
    // Tap it, and let the card finish falling.
    await send('Runtime.evaluate', {
      expression: `${NAME_SEL}[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))`,
    });
    await sleep(900);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync('.moves-sheets', { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(out);
  ws.close();
} finally { release(); }
