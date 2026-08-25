// HOW THE FIRST SCREEN ACTUALLY BREAKS ITS LINES, AND HOW FAST IT SPEAKS.
//
//   npx expo start --web --port 8856 --clear
//   node scripts/check-intro.mjs
//
// Chrome is started for you on 9396 if it is not already there. The run takes
// about a minute, because it watches the whole intro play.
//
// ── WHY A BROWSER AND NOT ARITHMETIC ────────────────────────────────────────
//
// `check-thinkers` already re-derives the intro's SCHEDULE — how long each line
// stands complete before it dissolves — and that is arithmetic, so plain Node can
// do it. This is the other half, and it cannot be: where a line BREAKS depends on
// the real widths of real glyphs of Playfair Display Bold at 27px inside a
// 322-unit bubble. MapChart.tsx already records what estimating that costs — two
// branch names placed by character count came out at exactly zero clearance and
// read as one word on the board for months.
//
// ── WHAT IT HOLDS ───────────────────────────────────────────────────────────
//
//   1. TWO LINES, NEVER THREE. "Socrates. Kant. Nietzsche. Simone de Beauvoir."
//      broke as "Socrates. Kant. / Nietzsche. Simone de / Beauvoir." — a third
//      line holding one word, and that word a surname parted from its given
//      names. A reader saw it immediately: "his last name goes too far under it,
//      that doesnt look good."
//   2. NO STRANDED SCRAP. A final line holding a single short word is a break in
//      the wrong place: "…It adds / up." cut a phrasal verb in half. Long words
//      are exempt — "Ready to think / differently?" is where that line SHOULD
//      break, and a rule that cannot tell those apart is a rule nobody keeps.
//   3. NOTHING LIT IS CLIPPED. The bubble hides overflow on purpose — that is how
//      it grows into the line he is about to reach — so only a word that is
//      actually VISIBLE can be said to be cut off. Testing every word instead
//      reports all eleven lines as broken, which is a harness that cannot tell
//      the design from the defect.
//   4. NO BLANK FRAME. Nothing on this screen may be empty while it is playing.
//   5. NO TWO NAMES ON A BOARD TOUCH. MapChart's middle row once read
//      "EPISTEMOLOGYAESTHETICS" — a reader called it a glitch and it was a
//      COLLISION, two names placed 130 units apart whose half-widths summed to
//      exactly 130. Nothing left its viewBox and nothing threw, so every check
//      that measures a box against its frame stayed green. This measures each
//      box against its NEIGHBOURS, which is the only way that defect is visible.
//   6. THE WORDS DO NOT SPEED BACK UP. The reader has asked about the pace twice,
//      in both directions, and this is the ratchet that keeps the second answer:
//      measured, not declared, because `speak` is a formula and what a reader
//      experiences is milliseconds between words on a phone.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { claimRoute } from './lib/previewroute.mjs';

const WEB = +(process.env.WEB_PORT || 8856);
const CDP = +(process.env.CDP_PORT || 9396);
const ROUTE = process.env.INTRO_ROUTE || 'previewintro';

/** Milliseconds between spoken words, below which the line reads as a flicker. */
const MIN_PER_WORD = 230;
/** A final line of one word this short is a scrap, not a line break. */
const SCRAP_CHARS = 5;

const SRC = `// Written by scripts/check-intro.mjs. Deleted on the way out.
import WelcomeAnimation from '@/components/welcome/WelcomeAnimation';

export default function PreviewIntro() {
  return <WelcomeAnimation start />;
}
`;

const { release } = claimRoute({
  route: `app/${ROUTE}.tsx`,
  src: SRC,
  owner: 'check-intro',
  keep: process.env.INTRO_KEEP === '1',
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port, path: p }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(d));
  }).on('error', rej);
});
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});

let fails = 0;
const ok = (cond, what, detail = '') => {
  if (!cond) fails++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${what}${detail ? `  ${detail}` : ''}`);
};

let ws;
try {
  let up = false;
  for (let i = 0; i < 240; i++) { try { await get(WEB, '/'); up = true; break; } catch { await sleep(1000); } }
  if (!up) { console.error(`no Metro on ${WEB} — see the header.`); process.exit(1); }
  // Warm the bundle with a direct request: the first transform outlasts a
  // navigation timeout, and a page that times out looks like a broken screen.
  try { await get(WEB, '/index.bundle?platform=web&dev=true'); } catch { /* it is warm enough */ }

  let alive = false;
  try { JSON.parse(await get(CDP, '/json/version')); alive = true; } catch { /* start one */ }
  if (!alive) {
    const CH = [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].find((p) => fs.existsSync(p));
    if (!CH) { console.error('no Chrome found'); process.exit(1); }
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'intro-chrome-'));
    spawn(CH, ['--headless=new', `--remote-debugging-port=${CDP}`, `--user-data-dir=${prof}`,
      '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
    for (let i = 0; i < 80; i++) {
      try { JSON.parse(await get(CDP, '/json/version')); break; } catch { await sleep(400); }
    }
  }

  const WS = (await import(pathToFileURL(path.join(process.cwd(), 'node_modules/ws/index.js')).href)).default;
  // A tab made by PUT /json/new, never /json/list[0] — attaching to the latter
  // makes Page.navigate a silent no-op (§21).
  const tab = await put('/json/new?about:blank');
  ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
  let mid = 0;
  const pend = new Map();
  ws.on('message', (m) => {
    const x = JSON.parse(m);
    if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); }
  });
  const send = (m, p = {}) => new Promise((res) => {
    const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const ev = async (e) => {
    const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r?.exceptionDetails) console.log('THREW:', r.exceptionDetails.exception?.description?.slice(0, 300));
    return r?.result?.value;
  };

  await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}` });
  let rendered = false;
  for (let i = 0; i < 260; i++) {
    if (await ev('!!document.body && document.body.innerText.trim().length > 3')) { rendered = true; break; }
    await sleep(600);
  }
  if (!rendered) {
    console.error('the intro never rendered — page said:',
      await ev('document.body && document.body.innerText.slice(0,200)'));
    process.exit(1);
  }

  console.log('watching the intro play (about a minute)…');
  await ev(`(() => {
    window.__seen = new Map();
    window.__t0 = performance.now();
    window.__blank = [];
    window.__gap = { px: Infinity, a: '', b: '' };
    window.__lastSig = '';
    const bubbleOf = (el) => {
      let e = el;
      for (let i = 0; i < 8 && e; i++) {
        const st = getComputedStyle(e);
        if (st.overflow === 'hidden' && parseFloat(st.borderWidth) > 1) return e;
        e = e.parentElement;
      }
      return null;
    };
    window.__tick = () => {
      const now = performance.now() - window.__t0;
      // Each spoken word is its own element, and they are the only 27px text.
      const words = [...document.querySelectorAll('div,span')].filter((e) => {
        if (e.children.length) return false;
        return getComputedStyle(e).fontSize === '27px' && (e.textContent || '').trim().length > 0;
      });
      if (!words.length) { window.__blank.push(Math.round(now)); return; }
      const tops = words.map((w) => w.getBoundingClientRect().top);
      const base = Math.min(...tops);
      const rows = tops.map((y) => Math.round((y - base) / 34));
      const key = words.map((w) => w.textContent.trim()).join(' ');
      const bub = bubbleOf(words[0]);
      const bb = bub ? bub.getBoundingClientRect() : null;
      const lit = words.map((w) => Number(getComputedStyle(w).opacity) > 0.5);
      const over = bb ? words.some((w, i) => {
        if (!lit[i]) return false;
        const r = w.getBoundingClientRect();
        return r.bottom > bb.bottom - 1 || r.top < bb.top - 1
          || r.right > bb.right + 1 || r.left < bb.left - 1;
      }) : false;
      // Every name drawn on a board, measured against its neighbours. Two gates,
      // and the second one cost a false alarm: text at opacity 0 has not collided
      // with anything yet, and text that is still MOVING has not landed yet. The
      // growth board's kicker and headline slide into place past one another, so
      // sampling mid-flight reported them 103px through each other while the
      // finished board has them cleanly stacked. Only a frame identical to the
      // one before it is a frame worth measuring.
      const boxes = [];
      for (const svg of document.querySelectorAll('svg')) {
        const texts = [...svg.querySelectorAll('text')].filter((t) => {
          if (!(t.textContent || '').trim()) return false;
          let e = t;
          while (e && e !== svg) {
            if (Number(getComputedStyle(e).opacity) < 0.9) return false;
            e = e.parentElement;
          }
          return true;
        });
        for (let i = 0; i < texts.length; i++) {
          for (let j = i + 1; j < texts.length; j++) {
            const a = texts[i].getBoundingClientRect();
            const b = texts[j].getBoundingClientRect();
            // SAME ROW MEANS SAME BASELINE, not merely overlapping boxes. An
            // SVG text's rect is its em box, which is taller than its ink, so
            // two labels STACKED a comfortable 19px apart still graze — and the
            // first version of this rule reported the growth board's kicker and
            // its headline as 103px through one another while the screenshot
            // shows them cleanly one above the other. Centres, not edges.
            const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
            if (dy > Math.min(a.height, b.height) * 0.5) continue;
            const gap = a.left < b.left ? b.left - a.right : a.left - b.right;
            boxes.push({ gap, a: texts[i].textContent.trim(), b: texts[j].textContent.trim() });
          }
        }
        for (const t of texts) {
          const r = t.getBoundingClientRect();
          boxes.sig = (boxes.sig || '') + t.textContent.trim() + Math.round(r.left) + ',' + Math.round(r.top) + ';';
        }
      }
      if (boxes.sig && boxes.sig === window.__lastSig) {
        for (const c of boxes) {
          if (c.gap < window.__gap.px) window.__gap = { px: c.gap, a: c.a, b: c.b };
        }
      }
      window.__lastSig = boxes.sig || '';
      const prev = window.__seen.get(key)
        || { rows, words: key.split(' '), litAt: words.map(() => null), over: false };
      lit.forEach((on, i) => { if (on && prev.litAt[i] === null) prev.litAt[i] = Math.round(now); });
      prev.rows = rows;
      prev.over = prev.over || over;
      window.__seen.set(key, prev);
    };
    window.__timer = setInterval(window.__tick, 120);
    return 1;
  })()`);

  // The whole run: the walk-on, the eleven lines, the exit and the end card.
  await sleep(52000);

  const data = JSON.parse(await ev(`(() => {
    clearInterval(window.__timer);
    const out = [];
    for (const [key, v] of window.__seen) {
      const perRow = {};
      v.rows.forEach((r, i) => { (perRow[r] ||= []).push(v.words[i]); });
      const keys = Object.keys(perRow).map(Number).sort((a, b) => a - b);
      const litAt = v.litAt.filter((x) => x !== null);
      const last = perRow[keys[keys.length - 1]];
      out.push({
        line: key,
        rows: keys.map((r) => perRow[r].join(' ')),
        nRows: keys.length,
        tail: last.length === 1 ? last[0] : null,
        clipped: v.over,
        perWord: litAt.length > 1
          ? Math.round((litAt[litAt.length - 1] - litAt[0]) / (litAt.length - 1))
          : 0,
      });
    }
    const g = window.__gap;
    return JSON.stringify({
      blank: window.__blank.length,
      lines: out,
      gap: g.px === Infinity ? null : { px: Math.round(g.px * 10) / 10, a: g.a, b: g.b },
    });
  })()`));

  console.log('');
  for (const l of data.lines) console.log(`  ${String(l.perWord).padStart(4)}ms/word  ${l.nRows}L  ${l.rows.join('  /  ')}`);
  console.log('');

  ok(data.lines.length >= 8, 'the intro played through', `${data.lines.length} lines seen`);

  const tall = data.lines.filter((l) => l.nRows > 2);
  ok(tall.length === 0, 'no line of the intro needs a third row',
    tall.length ? tall.map((l) => `"${l.line}"`).join(', ') : `${data.lines.length} lines, two rows at most`);

  const scraps = data.lines.filter((l) => l.nRows > 1 && l.tail && l.tail.length < SCRAP_CHARS);
  ok(scraps.length === 0, 'no line ends on a stranded scrap',
    scraps.length ? scraps.map((l) => `"${l.line}" → "${l.tail}"`).join(', ')
      : `nothing shorter than ${SCRAP_CHARS} characters left alone`);

  const cut = data.lines.filter((l) => l.clipped);
  ok(cut.length === 0, 'no word the reader can see is cut off by the bubble',
    cut.length ? cut.map((l) => `"${l.line}"`).join(', ') : `${data.lines.length} lines whole`);

  // WHAT THIS ACTUALLY MEASURES, said plainly, because the honest version is
  // narrower than the tempting one. Every word of every beat is in the DOM from
  // the first frame — only the OPACITY is animated — so this cannot tell you the
  // screen looked empty. What it does catch is a beat whose words never mounted
  // at all, which is the failure that would otherwise be reported as eleven
  // perfectly-timed lines nobody ever saw.
  ok(data.blank === 0, 'every beat has its words in the bubble',
    data.blank ? `${data.blank} samples with no word mounted` : 'no beat came up wordless');

  // 4 device px at this width is about 4 stage units — enough that two names
  // read as two, and far enough from the 0 that shipped for months.
  ok(data.gap === null || data.gap.px >= 4,
    'no two names on a board are touching',
    data.gap ? `closest ${data.gap.px}px: "${data.gap.a}" / "${data.gap.b}"` : 'no boards measured');

  const paces = data.lines.map((l) => l.perWord).filter((p) => p > 0);
  const fastest = Math.min(...paces);
  ok(fastest >= MIN_PER_WORD, 'the words arrive slowly enough to be read',
    `fastest line ${fastest}ms a word, floor ${MIN_PER_WORD}`);

  await fetch(`http://127.0.0.1:${CDP}/json/close/${tab.id}`).catch(() => {});
} finally {
  release();
  if (ws) ws.close();
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nintro: all clear.\n');
process.exit(fails ? 1 : 0);
