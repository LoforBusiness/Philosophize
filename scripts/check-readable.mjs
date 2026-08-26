// CAN THE READER ACTUALLY READ THE WORDS IN THE BOXES?
//
// The reader has now said this twice:
//
//   "the words in questions or the words in boxes or words in general above the
//    stickman aren't visible. It's just blank boxes."
//   "I am still seeing that there are boxes that are blank and I cannot see what
//    is in them, this still needs to be fixed."
//
// The first answer was `check:legible` — declared fontSize × the stage's `fit`,
// worked out offline from each scene's band. That was a real defect and it is
// fixed. But it is arithmetic about ONE cause, and the complaint came back, so
// the arithmetic was not the whole of it.
//
// This asks the question the other way round: render the lesson, walk every beat,
// and measure every word the scene actually draws — at the size it lands, at the
// opacity it lands, against the thing behind it, inside whatever is clipping it.
// Four causes, one measurement each:
//
//   TINY   the glyphs land under 8 CSS px. `check:legible` predicts this from the
//          band; here it is measured through the real transform chain, which also
//          catches a Text scaled by a parent — something no source scan can see.
//   CUT    the ink is clipped by an ancestor box. React Native Web gives every
//          View `overflow: hidden`, so a caption that outgrew its fixed-height
//          box is silently sliced — and RAISING 338 FONT SIZES is exactly the
//          thing that would cause it. A fix that causes the defect it was fixing
//          is worth a check of its own.
//   FAINT  the glyph does not contrast with what is behind it ONCE IT HAS BEEN
//          COMPOSITED at the opacity it is drawn with. This is the one that made
//          the difference: a scene that dims a whole layer to push it back is
//          doing something perfectly ordinary, and the caption inside it still
//          reaches the eye at 1.3:1 while its declared colour reads 5.1:1.
//
// Measured AFTER the camera settles, for the reason check-frame gives: a shot in
// transit crops things that arrive a moment later, and two runs then disagree.
//
// USAGE — needs the web bundle and a headless Chrome (§21):
//   npx expo start --web --port 8861 --clear
//   curl -s -o /dev/null "http://localhost:8861/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/check-readable.mjs                    # every cinematic lesson
//   node scripts/check-readable.mjs ids.json out.json  # a chosen list, merged
//
// READ_ROUTE gives a run its own route file and URL, for the collision in §21
// that is NOT covered by the lock: a second session driving its own Metro against
// the same working tree deletes this file mid-sweep, and the page then answers
// "This screen doesn't exist" — which reads exactly like a broken route table.
import http from 'node:http';
import fs from 'node:fs';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

// ── the second stage: PIXELS ─────────────────────────────────────────────────
//
// The probe below decides what a word is sitting on by walking its ANCESTORS for
// a background colour, and that is a guess rather than a measurement. It cannot
// see a SIBLING painted underneath — which is the commonest way a scene builds a
// two-state label:
//
//     <View style={bolt}>                     // backgroundColor: PAPER
//       <Animated.View style={boltFill} />    // backgroundColor: INK, grows
//       <Text style={{ color: PAPER }}>TRUE</Text>
//
// Walking upward finds PAPER and reports paper-on-paper at 1.0:1. On screen the
// word is cream on solid ink and perfectly readable. The first sweep called 205
// words faint and a good share of them were this.
//
// So a FAINT is only a finding once the PIXELS agree. One screenshot of the beat,
// crop the word's own rectangle, and measure the contrast between its darkest and
// lightest tenth. That needs no theory about opacity, z-order, blending or
// siblings — it is what the eye gets.
const { default: Jimp } = await import('jimp-compact').then((m) => ({ default: m.default ?? m }));

/** Contrast between the dark tenth and the light tenth of a cropped word. */
function inkRange(img, x, y, w, h) {
  const W = img.bitmap.width, H = img.bitmap.height;
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  if (x1 - x0 < 2 || y1 - y0 < 2) return null;
  const ls = [];
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const i = (W * py + px) << 2;
      const d = img.bitmap.data;
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      ls.push(0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]));
    }
  }
  ls.sort((a, b) => a - b);
  // Tenths rather than min/max: one stray anti-aliased pixel from a neighbouring
  // rule would otherwise say a blank box is full of contrast.
  const lo = ls[Math.floor(ls.length * 0.1)];
  const hi = ls[Math.floor(ls.length * 0.9)];
  return (hi + 0.05) / (lo + 0.05);
}

const PORT = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE_NAME = process.env.READ_ROUTE || 'previewread';
const BASE = `http://localhost:${WEB}/${ROUTE_NAME}`;
const LANES = +(process.env.LANES || 5);
/** Patience for the stage, in half-seconds. A slow machine is not a broken scene (§21). */
const STAGE_TRIES_FIRST = +(process.env.STAGE_TRIES_FIRST || 220);
const STAGE_TRIES = +(process.env.STAGE_TRIES || 60);

/** The floor, in CSS px on a 390-wide viewport — the same dp a phone reports. */
const FLOOR = 8.0;
/** How much of a word's ink must survive its clipping ancestors. */
const KEEP = 0.88;
/**
 * Text-grade contrast, measured after the fade. Below this a word is a texture.
 *
 * 3.0 rather than 4.5: these are display captions on a stage, mostly bold and
 * letter-spaced, and 4.5 is the floor for body copy. It is also the number the
 * rest of the app is held to for a MARK (§19), and a word on the stage is closer
 * to a mark than to a paragraph.
 */
const CONTRAST = 3.0;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the probe ────────────────────────────────────────────────────────────────
const PROBE = `(() => {
  const FLOOR = ${FLOOR}, KEEP = ${KEEP}, CONTRAST = ${CONTRAST};
  const clipEl = document.getElementById('stage-clip');
  if (!clipEl) return JSON.stringify({ none: true });

  // RGB, not luminance, because a faded word has to be COMPOSITED before it can be
  // measured — see \`con\` below. Blending luminances is not the same operation and
  // gives the wrong answer for exactly the cases that matter.
  const rgb = (c) => {
    const m = /rgba?\\(([^)]+)\\)/.exec(c || '');
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    const a = p.length > 3 ? p[3] : 1;
    if (a < 0.05) return null;
    return { r: p[0], g: p[1], b: p[2], a };
  };
  const lum = (c) => {
    if (!c) return null;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const over = (fg, bg, a) => ({ r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) });
  const ratio = (a, b) => { const hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); };

  // THE CHARACTERS, NOT THE LAYOUT BOX. A centred Text in a wide container has a
  // box far wider than its glyphs; measuring the box calls a caption clipped when
  // only its padding left the frame. Same reasoning as check-frame's \`inked\`.
  const inked = (d) => {
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      const r = rg.getBoundingClientRect();
      if (r.width > 0.5 && r.height > 0.5) return r;
    } catch (e) {}
    return d.getBoundingClientRect();
  };

  // MAKE EVERYTHING HIT-TESTABLE FOR THE DURATION OF THE READ.
  //
  // Every question about what is BEHIND a word goes through elementsFromPoint, and
  // elementsFromPoint skips anything with pointer-events: none. A scene sets that on
  // very nearly everything it draws, because none of it is meant to be tappable — so
  // the probe was blind to exactly the fills that matter. A PAPER word on an INK
  // badge measured as paper on paper: 1.0:1, reported as a blank box, and perfectly
  // clear on screen. political-8's SEES badge is the case that made it obvious.
  //
  // One stylesheet, added before the scan and removed after, rather than a guess per
  // word. It changes nothing the reader sees: pointer-events has no paint.
  const hitStyle = document.createElement('style');
  hitStyle.textContent = '*{pointer-events:auto!important}';
  document.head.appendChild(hitStyle);

  const out = [];
  const seenWords = [];
  // BOTH BOXES, NOT JUST THE STAGE.
  //
  // The first version of this scanned #stage-clip only, so it never once looked at
  // the half of the screen the reader answers with — the control's own labels, its
  // live readout, the prompt and the explanation. The reader found that half by
  // reading it:
  //
  //   "for the new answering of questions, I have noticed a lot of the words are
  //    cut off from there"
  //
  // And they would be: the control takes its natural height off the top of the
  // lower box, and the deck below it is overflow:hidden, so a tall control eats the room the
  // words were supposed to have. A harness that measures the picture and not the
  // question measures the half that was already fine.
  const roots = [clipEl];
  const lowerEl = document.getElementById('lower-deck');
  if (lowerEl) roots.push(lowerEl);
  const nodes = [];
  for (const root of roots) for (const el of root.querySelectorAll('div,span')) nodes.push(el);
  for (const d of nodes) {
    if (d.children.length !== 0) continue;
    const txt = (d.textContent || '').trim();
    if (txt.length < 2) continue;
    const s = getComputedStyle(d);
    if (s.display === 'none' || s.visibility === 'hidden') continue;

    // ── how big does it LAND? ────────────────────────────────────────────────
    // \`fontSize\` is the declared size in the element's own space; the stage scales
    // the whole design space by \`fit\`, and a scene may scale a group again on top.
    // offsetWidth is pre-transform and the client rect is post-transform, so their
    // ratio is the cumulative scale actually applied — which is the only number
    // that says anything about what reaches the reader.
    const declared = parseFloat(s.fontSize) || 0;
    const box = d.getBoundingClientRect();
    const k = d.offsetWidth > 0.5 ? box.width / d.offsetWidth : 1;
    const size = declared * (k > 0.01 && k < 20 ? k : 1);

    // ── cumulative opacity, and what is CLIPPING it ─────────────────────────
    let alpha = 1, node = d;
    const clips = [];
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      alpha *= parseFloat(cs.opacity);
      if (cs.overflow !== 'visible' && node !== d) clips.push(node.getBoundingClientRect());
      node = node.parentElement;
    }

    // ── how much of the ink survives what is clipping it? ───────────────────
    //
    // THE GLYPHS, NOT THE LINE BOX. A Range over a text node returns the LINE box,
    // which is lineHeight tall — and a scene that sizes a plate to its lettering
    // trims the leading above and below without touching a letter. Measured on the
    // line box, that reads as 15-20% clipped, which is how 41 of 76 findings came
    // to be captions nobody could see anything wrong with. Inter runs about 0.95em
    // from cap to descender, so the glyph band is the middle of the line box; on a
    // wrapped Text the box is a whole multiple of the line and this is skipped.
    const raw = inked(d);
    const oneLine = declared > 0 && raw.height < declared * 2;
    const trim = oneLine ? Math.max(0, (raw.height - declared * 0.95) / 2) : 0;
    const r = {
      left: raw.left, right: raw.right, width: raw.width,
      top: raw.top + trim, bottom: raw.bottom - trim, height: raw.height - trim * 2,
    };
    let keep = 1;
    // WHICH EDGE, AND BY HOW MUCH. A keep fraction says a word is being sliced; it
    // does not say where to move it, and 0.6 is the same number whether a caption
    // has run off the right of the stage or sits three units above the band. over
    // overhang is the distance past the tightest clip in screen px, in CSS order,
    // and divided by the scene's own scale it IS the edit.
    //
    // NOT NAMED over. That is the colour-compositing helper this file has had all
    // along, and a let-over inside the per-word loop shadows it for the whole
    // body — so groundAt threw "over is not a function" on the FIRST word of the
    // FIRST beat, the probe returned nothing, and the harness recorded every one
    // of 186 lessons as ONLY 1 BEAT REACHED. It printed no error while doing it:
    // a null read is treated exactly like a finished lesson.
    let overhang = [0, 0, 0, 0];
    for (const c of clips) {
      const w = Math.min(r.right, c.right) - Math.max(r.left, c.left);
      const h = Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top);
      const f = w > 0 && h > 0 ? (w * h) / (r.width * r.height) : 0;
      if (f < keep) {
        keep = f;
        overhang = [
          Math.max(0, c.top - r.top), Math.max(0, r.right - c.right),
          Math.max(0, r.bottom - c.bottom), Math.max(0, c.left - r.left),
        ];
      }
    }
    // NOT ON SCREEN AT ALL IS NOT A BLANK BOX.
    //
    // A scene parks labels off and fades them in, and a word at 3% opacity is not
    // a smear the reader strains at — it is a word that has not arrived. The
    // threshold is a FIFTH rather than 0, and the difference is the BOX: at 6% a
    // caption is invisible and so is the frame around it, which is an empty stage
    // rather than a blank box — and a control-driven layer on its way out passes
    // through there legitimately. By 20% the frame is a ghost too. What the reader
    // complained about is a box they can SEE with words they cannot read, and that
    // needs both halves present. The clip test is the same argument in
    // the other axis: a word its clip has removed entirely is a prop waiting in
    // the wings, which is the distinction check-frame draws between straddling
    // the crop and sitting outside it. Asking the paint stack about a point that
    // is not being drawn would also answer about the wrong element.
    if (alpha <= 0.2 || keep <= 0.02) continue;

    // ── and what is actually BEHIND it ──────────────────────────────────────
    //
    // Walking upward for a background colour is the obvious way and it is wrong,
    // because the commonest two-state label in these scenes paints its ground as
    // a SIBLING:
    //
    //     <View style={bolt}>                     // backgroundColor: PAPER
    //       <Animated.View style={boltFill} />    // backgroundColor: INK, grows
    //       <Text style={{ color: PAPER }}>TRUE</Text>
    //
    // The ancestor walk finds PAPER and calls cream-on-solid-ink a 1.0:1 blank.
    // \`elementsFromPoint\` returns the paint stack at a point, so the first thing
    // under the word with a ground of its own IS the ground — sibling or ancestor,
    // in the right order, with no theory required.
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    // A WORD UNDER ANOTHER WORD IS NOT A BLANK BOX — AND IT IS NOT SKIPPED HERE.
    //
    // There used to be a guard on this spot that dropped a word outright when the
    // paint stack put another word above it, for the two-state label the note above
    // describes. It has been replaced by the pair rule further down, which reaches
    // the same verdict by a better route: it compares the two copies' CONTRAST and
    // clears the buried one only when its twin is genuinely legible.
    //
    // The difference is not academic. Dropping a word here removes it from the
    // findings entirely, and the political-7 exemption sums over those — that scene
    // hangs a charter that TEARS by drawing the same sheet in two clipped windows,
    // so every word across the seam is half in each and only complete when the two
    // halves are added together. Skip one half and the sum is 0.5, the exemption
    // does not fire, and twelve perfectly whole words are reported as sliced.
    //
    // Once the hit test could see through pointer-events (see the stylesheet above)
    // it started firing on exactly those halves, which is how this was found.
    // A rule that removes evidence can break a rule that counts it.
    const PAPER_BG = { r: 250, g: 250, b: 247 };
    const groundAt = (x, y) => {
      let stack;
      try { stack = document.elementsFromPoint(x, y); } catch (e) { return null; }
      if (!stack || !stack.length) return null;
      const from = stack.indexOf(d) + 1;
      for (let k = from > 0 ? from : 0; k < stack.length; k += 1) {
        const el = stack[k];
        const cs = getComputedStyle(el);
        const c = rgb(cs.backgroundColor);
        if (!c) continue;
        // Its own fade counts too: a ghosted ink panel is not ink to the eye.
        let ea = 1, n2 = el;
        while (n2 && n2 !== document.body) { ea *= parseFloat(getComputedStyle(n2).opacity); n2 = n2.parentElement; }
        return over(c, PAPER_BG, ea * (c.a ?? 1));
      }
      return null;
    };
    const behind = groundAt(cx, cy) || PAPER_BG;

    // CONTRAST AFTER THE FADE, WHICH IS THE ONLY CONTRAST THERE IS.
    //
    // Reading \`color\` alone measures a word the author declared, not the word the
    // reader gets. logic8 dims its whole garden layer to 0.24 to push it back —
    // a perfectly ordinary thing to do — and its SPRINKLER caption then reaches
    // the eye at 1.3:1 while \`color\` still says 5.1:1. A caption at 1.3:1 is what
    // the reader has been calling a blank box. So the glyph is composited over its
    // own ground at the opacity it is actually drawn with, and THAT is measured.
    const fgc = rgb(s.color);
    const bl = lum(behind);
    const con = fgc === null ? 99 : ratio(lum(over(fgc, behind, alpha * (fgc.a ?? 1))), bl);

    // WHOLLY INVISIBLE IS STAGING, NOT A DEFECT. A scene parks labels off and
    // fades them in; a word at opacity 0 is not a blank box, it is a word that has
    // not arrived. Every one of the first sweep's 20 TINY hits was one of these —
    // hidden, and measured small only because its container was mid-entrance.
    if (alpha <= 0.02) continue;
    // And neither is a word its clip has removed ENTIRELY: that is a prop waiting
    // in the wings, the same distinction check-frame draws between straddling the
    // crop and sitting outside it. Without this, a parked label is measured
    // against the empty paper behind it and reported as unreadable.
    if (keep <= 0.02) continue;

    // Kept whether or not it is a finding: the two-state rule below has to know
    // about the LEGIBLE copy of a word, and a legible copy is never a finding.
    seenWords.push({ t: txt, con, r: [r.left, r.top, r.right, r.bottom] });

    const why = [];
    if (size < FLOOR) why.push('TINY');
    // A word entirely outside its clip is a prop waiting in the wings; a word
    // PARTLY cut is a word being sliced. Same distinction check-frame draws.
    if (keep < KEEP) why.push("CUT");
    if (con < CONTRAST) why.push('FAINT');
    if (!why.length) continue;
    // The rect is carried so a FAINT can be confirmed against real PIXELS — see
    // the pixel confirmation at the top of this file. Ancestor colours are a guess.
    out.push({ why: why.join('+'), t: txt.slice(0, 34), full: txt,
      box: [r.left, r.top, r.right, r.bottom], size: +size.toFixed(1),
      keep: +keep.toFixed(2), con: +con.toFixed(1), a: +alpha.toFixed(2),
      r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      over: overhang.map((v) => Math.round(v * 10) / 10) });
  }

  // ── A WORD DRAWN TWICE IN ONE PLACE IS ONE WORD IN TWO STATES ─────────────
  //
  // The house pattern for a label that can be lit stacks two copies: an INK one on
  // the paper plate, and a PAPER one inside an INK fill that crossfades over it.
  // Both are in the DOM the whole time, so the hidden half is a real word sitting
  // under a fill of its own colour — arithmetically 1.0:1, and perfectly legible on
  // screen, because its twin is the thing the reader is looking at.
  //
  // groundAt cannot see this. It reads the paint stack with elementsFromPoint,
  // which SKIPS anything with pointer-events none — and a scene sets that on very
  // nearly everything it draws, because none of it is meant to be tappable. So the
  // covering fill is invisible to the probe and the buried copy measures as ink on
  // ink, at exactly 1.0:1, which is the signature these hits all carried.
  //
  // The rule has the same shape as the political-7 one below: judge the PAIR. If
  // the same string is drawn in the same place and one copy clears the floor, the
  // reader can read that word, and neither copy is a finding.
  const OVERLAP = 0.6;
  for (const h of out) {
    if (h.why.indexOf('FAINT') < 0) continue;
    const twin = seenWords.some((w) => {
      if (w.con < CONTRAST || w.t !== h.full) return false;
      const iw = Math.min(w.r[2], h.box[2]) - Math.max(w.r[0], h.box[0]);
      const ih = Math.min(w.r[3], h.box[3]) - Math.max(w.r[1], h.box[1]);
      if (iw <= 0 || ih <= 0) return false;
      const mine = (h.box[2] - h.box[0]) * (h.box[3] - h.box[1]);
      return mine > 0 && (iw * ih) / mine >= OVERLAP;
    });
    if (twin) h.why = h.why.split('+').filter((w) => w !== 'FAINT').join('+');
  }

  // ── TWO WINDOWS ONTO ONE SHEET IS NOT A CUT WORD ──────────────────────────
  //
  // political-7 hangs a charter that TEARS, and it does it by drawing the same
  // face twice inside two fixed-width windows with overflow:hidden, offset so the
  // pair reassembles into one sheet. Every word crossing the seam is therefore
  // half in one window and half in the other — complete on screen, and measured
  // as two separate 50%-clipped words. That one scene produced 33 of the first
  // sweep's 168 CUT hits and not one of them was a defect.
  //
  // So a word is cut only when the UNION of its copies on this beat is incomplete.
  // (Two genuinely half-cut copies of one string in a single beat would clear each
  // other; that has not happened, and it would be plain in the listing if it did.)
  const share = {};
  for (const h of out) if (h.why.indexOf('CUT') >= 0) share[h.t] = (share[h.t] || 0) + h.keep;
  for (const h of out) {
    if (h.why.indexOf('CUT') < 0 || share[h.t] < KEEP) continue;
    h.why = h.why.split('+').filter((w) => w !== 'CUT').join('+');
  }
  // full and box exist only for the two rules above — the report carries the
  // truncated string and the rounded rect.
  const kept = out.filter((h) => h.why.length > 0).map((h) => {
    const { full, box, ...rest } = h; return rest;
  });

  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a; }
  } catch (e) {}
  hitStyle.remove();
  return JSON.stringify({ out: kept, done: prog >= 0.999 });
})()`;

const ROUTE = `app/${ROUTE_NAME}.tsx`;
const ROUTE_SRC = `// WRITTEN BY scripts/check-readable.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewRead() {
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

const BEATS_BLOCK = /BEATS[^=]*=\s*\[([\s\S]*)\n\];/;
const BEAT_SPLIT = /\n\s{2}\},?\s*\n?/;

function allIds() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  return [...src.matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((m) => m[1]);
}

(async () => {
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : allIds();
  const outPath = process.argv[3] ?? null;
  const { release: cleanup } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-readable' });

  const makeTab = async () => {
    const tab = await put('/json/new?about:blank');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let mid = 0; const pending = new Map();
    const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
    await new Promise((r) => { ws.onopen = r; });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
    await send('Page.enable');
    await send('Runtime.enable');
    // Only the front tab of a headless window is laid out; a background tab never
    // fires its ResizeObserver, so the player's onLayout never runs.
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (process.env.READ_DEBUG && r?.exceptionDetails) {
        console.log(`      [dbg] THREW: ${r.exceptionDetails.exception?.description ?? JSON.stringify(r.exceptionDetails)}`.slice(0, 600));
      }
      return r?.result?.value;
    };
    // A synthetic `click`, because CDP's dispatchMouseEvent does not drive a React
    // Native Web Pressable — the trap §21 records three times over.
    const tap = () => evaluate(
      `(() => { const el = document.elementFromPoint(195, 700) || document.body;
        el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`,
    );
    const answerControl = () => evaluate(ANSWER_CONTROL);
    const answerScene = () => evaluate(
      `(() => { const ring = document.querySelector('#target-ring');
        if (ring && ring.parentElement) { ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        const card = [...document.querySelectorAll('[role="button"]')].find((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 60 && r.height > 28;
        });
        if (card) { card.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    const answerDeck = () => evaluate(
      `(() => { const clip = document.getElementById('stage-clip');
        const below = clip ? clip.getBoundingClientRect().bottom : 0;
        const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
          const r = e.getBoundingClientRect();
          return r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
        });
        if (b) { b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    const stamp = () => evaluate(
      `(() => { const bar = document.getElementById('beat-progress');
        try { if (bar) { const tf = getComputedStyle(bar).transform;
          if (tf && tf !== 'none') return new DOMMatrixReadOnly(tf).a; } } catch (e) {}
        return -1; })()`,
    );
    /**
     * WAIT FOR THE SCENE, NOT JUST THE CAMERA.
     *
     * The first version watched `#stage-cam`'s transform only, which answers "has
     * the camera stopped" and not "has the picture stopped". That was tolerable
     * while every transition lasted 0.82s. It stopped being tolerable the day a
     * walking beat started taking as long as the walk needs (C17b) — up to 4.8s —
     * because a prop still fading at both samples is reported as a steady state,
     * and a caption caught halfway through its own fade is reported as a word the
     * reader cannot read. A transient is not a defect.
     *
     * So the signature is the camera plus every opacity the scene is drawing, and
     * the wait ends when two consecutive reads agree.
     */
    const settle = async () => {
      let prev = null;
      for (let i = 0; i < 30; i += 1) {
        const now = await evaluate(
          `(() => {
            const c = document.getElementById('stage-cam');
            const clip = document.getElementById('stage-clip');
            let sig = c ? getComputedStyle(c).transform : 'x';
            if (clip) {
              const els = clip.querySelectorAll('div,span');
              for (let i = 0; i < els.length; i += 1) {
                const cs = getComputedStyle(els[i]);
                sig += '|' + cs.opacity + ',' + cs.transform;
              }
            }
            return sig;
          })()`,
        );
        if (now === prev) return;
        prev = now;
        await wait(220);
      }
    };
    /**
     * A plain viewport screenshot, decoded.
     *
     * NO `captureBeyondViewport` and NO `clip`: §19 records that the pair HANGS in
     * --headless=new, and a hang inside a lane is indistinguishable from a slow
     * page. The whole viewport is cheap enough and the cropping is done in Node.
     */
    const shoot = async (clip) => {
      try {
        const r = await send('Page.captureScreenshot', clip ? { format: 'png', clip } : { format: 'png' });
        if (!r?.data) return null;
        return await Jimp.read(Buffer.from(r.data, 'base64'));
      } catch { return null; }
    };
    return { evaluate, send, tap, answerScene, answerDeck, answerControl, stamp, settle, shoot, close: () => { try { ws.close(); } catch {} } };
  };

  // ── A WORD THE LESSON IS ABOUT FADING ─────────────────────────────────────
  //
  // D35 says a word is legible or absent, never dimmed to a smear. A1 outranks it,
  // and there is exactly one place where the two meet: a lesson whose ARGUMENT is
  // that a word goes pale.
  //
  // ethics-12 is Kant's universalisability, staged as a press that stamps I PROMISE
  // over and over — and as the copies multiply the word fades on every one of them
  // until the board is blank. That is the whole point: universalise the maxim and
  // it eats the practice it depends on. Making PROMISE legible throughout would
  // teach the opposite, exactly as wiring aesthetics-16's canvas to the control
  // would (R7c).
  //
  // Named rather than budgeted, so it explains itself and so a NEW faint word in
  // the same lesson still shows.
  const FADES_ON_PURPOSE = {
    'ethics-ethics-12': ['PROMISE'],
  };

  const nBeatsOf = (() => {
    const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
    const comps = new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
    const out = new Map();
    for (const [id, comp] of comps) {
      const base = comp.replace(/Lesson$/, '');
      const f = `components/lesson/cinematic/${base[0].toLowerCase()}${base.slice(1)}Script.ts`;
      if (!fs.existsSync(f)) continue;
      const body = fs.readFileSync(f, 'utf8').match(BEATS_BLOCK);
      if (!body) continue;
      out.set(id, body[1].split(BEAT_SPLIT).filter((c) => /\S/.test(c)).length);
    }
    return out;
  })();

  const report = [];
  let done = 0;
  const auditOne = async (T, id, first, nBeats) => {
    const { evaluate, tap, answerScene, answerDeck, answerControl, stamp, settle, send, shoot } = T;
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}&notour=1` });
    let up = false;
    const patience = first ? STAGE_TRIES_FIRST : STAGE_TRIES;
    for (let i = 0; i < patience; i += 1) {
      if (await evaluate("!!document.getElementById('stage-clip')")) { up = true; break; }
      await wait(500);
    }
    if (!up) { report.push({ id, beats: [], stepped: 0, blank: true }); console.log(`  ${String(++done).padStart(3)}/${ids.length}  ${id.padEnd(34)} NEVER RENDERED A STAGE`); return; }
    await wait(1200);

    const beats = [];
    let stepped = 0;
    let last = -1;
    let dead = false;
    for (let b = 0; b < 14; b += 1) {
      await settle();
      // TWO READINGS, AND ONLY WHAT SURVIVES BOTH.
      //
      // `settle` waits for the CAMERA, which is not the same as waiting for the
      // scene: a prop fading in on `tr` is mid-fade for as long as the transition
      // lasts, and since a walking beat now takes as long as the walk needs, that
      // can be several seconds. A single sample would report every fade-in as a
      // GHOST and every prop still sliding in as CUT. Anything that is genuinely
      // a defect is a defect a second later too.
      const read = async () => {
        const raw = await evaluate(PROBE);
        return raw ? JSON.parse(raw) : null;
      };
      // A PROBE THAT THREW IS NOT A LESSON THAT ENDED.
      //
      // These two used to be a bare `break`, which is right for a page that has
      // finished and catastrophic for a page that errored: a syntax fault in the
      // probe reads as every lesson stopping after one beat, and the sweep prints
      // a summary with zero findings and exits 0. It happened — a `let over` in
      // the word loop shadowed the colour helper of the same name, and 186
      // lessons came back "ONLY 1 BEAT REACHED" with no error anywhere. Run with
      // READ_DEBUG=1 to see what the page actually threw.
      const a = await read();
      if (!a) { dead = true; break; }
      if (a.none) break;
      await wait(1400);
      const c = await read();
      if (!c) { dead = true; break; }
      // AND ONLY WHAT SURVIVES BOTH AT THE SAME VALUE.
      //
      // Matching on the finding alone is not enough. `settle` waits for the CAMERA,
      // and a scene's own transitions outlast it — a beat that walks takes as long
      // as the walk needs, so a label fading out over four seconds is still fading
      // at both reads and looks like a label resting at 0.58. metaphysics-8's
      // BEFORE YOU WERE BORN is exactly that, and it is not a defect: it is a word
      // leaving. A word that is genuinely too faint or too clipped reads the SAME a
      // second and a half later; a word in transit does not.
      const key = (h) => `${h.why}|${h.t}`;
      const SETTLED = 0.04;
      const later = new Map((c.out ?? []).map((h) => [key(h), h]));
      let hits = (a.out ?? []).filter((h) => {
        const then = later.get(key(h));
        if (!then) return false;
        if (Math.abs((then.a ?? 1) - (h.a ?? 1)) > SETTLED) return false;
        return Math.abs((then.keep ?? 1) - (h.keep ?? 1)) <= SETTLED;
      });
      const got = { done: a.done || c.done };

      // CONFIRM EVERY FAINT AGAINST THE PIXELS, and drop the ones the screen
      // disagrees with. One screenshot per beat that has a suspect — a cheap
      // filter in front of an expensive check, rather than 1591 screenshots.
      if (hits.some((h) => h.why.includes('FAINT'))) {
        // CLIP THE CAPTURE TO THE SUSPECTS. A full 780x1688 frame has to be
        // PNG-decoded on the one Node thread, which serialises every lane and
        // made the sweep three times slower. The union of the suspect words is
        // usually a few thousand pixels. (`clip` alone is fine; it is `clip`
        // PLUS captureBeyondViewport that hangs in --headless=new, §19.)
        const sus = hits.filter((h) => h.why.includes('FAINT'));
        const pad = 2;
        const bx = Math.max(0, Math.min(...sus.map((h) => h.r[0])) - pad);
        const byy = Math.max(0, Math.min(...sus.map((h) => h.r[1])) - pad);
        const bw = Math.max(...sus.map((h) => h.r[0] + h.r[2])) + pad - bx;
        const bh = Math.max(...sus.map((h) => h.r[1] + h.r[3])) + pad - byy;
        const shot = await shoot({ x: bx, y: byy, width: bw, height: bh, scale: 1 });
        // THE SCALE IS DERIVED FROM THE BITMAP, NOT ASSUMED.
        //
        // The viewport override sets deviceScaleFactor 2, and `clip.scale` then
        // multiplies on top of it — so a clipped capture does NOT reliably come
        // back at 2x, and indexing as though it did reads a rectangle somewhere
        // else in the image. That is a silent failure in the worst direction: the
        // crop lands on blank paper, measures no contrast, and CONFIRMS the
        // suspect. One division makes it true whatever the capture decides.
        const px = shot ? shot.bitmap.width / Math.max(1, bw) : 1;
        if (shot) {
          hits = hits.map((h) => {
            if (!h.why.includes('FAINT')) return h;
            const real = inkRange(shot, (h.r[0] - bx) * px, (h.r[1] - byy) * px, h.r[2] * px, h.r[3] * px);
            if (real === null) return h;
            h.px = +real.toFixed(1);
            // The screen wins. Ancestor colours are a guess; this is the page.
            if (real >= CONTRAST) {
              const rest = h.why.split('+').filter((w) => w !== 'FAINT');
              return rest.length ? { ...h, why: rest.join('+') } : null;
            }
            return h;
          }).filter(Boolean);
        }
      }
      const spared = FADES_ON_PURPOSE[id];
      if (spared) {
        hits = hits.map((h) => {
          if (!h.why.includes('FAINT') || !spared.includes(h.t)) return h;
          const rest = h.why.split('+').filter((w) => w !== 'FAINT').join('+');
          return rest ? { ...h, why: rest } : null;
        }).filter(Boolean);
      }
      if (hits.length) beats.push({ beat: b, hits });
      if (got.done) break;
      let moved = false;
      // READ AGAIN ONCE THE QUESTION IS ANSWERED.
      //
      // The explanation is the longest text in the deck and it does not exist until
      // the reader picks — so a sweep that only reads BEFORE answering never sees
      // the one piece of writing most likely to be clipped. D27 caps it at 290
      // characters on the reasoning that "the deck holds ~290", and that figure was
      // worked out for a deck with nothing above it. A control takes its height off
      // the top of the same box.
      let answered = false;
      for (let attempt = 0; attempt < 4 && !moved; attempt += 1) {
        if (attempt >= 1 && !answered) {
          if (attempt === 1) { await answerControl(); await wait(700); }
          if (attempt === 2) { await answerScene(); await wait(700); }
          if (attempt === 3) { await answerDeck(); await wait(700); }
          answered = true;
          await settle();
          const post = await read();
          if (post && post.out && post.out.length) {
            const seen = new Set(hits.map((h) => `${h.why}|${h.t}`));
            // CLIPPING ONLY, ONCE THE QUESTION IS ANSWERED.
            //
            // After a pick the deck is choreographing: the rejected card crumples
            // away at 0.14, layers dim to make room for the reveal, the wrong
            // option recedes. Every one of those is a word deliberately on its way
            // out, and counting them turned 11 findings into 147 — all of them
            // things the scene meant to discard.
            //
            // A BOX TOO SMALL is not choreography. The explanation is the longest
            // text in the deck and only exists after the pick, so this second read
            // is here for exactly one thing: whether the words that arrive to
            // explain the answer fit the room a control left them.
            const extra = post.out
              .filter((h) => h.why.indexOf('CUT') >= 0)
              .filter((h) => !seen.has(`${h.why}|${h.t}`));
            if (extra.length) {
              const at = beats.find((x) => x.beat === b);
              if (at) at.hits.push(...extra);
              else beats.push({ beat: b, hits: extra });
            }
          }
          answered = false;
        }
        await tap();
        await wait(2600);
        for (let t = 0; t < 12 && !moved; t += 1) {
          const now = await stamp();
          const idx = now < 0 || !nBeats ? -1 : Math.round(now * nBeats) - 1;
          if (process.env.READ_DEBUG) console.log(`      [dbg] b${b} prog=${now} nBeats=${nBeats} idx=${idx} last=${last}`);
          if (idx < 0 || idx > last) { last = idx; moved = true; break; }
          await wait(250);
        }
      }
      if (!moved) break;
      stepped += 1;
    }
    report.push({ id, beats, stepped, ...(dead ? { dead: true } : {}) });
    done += 1;
    const n = (k) => beats.reduce((a, x) => a + x.hits.filter((h) => h.why.includes(k)).length, 0);
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : (n('TINY') + n('CUT') + n('FAINT'))
        ? `${n('TINY') ? `${n('TINY')} tiny · ` : ''}${n('CUT') ? `${n('CUT')} cut · ` : ''}${n('FAINT') ? `${n('FAINT')} faint` : ''}`.replace(/ · $/, '')
        : 'readable';
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}`);
  };

  const queue = [...ids];
  const runLane = async (T) => {
    let laneFirst = true;
    for (;;) {
      const id = queue.shift();
      if (id === undefined) return;
      const first = laneFirst; laneFirst = false;
      try { await auditOne(T, id, first, nBeatsOf.get(id) ?? 0); }
      catch (e) { console.log(`  ${id.padEnd(34)} ERRORED: ${String(e).slice(0, 60)}`); done += 1; }
    }
  };
  const lanes = [];
  for (let i = 0; i < Math.min(LANES, ids.length); i += 1) lanes.push(await makeTab());
  console.log(`reading ${ids.length} lessons across ${lanes.length} tabs`);
  await Promise.all(lanes.map((T) => runLane(T)));
  for (const T of lanes) T.close();

  console.log('\nWHAT THE READER CANNOT READ\n');
  // A SWEEP THAT DID NOT MOVE IS NOT A PASS — said before the result, for the
  // reason check-frame gives.
  const stuck = report.filter((r) => (r.stepped ?? 0) < 2);
  const totalBeats = report.reduce((a, r) => a + (r.stepped ?? 0) + 1, 0);
  console.log(`  ${report.length} lessons · ${totalBeats} beats actually reached`);
  if (stuck.length) {
    console.log(`  ${stuck.length} lesson(s) never got past their second beat — NOT audited:`);
    console.log(`      ${stuck.map((r) => r.id).join(', ')}`);
  }
  const count = (k) => report.reduce((a, r) => a + r.beats.reduce((b, x) => b + x.hits.filter((h) => h.why.includes(k)).length, 0), 0);
  const lessons = (k) => report.filter((r) => r.beats.some((x) => x.hits.some((h) => h.why.includes(k)))).length;
  for (const k of ['TINY', 'CUT', 'FAINT']) {
    console.log(`    ${k.padEnd(6)} ${String(count(k)).padStart(4)} words  (${lessons(k)} lessons)`);
  }
  const worst = [];
  for (const r of report) for (const b of r.beats) for (const h of b.hits) worst.push({ id: r.id, beat: b.beat, ...h });
  worst.sort((a, b) => (a.size - b.size) || (a.keep - b.keep));
  console.log('\n  the twenty least readable:');
  for (const w of worst.slice(0, 20)) {
    console.log(`    ${w.why.padEnd(11)} ${w.size.toFixed(1).padStart(5)}px keep ${w.keep.toFixed(2)} con ${String(w.con).padStart(4)} a ${w.a}  ${w.id} b${w.beat}  "${w.t}"`);
  }

  const dead = report.filter((r) => r.dead);
  if (dead.length) {
    console.log(`\n  ${dead.length} lesson(s) STOPPED BECAUSE THE PROBE THREW — this sweep measured nothing there.`);
    console.log(`      ${dead.slice(0, 8).map((r) => r.id).join(', ')}${dead.length > 8 ? ', …' : ''}`);
    console.log('      READ_DEBUG=1 prints what the page threw. A zero here is not a pass.');
  }

  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 1));
  cleanup();
  process.exit(dead.length ? 1 : 0);
})();
