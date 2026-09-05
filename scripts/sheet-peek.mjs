// THE SNAPSHOT'S REVEAL, FRAME BY FRAME.
//
//   npm run sheet:peek -- <lesson-id>
//
// Needs Metro and a headless Chrome (see the header of scripts/measure-must.mjs),
// and it writes app/previewpeek.tsx while it runs — check:routes is what stops
// one being left behind.
//
// Two questions no screenshot answers: does the leader line draw DOWN before the
// card arrives, and is the close the open played backwards? Both are shapes over
// time, so this samples the real geometry every frame through an open and a
// close and prints the two timelines.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = Number(process.env.CDP_PORT || 9382);
const WEB = Number(process.env.WEB_PORT || 8853);
const SLUG = 'previewpeek';
const ROUTE = `app/${SLUG}.tsx`;
const id = process.argv[2] || 'aesthetics-aesthetics-3';

const ROUTE_SRC = `// WRITTEN BY scripts/sheet-peek.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewPeek() {
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

// A coloured, underlined name in the deck — the same selector shot-name uses, and
// `button` is in it because react-native-web renders a pressable nested <Text> as
// one (see NarrationText's header).
const NAME_SEL = `[...document.querySelectorAll('div,span,button')].filter((e) => {
  const s = getComputedStyle(e);
  if (s.textDecorationLine !== 'underline') return false;
  const t = (e.textContent || '').trim();
  return s.color !== 'rgb(26, 26, 26)' && t.length > 2 && t.length < 40;
})`;

// ── MEASURE THE LABELLED BOXES, NOT THEIR CHILDREN ──────────────────────────
//
// The first version hunted for the leader by shape (a thin coloured div) and for
// the card by its border. It found the card's era RAIL instead of the leader —
// also thin, also coloured — and for the card it found the inner gradient, which
// has a FIXED height and is merely CLIPPED by its animated parent.
// `getBoundingClientRect` does not know about `overflow: hidden` (§21 records the
// same trap sinking check-readable), so the card measured a constant 74px, the
// mount read as a one-frame snap, and the animation looked broken when it was the
// probe that was.
//
// So the three animated boxes carry nativeIDs — the same thing `drag-strip` and
// `stage-cam` do for the same reason — and this reads those.
const SAMPLER = [
  '(() => {',
  '  window.__p = [];',
  '  const h = (id) => {',
  '    const e = document.getElementById(id);',
  '    if (!e) return [0, -1];',
  '    const r = e.getBoundingClientRect();',
  '    return [Math.round(r.height * 100) / 100, Math.round(r.x)];',
  '  };',
  '  const tick = () => {',
  "    const w = h('peek-wrap'); const l = h('peek-line'); const c = h('peek-card');",
  '    window.__p.push([performance.now(), l[0], l[1], c[0], w[0]]);',
  '    requestAnimationFrame(tick);',
  '  };',
  '  requestAnimationFrame(tick);',
  '  return 1;',
  '})()',
].join('\n');

const { release } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'sheet-peek' });
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
  await sleep(13000);

  // Step until a coloured name is on screen.
  let found = false;
  for (let k = 0; k < 30; k++) {
    const r = await send('Runtime.evaluate', { expression: `${NAME_SEL}.length`, returnByValue: true });
    if (r?.result?.value > 0) { found = true; break; }
    await send('Runtime.evaluate', { expression: ANSWER_CONTROL, returnByValue: true });
    await sleep(200);
    await send('Runtime.evaluate', {
      expression: "document.elementFromPoint(195, 300)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))",
    });
    await sleep(750);
  }
  if (!found) { console.log('no coloured name reached in 30 beats'); process.exit(1); }

  const nameBox = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => { const e = ${NAME_SEL}[0]; const r = e.getBoundingClientRect();
      return { text: e.textContent, x: Math.round(r.x), w: Math.round(r.width), mid: Math.round(r.x + r.width / 2) }; })()`,
  });
  const nb = nameBox?.result?.value;
  console.log(`name: "${nb?.text}"  x ${nb?.x}  width ${nb?.w}  centre ${nb?.mid}\n`);

  await send('Runtime.evaluate', { expression: SAMPLER, returnByValue: true });
  await sleep(300);

  // PEEK_SHOTS=1 photographs the open mid-flight. The timings are read off the
  // stage windows, so the frames land on the leader drawing, the card unfurling
  // and the words arriving rather than on three pictures of the finished card.
  if (process.env.PEEK_SHOTS) {
    const at = [70, 150, 260, 460];
    await send('Runtime.evaluate', {
      expression: `${NAME_SEL}[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))`,
    });
    let last = 0;
    for (const ms of at) {
      await sleep(ms - last); last = ms;
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.mkdirSync('.moves-sheets', { recursive: true });
      fs.writeFileSync(`.moves-sheets/peek-${ms}.png`, Buffer.from(shot.data, 'base64'));
      console.log(`.moves-sheets/peek-${ms}.png`);
    }
    await sleep(600);
    await send('Runtime.evaluate', {
      expression: `${NAME_SEL}[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))`,
    });
    for (const ms of [60, 130]) {
      await sleep(ms === 60 ? 60 : 70);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`.moves-sheets/peek-out-${ms}.png`, Buffer.from(shot.data, 'base64'));
      console.log(`.moves-sheets/peek-out-${ms}.png`);
    }
    await sleep(500);
    ws.close();
    release();
    process.exit(0);
  }
  const t0 = Date.now();
  await send('Runtime.evaluate', {
    expression: `${NAME_SEL}[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))`,
  });
  await sleep(1400);
  const t1 = Date.now();
  await send('Runtime.evaluate', {
    expression: `${NAME_SEL}[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))`,
  });
  await sleep(1400);

  const out = await send('Runtime.evaluate', { expression: 'JSON.stringify(window.__p)', returnByValue: true });
  const s = JSON.parse(out.result.value);
  if (!s.length) { console.log('sampler recorded nothing'); process.exit(1); }
  const base = s[0][0];

  // Turn the trace into the two events, so the shape is readable as text.
  const phase = (rows, label) => {
    const line = rows.map((r) => r[1]);
    const card = rows.map((r) => r[3]);
    const moved = (a) => Math.max(...a) - Math.min(...a);
    const firstMove = (a) => a.findIndex((v, i) => i > 0 && Math.abs(v - a[0]) > 0.5);
    const settle = (a) => {
      for (let i = a.length - 1; i > 0; i--) if (Math.abs(a[i] - a[i - 1]) > 0.5) return i;
      return -1;
    };
    const ms = (i) => (i < 0 ? null : Math.round(rows[i][0] - rows[0][0]));
    console.log(`${label}`);
    console.log(`  leader  ${line[0].toFixed(0)} -> ${line[line.length - 1].toFixed(0)}px`
      + `   starts ${ms(firstMove(line))}ms  ends ${ms(settle(line))}ms  travel ${moved(line).toFixed(0)}px`);
    console.log(`  card    ${card[0].toFixed(0)} -> ${card[card.length - 1].toFixed(0)}px`
      + `   starts ${ms(firstMove(card))}ms  ends ${ms(settle(card))}ms  travel ${moved(card).toFixed(0)}px`);
    let worst = 0;
    for (let i = 1; i < rows.length; i++) worst = Math.max(worst, Math.abs(rows[i][3] - rows[i - 1][3]));
    console.log(`  worst single frame on the card: ${worst.toFixed(1)}px`);
    const xs = rows.map((r) => r[2]).filter((v) => v >= 0);
    if (xs.length) console.log(`  leader x: ${Math.min(...xs)}..${Math.max(...xs)}  (name centre ${nb?.mid})`);
    const span = (a) => {
      const f = firstMove(a); const t = settle(a);
      return f < 0 || t < 0 ? 0 : Math.round(rows[t][0] - rows[f][0]);
    };
    return {
      leaderX: xs.length ? Math.max(...xs) : -1,
      lineMs: span(line), cardMs: span(card),
      lineStart: ms(firstMove(line)) ?? 1e9, cardStart: ms(firstMove(card)) ?? 1e9,
      total: Math.max(ms(settle(line)) ?? 0, ms(settle(card)) ?? 0)
        - Math.min(ms(firstMove(line)) ?? 0, ms(firstMove(card)) ?? 0),
    };
  };

  const split = s.findIndex((r) => r[0] - s[0][0] > (t1 - t0));
  const o = phase(s.slice(0, split > 0 ? split : s.length), 'OPEN');
  const c = split > 0 ? phase(s.slice(split), 'CLOSE') : null;

  // ── WHAT THE NUMBERS HAVE TO SAY ────────────────────────────────────────────
  //
  // Four properties, and every one of them was broken at some point while this
  // was being built — which is the only reason to assert them rather than print
  // them and hope somebody reads it.
  const fails = [];
  if (!(o.lineMs >= 45)) fails.push(`the leader draws in ${o.lineMs}ms — under 45 it is a snap, not a line being drawn`);
  if (!(o.cardMs >= 140)) fails.push(`the card opens in ${o.cardMs}ms — too fast to read as unfurling`);
  if (!(o.lineStart <= o.cardStart)) fails.push('the card starts before the leader — the line is meant to cause the card');
  // WHERE the line hangs, which was silently wrong for a whole lesson: onLayout on
  // a nested pressable Text fires in react-native-web sometimes and not others, so
  // the leader pointed at the right word in one lesson and sat at the margin in the
  // next. It is measured at press time now, and this is what says so.
  if (o.leaderX >= 0 && nb && Math.abs(o.leaderX - nb.mid) > 6) {
    fails.push(`the leader is at x ${o.leaderX} and the name's centre is ${nb.mid} — it is not under the word`);
  }
  if (c) {
    if (!(c.cardStart <= c.lineStart)) fails.push('on close the leader retracts before the card — that is not the reverse');
    if (!(c.total < o.total)) fails.push(`the exit (${c.total}ms) is not shorter than the entrance (${o.total}ms)`);
    if (!(c.cardMs >= 60)) fails.push(`the card closes in ${c.cardMs}ms — it is vanishing, not retracting`);
  } else {
    fails.push('no close was recorded');
  }

  console.log('');
  if (!fails.length) {
    console.log('  ok    the leader draws, the card follows, and the close is the open reversed.');
  } else {
    for (const f of fails) console.log(`  FAIL  ${f}`);
  }
  ws.close();
  release();
  process.exit(fails.length ? 1 : 0);
  ws.close();
} finally { release(); }
