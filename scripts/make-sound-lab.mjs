// ─────────────────────────────────────────────────────────────────────────────
// THE SOUND LAB — every candidate for every role, on one self-contained page.
//
// WHY THIS EXISTS. I cannot hear anything I make. Every sound in this app has so
// far been chosen by me describing one, shipping it, and finding out a round-trip
// later that it was wrong: the whoosh took three rounds to remove, the tap took
// four to get right, and the entire feature shipped inaudible once because of a
// single boolean. Each of those cost a publish and a test.
//
// This inverts it. Every role gets four to six real options rendered side by side,
// so a choice is made by listening ONCE. The page also draws what it plays —
// waveform, spectrum, and the hiss score that finally caught the "bush sound" —
// so a complaint can be pointed at instead of described.
//
// It is built with scripts/lib/dsp.mjs, the same kit that renders the shipping
// clips, so whatever is picked here is byte-for-byte what gets installed.
//
//   node scripts/make-sound-lab.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wav, hiss, spectrum, envelope, doubling, readWav } from './lib/dsp.mjs';
import { ROLES } from './sound-candidates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'sound-lab.html');

// ── the real timings, read out of the app rather than invented ───────────────
// A footstep heard alone tells you almost nothing; a footstep at the cadence the
// figure actually walks tells you everything. So the walk sequence on the page is
// the genuine plant times for Moral Luck, solved by the same module the player
// uses at runtime.
const ts = (await import('typescript')).default;
function loadTS(rel, req = () => ({})) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const e = {};
  new Function('exports', 'require', js)(e, req);
  return e;
}
const rig = loadTS('components/lesson/cinematic/rig.ts');
const foot = loadTS('components/lesson/cinematic/footfalls.ts', () => rig);
// The longest walk in the lesson: 170 → 300, three strides and an arrival.
const WALK = foot.footfallTimes(170, 300);
// And a LONG one, right across the stage, for previewing a footstep. Three steps
// is not a walk; eleven is. This is the single most useful thing on the page —
// judging a 110ms footfall from one tap is how the last two got chosen badly.
const LONGWALK = foot.footfallTimes(40, 360);

// The app's own per-clip volume trims, so the balance on the page is the balance
// in the lesson rather than everything at full level.
const LEVEL = { finish: 0.9, badge: 0.9, rankup: 0.95 };

// ── WHAT SHIPS TODAY, FIRST IN EVERY ROW ─────────────────────────────────────
//
// The lab could always compare candidates against EACH OTHER, which answers "which
// of these five is best" and never answers the question that decides anything:
// "is any of them better than the one already in the app?" Five options that are
// all worse than what ships look exactly like five options that are all better.
//
// So the clip currently in assets/sound/ is loaded from disk and put first in its
// role, marked, and it is genuinely the shipped bytes rather than a re-render of
// the recipe — if make-sounds.mjs has drifted from what was installed, this shows
// the installed one, which is what a reader actually hears.
const SHIPPED = {
  footstep: ['step-a', 'step-b'],
  right: ['right-1', 'right-2', 'right-3'],
  wrong: ['rethink'],
  finish: ['reward'],
  tick: ['tick-1', 'tick-2', 'tick-3'],
  badge: ['badge'],
  rankup: ['rankup'],
  impact: ['impact'],
  whoosh: ['whoosh-1', 'whoosh-2', 'whoosh-3'],
  keep: ['keep'],
  save: ['keep'],
};

function shippingOption(roleId) {
  const names = SHIPPED[roleId];
  if (!names) return null;
  const files = names
    .map((n) => path.join(ROOT, 'assets', 'sound', `${n}.wav`))
    .filter((f) => fs.existsSync(f));
  if (!files.length) return null;
  const loaded = files.map((f) => readWav(fs.readFileSync(f)));
  return {
    id: `${roleId}-shipping`,
    name: 'IN THE APP NOW',
    // Marked so the page can style it apart from the candidates — it is the
    // baseline, not a contender.
    shipping: true,
    note: `assets/sound/${names.join('.wav, ')}.wav — the bytes on the device today`,
    vary: loaded.length > 1 ? loaded.length : undefined,
    make: (_f, k = 0) => {
      const w = loaded[Math.min(k ?? 0, loaded.length - 1)];
      return { rate: w.rate, data: Float64Array.from(w.data) };
    },
  };
}

// ── render every candidate ───────────────────────────────────────────────────
const roles = ROLES.map((role) => ({
  id: role.id,
  title: role.title,
  fires: role.fires,
  preview: role.preview,
  // The shipping clip leads, so every judgement is "better than what we have?"
  options: [shippingOption(role.id), ...role.options].filter(Boolean).map((o) => {
    // A candidate with `pitches` is rendered once per pitch — a right answer and
    // an XP tick both CLIMB, and the climb cannot be judged from one note. The row
    // shows and plays the first; the sequences play all of them in order.
    // `pitches` renders one take per note (the climb); `vary` renders several
    // different performances of the SAME sound, which the walk then cycles — a
    // real pair of shoes never makes the same noise twice, and eleven identical
    // footfalls is a loop rather than a walk.
    const pitches = o.pitches ?? (o.vary ? Array.from({ length: o.vary }, (_, k) => k) : [undefined]);
    const takes = pitches.map((f, k) => {
      const { rate, data } = o.vary ? o.make(undefined, k) : o.make(f);
      return { rate, data, b64: wav(data, rate).toString('base64'), kb: (44 + data.length * 2) / 1024 };
    });
    const { rate, data } = takes[0];
    const buf = wav(data, rate);
    const x = Float64Array.from(data);
    return {
      takes: takes.map((t) => t.b64),
      id: `${role.id}--${o.id}`,
      short: o.id,
      name: o.name,
      note: o.note,
      shipped: !!o.shipped,
      physical: !!o.physical,
      vary: !!o.vary,
      ms: Math.round((data.length / rate) * 1000),
      rate,
      kb: +takes.reduce((a, t) => a + t.kb, 0).toFixed(1),
      peak: +Math.max(...data.map(Math.abs)).toFixed(2),
      hiss: +hiss(x, rate).toFixed(3),
      // Worst across every variation — a walk plays all of them, so one bad
      // render in four is one bad footstep in four.
      dbl: +Math.max(...takes.map((t) => doubling(Float64Array.from(t.data)))).toFixed(2),
      wave: envelope(x, 140).map((v) => Math.round(v * 100)),
      spec: spectrum(x, rate, 40).map((v) => Math.round(v * 100)),
      b64: buf.toString('base64'),
    };
  }),
}));

const totalKB = roles.reduce((a, r) => a + r.options.reduce((b, o) => b + o.kb, 0), 0);
const count = roles.reduce((a, r) => a + r.options.length, 0);

// ── the page ─────────────────────────────────────────────────────────────────

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function waveSVG(wave) {
  const w = 140, h = 30;
  const pts = wave.map((v, i) => `${(i / (wave.length - 1)) * w},${h / 2 - (v / 100) * (h / 2 - 1)}`).join(' ');
  const bot = wave.map((v, i) => `${((wave.length - 1 - i) / (wave.length - 1)) * w},${h / 2 + (wave[wave.length - 1 - i] / 100) * (h / 2 - 1)}`).join(' ');
  return `<svg class="wave" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts} ${bot}"/></svg>`;
}
function specSVG(spec) {
  const w = 64, h = 30, bw = w / spec.length;
  const bars = spec.map((v, i) =>
    `<rect x="${(i * bw).toFixed(2)}" y="${(h - (v / 100) * h).toFixed(2)}" width="${(bw * 0.72).toFixed(2)}" height="${((v / 100) * h).toFixed(2)}"/>`).join('');
  return `<svg class="spec" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

const rows = (role) => role.options.map((o) => `
  <label class="opt" data-id="${o.id}">
    <input type="radio" name="${role.id}" value="${o.short}"${o.shipped ? ' checked' : ''}>
    <span class="pick" aria-hidden="true"></span>
    <button class="play" type="button" data-play="${o.id}" aria-label="Play ${esc(o.name)}">
      <svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="4,3 13,8 4,13"/></svg>
    </button>
    <span class="nm">${esc(o.name)}${o.shipped ? '<em class="tag">in the app</em>' : ''}${o.physical ? '<em class="tag phys">physical model</em>' : ''}${o.vary ? '<em class="tag">varies each step</em>' : ''}
      <small>${esc(o.note)}</small></span>
    ${waveSVG(o.wave)}
    ${specSVG(o.spec)}
    <span class="num"><b>${o.ms}</b>ms</span>
    <span class="num"><b>${o.peak}</b>level</span>
    <span class="num hiss${o.hiss > 0.15 ? ' bad' : ''}"><b>${o.hiss.toFixed(3)}</b>hiss</span>
    <span class="num hiss${o.dbl > 0.45 ? ' bad' : ''}"><b>${o.dbl.toFixed(2)}</b>double</span>
  </label>`).join('');

const HOW = {
  walk: ' · each row plays a full walk',
  arrival: ' · each row plays three steps, then the arrival',
  repeat: ' · each row plays a few in a row',
  climb: ' · each row plays the three-note climb',
  count: ' · each row plays the whole count',
  once: '',
};
const sections = roles.map((role) => `
<section class="role" id="role-${role.id}">
  <header>
    <h2>${esc(role.title)}</h2>
    <p>${esc(role.fires)}<em class="how">${esc(HOW[role.preview.kind] || '')}</em></p>
    <button class="seq" type="button" data-all="${role.id}">Compare all ${role.options.length}</button>
  </header>
  <div class="opts">${rows(role)}</div>
</section>`).join('');

const html = `<title>Philosophize — Sound Lab</title>
<style>
:root{
  --paper:#FAFAF7; --ink:#1A1A1A; --soft:#6B6B6B; --rule:#DAD6CB; --faint:#EFECE3;
  --sel:#1A1A1A; --bad:#8A1F1F;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  --sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}
@media (prefers-color-scheme:dark){
  :root{ --paper:#15140F; --ink:#EFEBE0; --soft:#9A958A; --rule:#33312A; --faint:#1F1E18;
         --sel:#EFEBE0; --bad:#E08A8A; }
}
:root[data-theme="dark"]{ --paper:#15140F; --ink:#EFEBE0; --soft:#9A958A; --rule:#33312A; --faint:#1F1E18; --sel:#EFEBE0; --bad:#E08A8A; }
:root[data-theme="light"]{ --paper:#FAFAF7; --ink:#1A1A1A; --soft:#6B6B6B; --rule:#DAD6CB; --faint:#EFECE3; --sel:#1A1A1A; --bad:#8A1F1F; }

*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);
  font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:980px;margin:0 auto;padding:0 20px 96px}

/* ── masthead ─────────────────────────────────────────────────────── */
.top{padding:56px 0 28px;border-bottom:2px solid var(--ink)}
h1{font-family:var(--serif);font-weight:400;font-size:clamp(30px,5vw,46px);
  margin:0 0 10px;letter-spacing:-.01em;text-wrap:balance}
.lede{margin:0;max-width:62ch;color:var(--soft)}
.lede b{color:var(--ink);font-weight:600}
.meta{margin:18px 0 0;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--soft)}

/* ── a role ───────────────────────────────────────────────────────── */
.role{padding:34px 0 6px;border-bottom:1px solid var(--rule)}
.role header{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:14px}
h2{font-family:var(--serif);font-weight:400;font-size:23px;margin:0;letter-spacing:-.01em}
.role header p{margin:0;flex:1 1 240px;color:var(--soft);font-size:13px}
.how{font-style:normal;color:var(--ink);opacity:.55}

button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.seq{border:1px solid var(--rule);border-radius:999px;padding:5px 13px;font-size:12px;
  letter-spacing:.05em;color:var(--soft);white-space:nowrap}
.seq:hover{border-color:var(--ink);color:var(--ink)}

/* ── one candidate ────────────────────────────────────────────────── */
.opts{display:flex;flex-direction:column;gap:2px}
.opt{display:grid;grid-template-columns:18px 30px minmax(150px,1fr) 126px 54px repeat(4,52px);
  align-items:center;gap:12px;padding:9px 10px;border-radius:7px;cursor:pointer;
  transition:background .12s}
.opt:hover{background:var(--faint)}
.opt input{position:absolute;opacity:0;width:0;height:0}
.pick{width:13px;height:13px;border:1.5px solid var(--rule);border-radius:50%;display:block;
  justify-self:center;position:relative}
.opt input:checked + .pick{border-color:var(--sel)}
.opt input:checked + .pick::after{content:"";position:absolute;inset:2.5px;border-radius:50%;
  background:var(--sel)}
.opt input:focus-visible + .pick{outline:2px solid var(--sel);outline-offset:3px}
.opt:has(input:checked){background:var(--faint)}

.play{width:26px;height:26px;border:1px solid var(--rule);border-radius:50%;
  display:grid;place-items:center;flex:none}
.play svg{width:9px;height:9px;fill:var(--ink);margin-left:1px}
.play:hover{border-color:var(--ink);background:var(--ink)}
.play:hover svg{fill:var(--paper)}
.play.on{background:var(--ink);border-color:var(--ink)}
.play.on svg{fill:var(--paper)}

.nm{font-size:14px;min-width:0}
.nm small{display:block;color:var(--soft);font-size:12px;line-height:1.4;margin-top:1px}
.tag.phys{border-color:var(--ink);color:var(--ink)}
.tag{font-style:normal;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  border:1px solid var(--rule);border-radius:3px;padding:1px 5px;margin-left:7px;
  color:var(--soft);vertical-align:1px;white-space:nowrap}

.wave{width:140px;height:30px;fill:var(--ink);opacity:.8}
.spec{width:64px;height:30px;fill:var(--soft);opacity:.75}
.num{font-size:11px;color:var(--soft);text-align:right;
  font-variant-numeric:tabular-nums;letter-spacing:.03em}
.num b{display:block;font-size:13px;font-weight:600;color:var(--ink);letter-spacing:0}
.hiss.bad b{color:var(--bad)}

/* ── in context ───────────────────────────────────────────────────── */
.context{padding:34px 0;border-bottom:2px solid var(--ink)}
.ctx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-top:14px}
.ctx{border:1px solid var(--rule);border-radius:9px;padding:15px 16px;text-align:left;
  transition:border-color .12s,background .12s}
.ctx:hover{border-color:var(--ink);background:var(--faint)}
.ctx b{display:block;font-family:var(--serif);font-weight:400;font-size:17px;margin-bottom:3px}
.ctx span{color:var(--soft);font-size:12.5px;line-height:1.45;display:block}

/* ── picks ────────────────────────────────────────────────────────── */
.picks{position:sticky;bottom:0;background:var(--paper);border-top:2px solid var(--ink);
  padding:13px 20px;margin:0 -20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.picks h3{margin:0;font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--soft);
  font-weight:600;flex:none}
#picklist{flex:1 1 300px;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  color:var(--ink);word-break:break-word;line-height:1.7}
#copy{border:1px solid var(--rule);border-radius:999px;padding:6px 15px;font-size:12px;
  letter-spacing:.04em;white-space:nowrap}
#copy:hover{border-color:var(--ink)}

@media (max-width:860px){
  .opt{grid-template-columns:18px 30px 1fr;grid-template-areas:
    "pick play name" ". . wave" ". . nums";row-gap:7px}
  .pick{grid-area:pick}.play{grid-area:play}.nm{grid-area:name}
  .wave{grid-area:wave;width:100%}
  .spec{display:none}
  .num{grid-area:nums;display:inline-block;text-align:left;margin-right:18px}
  .num b{display:inline;margin-right:3px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
  <header class="top">
    <h1>Sound Lab</h1>
    <p class="lede">Every candidate for every sound in the app, side by side. Pick one per
      role and read the list at the bottom back to me — whatever you choose is
      <b>byte-for-byte</b> what gets installed, because this page and the app's generator
      share the same synthesis code.</p>
    <p class="lede" style="margin-top:9px">The bars beside each clip are its
      <b>spectrum</b>. <b>hiss</b> is how noise-like a clip is <em>after</em> its attack —
      the deleted whoosh scored 0.474, the footfall you like scores 0.012. <b>double</b> is
      whether it reads as two hits: the shoe you like scores 0.00 and that same shoe played
      twice 42ms apart scores 0.94, so past 0.45 is audibly a flam. Both show the WORST of a
      candidate’s variations, not its best.</p>
    <p class="meta">${count} clips · ${totalKB.toFixed(0)} KB · generated, not licensed</p>
  </header>

  <section class="context">
    <h2>Hear them in context</h2>
    <p class="lede" style="font-size:13.5px;margin-top:5px">A footstep alone tells you
      little; a footstep at the cadence the figure actually walks tells you everything.
      These play <b>your current picks</b> at the app's real timings and volumes.</p>
    <div class="ctx-grid">
      <button class="ctx" type="button" data-ctx="walk"><b>A walk across the stage</b>
        <span>The longest walk in Moral Luck — three strides and the arrival, at the exact
        plant times the animation uses.</span></button>
      <button class="ctx" type="button" data-ctx="run"><b>Three right answers</b>
        <span>The note climbing D → F# → A, as it does on a run.</span></button>
      <button class="ctx" type="button" data-ctx="reward"><b>Finishing a lesson</b>
        <span>The finish, then the XP counter ticking up underneath it.</span></button>
      <button class="ctx" type="button" data-ctx="lesson"><b>A minute of a lesson</b>
        <span>Tap, walk, tap, a wrong answer, a right one, then the finish. Everything
        in the order a reader meets it.</span></button>
    </div>
  </section>

  ${sections}

  <div class="picks">
    <h3>Your picks</h3>
    <div id="picklist"></div>
    <button id="copy" type="button">Copy</button>
  </div>
</div>

<script>
const DATA = ${JSON.stringify(
  Object.fromEntries(roles.flatMap((r) => r.options.flatMap((o) =>
    o.takes.map((b, k) => [k === 0 ? o.id : `${o.id}#${k}`, b])))),
)};
const TAKES = ${JSON.stringify(
  Object.fromEntries(roles.flatMap((r) => r.options.map((o) => [o.id, o.takes.length]))),
)};
/* Which of an option's takes are VARIATIONS (cycle them) rather than pitches. */
const VARIES = ${JSON.stringify(
  Object.fromEntries(roles.flatMap((r) => r.options.filter((o) => o.vary).map((o) => [o.id, true]))),
)};
const WALK = ${JSON.stringify({ steps: WALK.steps, settle: WALK.settle })};
const LONGWALK = ${JSON.stringify({ steps: LONGWALK.steps, settle: LONGWALK.settle })};
const PREVIEW = ${JSON.stringify(Object.fromEntries(roles.map((r) => [r.id, r.preview])))};
const LEVEL = ${JSON.stringify(LEVEL)};
const ROLE_IDS = ${JSON.stringify(roles.map((r) => r.id))};

let AC = null;
const BUF = {};
function ctx(){ if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
  if(AC.state === 'suspended') AC.resume(); return AC; }

/* Decoded by hand rather than through decodeAudioData: these are plain 16-bit PCM,
   the parse is ten lines, and it avoids both a fetch (which the page's CSP would
   have to allow) and any browser disagreement about WAV headers. */
function buffer(id){
  if (BUF[id]) return BUF[id];
  const bin = atob(DATA[id]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const dv = new DataView(bytes.buffer);
  const rate = dv.getUint32(24, true);
  const n = dv.getUint32(40, true) / 2;
  const b = ctx().createBuffer(1, n, rate);
  const ch = b.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = dv.getInt16(44 + i * 2, true) / 32768;
  BUF[id] = b;
  return b;
}

function play(id, when = 0, level = 0.65){
  const c = ctx();
  const s = c.createBufferSource();
  s.buffer = buffer(id);
  const g = c.createGain();
  g.gain.value = level;
  s.connect(g).connect(c.destination);
  s.start(c.currentTime + when);
  return s;
}
const lvl = (role) => LEVEL[role] ?? 0.65;
/** Take 0 is the plain id; the climb's later pitches hang off it with a #. */
const take = (id, k) => (k === 0 ? id : id + '#' + k);
const pickOf = (role) => {
  const el = document.querySelector('input[name="' + role + '"]:checked');
  return role + '--' + (el ? el.value : '');
};

/* ── previews ─────────────────────────────────────────────────────────
   A row plays the sound THE WAY THE APP DELIVERS IT, not the bare clip. A 110ms
   footfall heard once is nothing like a walk, fourteen counter ticks are nothing
   like one tick, and choosing from single taps is exactly how the footstep and
   the tap both got picked wrong. */
function preview(id){
  const role = id.split('--')[0];
  const p = PREVIEW[role] || { kind: 'once' };
  const L = lvl(role);
  const n = TAKES[id] || 1;
  if (p.kind === 'walk'){
    LONGWALK.steps.forEach((t, k) => play(take(id, VARIES[id] ? k % n : 0), t, L));
    if (LONGWALK.settle >= 0) play(pickOf('arrival'), LONGWALK.settle, L);
    return;
  }
  if (p.kind === 'arrival'){
    const fs = pickOf('footstep'), fn = TAKES[fs] || 1;
    WALK.steps.forEach((t, k) => play(take(fs, VARIES[fs] ? k % fn : 0), t, 0.65));
    if (WALK.settle >= 0) play(id, WALK.settle, L);
    return;
  }
  if (p.kind === 'climb'){ [0, 1, 2].forEach((k) => play(take(id, Math.min(k, n - 1)), k * p.gap, L)); return; }
  if (p.kind === 'count'){ for (let k = 0; k < p.n; k++) play(take(id, k % n), k * p.gap, L); return; }
  if (p.kind === 'repeat'){ for (let k = 0; k < p.n; k++) play(take(id, VARIES[id] ? k % n : 0), k * p.gap, L); return; }
  play(id, 0, L);
}
document.querySelectorAll('[data-play]').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    preview(b.dataset.play);
    b.classList.add('on');
    setTimeout(() => b.classList.remove('on'), 220);
  });
});
/* Clicking the row selects it AND plays it — choosing and hearing are the same act. */
document.querySelectorAll('.opt').forEach((row) => {
  row.addEventListener('click', () => { preview(row.dataset.id); refresh(); });
});

document.querySelectorAll('[data-all]').forEach((b) => {
  b.addEventListener('click', () => {
    const role = b.dataset.all;
    const ids = [...document.querySelectorAll('#role-' + role + ' .opt')].map((o) => o.dataset.id);
    let t = 0;
    ids.forEach((id) => { play(id, t, lvl(role)); t += Math.max(0.55, buffer(id).duration + 0.18); });
  });
});

/* ── sequences, at the app's real timings ─────────────────────────── */
const SEQ = {
  walk(){
    const step = pickOf('footstep'), arr = pickOf('arrival'), sn = TAKES[step] || 1;
    WALK.steps.forEach((t, k) => play(take(step, VARIES[step] ? k % sn : 0), t, 0.65));
    if (WALK.settle >= 0) play(arr, WALK.settle, 0.65);
    return WALK.settle + 0.6;
  },
  run(){
    /* The three variants of the chosen shape, transposed the way the app does it:
       D, F#, A. Only the shipped two-note shape has all three rendered, so the
       others simply repeat — which is itself worth hearing. */
    const base = pickOf('right');
    const n = TAKES[base] || 1;
    [0, 0.95, 1.9].forEach((t, k) => play(take(base, Math.min(k, n - 1)), t, 0.65));
    return 2.7;
  },
  reward(){
    const fin = pickOf('finish'), tk = pickOf('tick');
    play(fin, 0, lvl('finish'));
    /* 620ms, then fourteen ticks over 980ms — exactly what LessonReward does. */
    const nt = TAKES[tk] || 1;
    for (let k = 0; k < 14; k++) play(take(tk, k % nt), 0.62 + k * 0.070, 0.65);
    return 2.2;
  },
  lesson(){
    let t = 0;
    play(pickOf('tap'), t, 0.65); t += 0.9;
    play(pickOf('page'), t, 0.65); t += 0.35;
    const fs3 = pickOf('footstep'), fn3 = TAKES[fs3] || 1;
    WALK.steps.forEach((s, k) => play(take(fs3, VARIES[fs3] ? k % fn3 : 0), t + s, 0.65));
    if (WALK.settle >= 0) play(pickOf('arrival'), t + WALK.settle, 0.65);
    t += WALK.settle + 1.1;
    play(pickOf('page'), t, 0.65); t += 1.0;
    play(pickOf('wrong'), t, 0.65); t += 1.5;
    play(pickOf('right'), t, 0.65); t += 1.6;
    play(pickOf('finish'), t, lvl('finish'));
    const tk2 = pickOf('tick'), nt2 = TAKES[tk2] || 1;
    for (let k = 0; k < 14; k++) play(take(tk2, k % nt2), t + 0.62 + k * 0.070, 0.65);
    return t + 2.2;
  },
};
document.querySelectorAll('[data-ctx]').forEach((b) => {
  b.addEventListener('click', () => { SEQ[b.dataset.ctx](); });
});

/* ── the list to read back ────────────────────────────────────────── */
function refresh(){
  const parts = ROLE_IDS.map((r) => {
    const el = document.querySelector('input[name="' + r + '"]:checked');
    return r + ': ' + (el ? el.value : '—');
  });
  document.getElementById('picklist').textContent = parts.join('   ·   ');
}
document.querySelectorAll('input[type=radio]').forEach((i) => i.addEventListener('change', refresh));
document.getElementById('copy').addEventListener('click', () => {
  const t = document.getElementById('picklist').textContent;
  navigator.clipboard?.writeText(t);
  const b = document.getElementById('copy');
  b.textContent = 'Copied';
  setTimeout(() => { b.textContent = 'Copy'; }, 1400);
});
refresh();
</script>`;

fs.writeFileSync(OUT, html);
const kb = fs.statSync(OUT).size / 1024;
console.log(`sound lab → ${path.relative(ROOT, OUT)}`);
console.log(`  ${count} candidates across ${roles.length} roles`);
console.log(`  walk sequence: ${WALK.steps.length} strides + arrival at ${WALK.settle.toFixed(2)}s`);
console.log(`  page ${(kb / 1024).toFixed(2)} MB\n`);
for (const r of roles) {
  const worst = r.options.reduce((a, o) => (o.hiss > a.hiss ? o : a), r.options[0]);
  console.log(`  ${r.title.padEnd(22)} ${String(r.options.length).padStart(2)} options · ` +
    `worst hiss ${worst.hiss.toFixed(3)} (${worst.name})`);
}
