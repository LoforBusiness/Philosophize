// WATCH AN ANSWER LAND.
//
//   npx expo start --web --port 8871 --clear
//   chrome --headless=new --remote-debugging-port=9401 --user-data-dir=<tmp>
//   node scripts/shot-answer.mjs epistemology-knowledge-19 NUTRITION
//
// Plays a lesson to its first graded beat, photographs the stage, taps the named
// target, waits for the reaction to settle and photographs it again — then writes
// the two frames side by side.
//
// It exists because the defect it was built for is invisible in a still: the
// reader reported that "only the outline of the correct box goes out", and the
// only way to see whether the WHOLE answer rises is to compare the same stage one
// beat apart. A screenshot of the answered state alone looks fine either way.
//
// CDP notes that cost a run each, and are recorded in §21 already:
//   · a Pressable in react-native-web needs a real `click`; Input.dispatchMouseEvent
//     does nothing to it.
//   · attach to a tab made by PUT /json/new, never /json/list[0], or Page.navigate
//     is a silent no-op.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const CDP = +(process.env.CDP_PORT || 9401);
const WEB = +(process.env.WEB_PORT || 8871);
const ROUTE = process.env.LIFT_ROUTE || 'previewlift';
const OUT = path.join('scripts', '.lesson-shots');

const id = process.argv[2] || 'epistemology-knowledge-19';
const want = (process.argv[3] || '').toUpperCase();

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
  });
  r.on('error', rej); r.end();
});

const tab = await put('/json/new?about:blank');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let mid = 0; const pending = new Map();
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
});
await new Promise((r) => ws.addEventListener('open', r));

const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r?.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r?.result?.value;
};

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });

// wait for the stage
const STAGE = "document.querySelector('#stage-cam')";
for (let i = 0; i < 300; i++) {
  if (await evalJs(`!!${STAGE}`)) break;
  await new Promise((r) => setTimeout(r, 1000));
}
if (!await evalJs(`!!${STAGE}`)) { console.log('NEVER RENDERED A STAGE'); process.exit(1); }

const CLICK = "(()=>{const e=document.elementFromPoint(210,320);const ev=new MouseEvent('click',{bubbles:true});(e||document.body).dispatchEvent(ev);return true})()";
const RINGS = "document.querySelectorAll('[data-nativeid=\"target-ring\"],[id=\"target-ring\"]').length";

// ADVANCE TO THE GRADED BEAT, WHICH IS NOT MERELY "A BEAT WITH TARGETS".
//
// Scenes mount their Targets for the whole lesson and gate them with `disabled`,
// so rings exist several beats before the question does. The first run of this
// script stopped on the beat that INTRODUCES the doors — the deck still read
// "Tap to continue" — and photographed a question that had not been asked. The
// deck's continue affordance is the reliable tell: a graded beat does not offer it.
const ASKED = "(!document.body.innerText.includes('Tap to continue')) && "
  + "document.querySelectorAll('[data-nativeid=\"target-ring\"],[id=\"target-ring\"]').length > 0";
let found = 0;
for (let b = 0; b < 16; b++) {
  if (await evalJs(ASKED)) { found = await evalJs(RINGS); break; }
  await evalJs(CLICK);
  await new Promise((r) => setTimeout(r, 1400));
}
console.log(found > 0 ? `graded beat reached · ${found} target(s)` : 'never reached a graded beat');
if (!found) process.exit(1);

const clip = await evalJs(`(()=>{const r=${STAGE}.getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height})})()`);
const box = JSON.parse(clip);
const shoot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), Buffer.from(r.data, 'base64'));
  return path.join(OUT, name);
};

const before = await shoot('answer-before.png');

// tap the named target — by its own words, so the script says what the reader sees
const TAP = `(()=>{

  // TAP THE RING'S PARENT, WHICH IS THE PRESSABLE ITSELF.
  //
  // Searching by text found a container that merely CONTAINED the word — the first
  // run reported 'tapped ENGINES HEART NUTRITION' — and it cannot find a target at
  // all where the art carries no words of its own, which is most of them: on
  // metaphysics23 the label REASSEMBLED is a sibling of the hull, so the nearest
  // match spanned the label and the question deck below it.
  //
  // Every Target draws nativeID target-ring while its question is open, and
  // react-native-web puts that on the element as an id. The ring is a child of the
  // Pressable, so its parent is exactly the thing a finger would land on.
  // (No backticks in here: this comment lives inside a template literal.)
  const rings = [...document.querySelectorAll('[id="target-ring"],[data-nativeid="target-ring"]')];
  const cands = rings.map((r) => r.parentElement).filter(Boolean);
  const want2 = ${JSON.stringify(want)};
  let hit = null;
  if (/^[0-9]+$/.test(want2)) hit = cands[+want2];
  else if (want2) {
    // its own words first; failing that, the nearest label by centre distance
    hit = cands.find((c) => (c.innerText || '').toUpperCase().includes(want2));
    if (!hit) {
      const lab = [...document.querySelectorAll('div,span')]
        .filter((e) => (e.textContent || '').trim().toUpperCase() === want2)
        .pop();
      if (lab) {
        const lb = lab.getBoundingClientRect();
        const cx = lb.x + lb.width / 2, cy = lb.y + lb.height / 2;
        hit = cands.map((c) => {
          const b = c.getBoundingClientRect();
          return [Math.hypot(b.x + b.width / 2 - cx, b.y + b.height / 2 - cy), c];
        }).sort((a, b) => a[0] - b[0])[0]?.[1];
      }
    }
  } else hit = cands[0];
  if (!hit) return 'NOT FOUND: ' + cands.length + ' ring parent(s)';
  hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'tapped ' + (hit.innerText || '').slice(0, 24);
})()`;
console.log(await evalJs(TAP));

await new Promise((r) => setTimeout(r, 900));
const after = await shoot('answer-after.png');
console.log('stage box', box.w.toFixed(0) + 'x' + box.h.toFixed(0));
console.log('wrote', before, 'and', after);
process.exit(0);
