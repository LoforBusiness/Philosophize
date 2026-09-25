// ─────────────────────────────────────────────────────────────────────────────
// THE PROFESSOR'S INTRO, HELD TO ITS RULES.
//
//   npm run check:professor
//
// The intro is a ~40 s self-playing lecture a reader opens once, from Home's Quick
// Start or the Learn tab, before any lesson (docs/superpowers/specs/
// 2026-09-25-hard-paywall-professor-intro-design.md). It never plays by itself.
//
// Everything here runs in plain Node, offline, in milliseconds — the same rule
// rig.ts and tone.ts keep — so it can sit in `npm run check`.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const read = (rel) => fs.readFileSync(rel, 'utf8');
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const head = (t) => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

// ═════════════════════════════════════════════════════════════════════════════
head('1 · THE SEEN FLAG: ONCE, EVER, ON EVERY PHONE');
//
// `seenProfessorIntro` is set when the intro finishes or is skipped. It travels
// with the account and merges with OR, so signing in on a second phone never
// plays it again, and a reset that makes this device a different person clears
// it. The merge cannot be imported in plain Node (it pulls in the live store), so
// its one line is lifted out and RUN, and the rest is read from the source.
{
  const store = strip(read('stores/userDataStore.ts'));
  const sync = strip(read('lib/supabase/sync.ts'));

  ok(/seenProfessorIntro: boolean;/.test(store), 'the store declares the flag');
  ok(/seenProfessorIntro: false,/.test(store), 'and it starts false');
  ok(/markProfessorIntroSeen: \(\) => set\(\{ seenProfessorIntro: true \}\)/.test(store),
    'markProfessorIntroSeen sets it');
  ok(/seenProfessorIntro: state\.seenProfessorIntro,/.test(store), 'it is persisted');
  const resets = ['deleteAccount: () =>', 'resetForSignOut: () =>'].map((k) => {
    const a = store.indexOf(k);
    const z = store.indexOf('\n      },', a);
    return a >= 0 && /seenProfessorIntro: false/.test(store.slice(a, z));
  });
  ok(resets.every(Boolean), 'deleting the account or signing out clears it — the device is a new person',
    resets.map((r, i) => `${['deleteAccount', 'resetForSignOut'][i]} ${r ? 'clears' : 'KEEPS'}`).join(' · '));

  ok(/seenProfessorIntro: boolean;/.test(sync), 'the cloud snapshot carries it');
  ok(/'seenProfessorIntro'/.test(sync.slice(sync.indexOf('SYNC_FIELDS'), sync.indexOf('];', sync.indexOf('SYNC_FIELDS')))),
    'and it is one of the synced fields');
  const line = /const seenProfessorIntro = ([^;]+);/.exec(sync);
  ok(!!line, 'the merge has its own line for it', line ? line[1] : 'NOT FOUND');
  if (line) {
    // eslint-disable-next-line no-new-func
    const merge = new Function('local', 'remote', `return ${line[1]};`);
    const cases = [
      [{ seenProfessorIntro: false }, { seenProfessorIntro: true }, true],
      [{ seenProfessorIntro: true }, { seenProfessorIntro: false }, true],
      [{ seenProfessorIntro: true }, {}, true],
      [{}, { seenProfessorIntro: true }, true],
      [{}, {}, false],
    ];
    const wrong = cases.filter(([l, r, want]) => merge(l, r) !== want);
    ok(wrong.length === 0, 'the merge is OR: seen on either phone is seen on both',
      wrong.map(([l, r]) => `${JSON.stringify(l)}+${JSON.stringify(r)}`).join(' ') || '5 cases');
  }
  const ret = sync.slice(sync.indexOf('export function mergeStates'));
  ok(/\n\s+seenProfessorIntro,\n/.test(ret), 'and the merged value is returned');
}

// ═════════════════════════════════════════════════════════════════════════════
head('2 · THE VOICE SAYS THE SCRIPT');
//
// The words live in professorScript.ts; make-professor-voice.mjs timed each take
// against them and wrote professorVoice.ts. A line rewritten after its render would
// put new words in the caption over the old ones in his mouth, and nothing else
// could tell. Both files are zero-import, so Node reads them directly.
const { pathToFileURL } = await import('node:url');
const path = await import('node:path');
const load = async (rel) => import(pathToFileURL(path.resolve(rel)).href);
const { LINES } = await load('components/professor/professorScript.ts');
const { VOICE_LINES } = await load('components/professor/professorVoice.ts');
{
  ok(VOICE_LINES.length === LINES.length, 'one take per line', `${VOICE_LINES.length} takes, ${LINES.length} lines`);
  const off = LINES.filter((l, i) => VOICE_LINES[i]?.key !== l.key || VOICE_LINES[i]?.text !== l.text.replace(/\s+/g, ' ').trim());
  ok(off.length === 0, 'each take was timed against the words the script holds now',
    off.map((l) => l.key).join(' ') || 'all six');
  let prev = -1, order = true, words = true;
  for (const v of VOICE_LINES) {
    if (!(v.at > prev)) order = false;
    prev = v.at;
    const n = v.text.split(' ').length;
    if (v.words.length !== n || v.words.some((w, k) => w < 0 || w > v.dur || (k > 0 && w < v.words[k - 1]))) words = false;
  }
  ok(order, 'the lines sit in the MP3 in order');
  ok(words, 'every word has a start inside its take, in order');
  ok(fs.existsSync('assets/professor/voice/professor.mp3'), 'the MP3 is in the tree');
  const total = VOICE_LINES.at(-1).at + VOICE_LINES.at(-1).dur;
  ok(total >= 25 && total <= 45, 'the lecture is about forty seconds of speech', `${total.toFixed(1)}s`);
  // NO COUNT IS SPOKEN (§14): a recording cannot be re-derived when the library grows.
  const counted = LINES.filter((l) => /\b\d+\b|\b(hundred|thousand|dozen)\b/i.test(l.text));
  ok(counted.length === 0, 'no number of lessons is spoken', counted.map((l) => l.key).join(' ') || 'none');
}

// ═════════════════════════════════════════════════════════════════════════════
head('3 · THE CHALK STAYS ON THE BOARD, AND IN ORDER');
//
// Six drawings (chalk.ts), each laid out as pieces with every stroke timed. What a
// picture cannot report: a stroke off the board, a window running backwards, a
// letter the font does not have (a missing glyph is SILENTLY skipped by the layout,
// so a word would be written with a hole in it), and chalk too faint on the slate.
{
  const C = await import('@/components/professor/chalk');
  const H = await import('@/components/professor/hershey');
  const T = await import('@/components/shared/tone');
  const ids = [...new Set(LINES.map((l) => l.chalk))];
  ok(ids.length === LINES.length, 'every line draws a board of its own', ids.join(' · '));
  const off = [], time = [], order = [], glyph = [];
  for (const id of ids) {
    const pieces = C.layoutChalk(id);
    let last = -1;
    for (const p of pieces) {
      const b = p.box;
      if (b.x < 0 || b.y < 0 || b.x + b.w > C.BOARD_W || b.y + b.h > C.BOARD_H) off.push(`${id}:${p.text ?? 'shape'}`);
      if (!(p.t0 >= 0 && p.t1 <= 1 + 1e-9 && p.t0 < p.t1)) time.push(`${id}:${p.text ?? 'shape'}`);
      if (p.t0 < last - 1e-9) order.push(id);
      last = p.t1;
      for (const s of p.strokes) if (!(s.t0 < s.t1)) time.push(`${id} stroke`);
      for (const ch of (p.text ?? '').toUpperCase().replace(/[’‘]/g, "'")) {
        if (ch !== ' ' && !H.GLYPHS[ch]) glyph.push(`${id}:"${ch}"`);
      }
    }
    if (Math.abs(last - 1) > 1e-6) time.push(`${id} ends at ${last.toFixed(3)}`);
  }
  ok(off.length === 0, 'every piece of chalk lies inside the board', off.join(' ') || `${ids.length} boards`);
  ok(time.length === 0, 'every stroke has a forward window inside its line, and the last ends the line', time.slice(0, 4).join(' ') || 'all');
  ok(order.length === 0, 'and the pieces are written in order', order.join(' ') || 'all');
  ok(glyph.length === 0, 'every letter the chalk writes is in the font', glyph.join(' ') || 'all present');

  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // The chalk is drawn at 0.92 over the slate, so it is measured as it lands.
  const chalk = T.mix(T.DEEP, T.PAPER_LIT, 0.92);
  ok(ratio(chalk, T.DEEP) >= 4.5, 'chalk reads on the slate', `${ratio(chalk, T.DEEP).toFixed(2)}:1`);
}

// ═════════════════════════════════════════════════════════════════════════════
head('5 · THE PROFESSOR, STEPPED AT 60FPS');
//
// professorAt is a pure function of time, so the whole film is replayed here through
// the real rig: nothing may teleport, his feet may not slide while he talks, the lines
// run forward, and each board is finished before the next line wipes it.
{
  const P = await import('@/components/professor/professorAt');
  const RIG = await import('@/components/lesson/cinematic/rig');
  const ROOM = await import('@/components/professor/lectureRoom');
  const joints = (t) => {
    const F = P.professorAt(t);
    const s = F.stance;
    return RIG.solve({
      x: F.x, groundY: ROOM.GROUND, k: P.K_PROF, dir: F.dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    });
  };
  const KEYS = ['head', 'shB', 'elL', 'elR', 'wrL', 'wrR', 'kneeL', 'kneeR', 'ankL', 'ankR'];
  let worst = 0, worstAt = 0, slide = 0, slideAt = 0, back = false, nearHead = Infinity, nearAt = 0;
  let prev = joints(0), prevLine = -1;
  const dt = 1 / 60;
  for (let t = dt; t <= P.T_END + 0.5; t += dt) {
    const j = joints(t);
    for (const k of KEYS) {
      if (!j[k] || !prev[k]) continue;
      const d = Math.hypot(j[k].x - prev[k].x, j[k].y - prev[k].y);
      // Off-stage frames do not count: nobody can see a jump past the edge.
      if (d > worst && j[k].x < ROOM.STAGE_W) { worst = d; worstAt = t; }
    }
    if (t > P.T_ARRIVE + 0.1) {
      for (const k of ['ankL', 'ankR']) {
        const d = Math.hypot(j[k].x - prev[k].x, j[k].y - prev[k].y);
        if (d > slide) { slide = d; slideAt = t; }
      }
    }
    // A HAND AT THE HEAD IS A MAN SCRATCHING IT. The first draft's "point up at the
    // board" put the hand beside his cheek; a gesture must stay clear of the head.
    if (t > P.T_ARRIVE) {
      for (const k of ['wrL', 'wrR']) {
        const d = Math.hypot(j[k].x - j.head.x, j[k].y - j.head.y);
        if (d < nearHead) { nearHead = d; nearAt = t; }
      }
    }
    const li = P.lineAt(t);
    if (li < prevLine) back = true;
    prevLine = li;
    prev = j;
  }
  ok(worst < 9, 'no joint moves more than 9 units between two frames', `${worst.toFixed(2)} at ${worstAt.toFixed(2)}s`);
  ok(slide < 3, 'his feet stay planted while he talks', `${slide.toFixed(2)} a frame at worst, ${slideAt.toFixed(2)}s`);
  ok(!back, 'the lines only ever run forward');
  const clear = RIG.STR.headR * P.K_PROF * 1.25;
  ok(nearHead >= clear, 'his hands stay clear of his head while he talks',
    `closest ${nearHead.toFixed(1)} at ${nearAt.toFixed(2)}s, floor ${clear.toFixed(1)}`);
  ok(P.T_END >= 30 && P.T_END <= 45, 'the film runs thirty to forty-five seconds', `${P.T_END.toFixed(1)}s`);
  const late = [];
  for (let i = 0; i < P.LINE_T.length; i++) {
    const [a, b] = P.chalkWindow(i);
    const next = P.LINE_T[i + 1] ?? Infinity;
    if (a < P.LINE_T[i] || b > next) late.push(`line ${i + 1}: ${a.toFixed(2)}–${b.toFixed(2)}`);
  }
  ok(late.length === 0, 'every board starts on its line and is finished before the next wipes it', late.join(' · ') || 'all six');
}

// ═════════════════════════════════════════════════════════════════════════════
head('4 · THE FILM DECLARES NO COLOUR OF ITS OWN');
//
// The welcome screen shipped a palette the app had thrown out twice, because its
// colours were hex LITERALS and a literal cannot be repainted (CLAUDE.md §19). The
// same rule, from the first day, for the professor.
{
  const dir = 'components/professor';
  const hits = [];
  for (const f of fs.readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n))) {
    const src = strip(read(`${dir}/${f}`));
    for (const m of src.matchAll(/#[0-9A-Fa-f]{3,8}\b|rgba?\((?![^)]*\$\{)[^)]*\)/g)) hits.push(`${f}: ${m[0]}`);
  }
  ok(hits.length === 0, 'no hex or literal rgb() anywhere in components/professor/', hits.slice(0, 4).join(' · ') || 'none');
}

console.log(bad === 0 ? '\nPASS — the intro keeps its promises.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
