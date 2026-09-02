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
import { sweepStaleTabs, closeTab } from './lib/cdptab.mjs';
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
  // AND INPUTS, WHICH IS NOT A DETAIL — see components/lesson/cinematic/ControlRead.
  //
  // This walked 'div,span'. The reading above every analogue control was an
  // ACounter, which is an Animated(TextInput), which on the web is an <input> —
  // neither a div nor a span, so the biggest word on the beat was never once
  // measured here. 285 of 1,127 readings were running off the right-hand edge
  // while this file reported the lower deck clean.
  //
  // A CHECK THAT WALKS A LIST OF ELEMENT KINDS CANNOT SEE A NEW KIND. The readings
  // are wrapping <Text> now so they arrive as divs anyway; inputs stay on the list
  // because SplitBar's two running percentages are still ACounters and legitimately
  // must be, and because the next component to reach for one should not be able to
  // disappear from this sweep by doing so.
  for (const root of roots) for (const el of root.querySelectorAll('div,span,input')) nodes.push(el);

  // ── EVERY PAINTED THING ON THE STAGE, IN PAINT ORDER ────────────────────────
  //
  // elementsFromPoint was used for this and it CANNOT SEE MOST OF THE SCENE:
  // hit-testing skips anything with pointer-events none, and nearly every
  // decorative element in these scenes sets it — the marker line that struck a
  // caption in political19 is pointerEvents none, and so is the panel whose
  // edge sliced the caption below it. The UNDER rule had been structurally blind
  // to almost all scene art since it was written, and reported those beats clean.
  //
  // So the geometry is read directly instead. Document order stands in for paint
  // order, which is what React Native Web gives absolutely-positioned siblings
  // without a z-index — the whole corpus.
  // ONE PASS, ONE ORDER COUNTER — painted boxes AND words together.
  //
  // These were two loops with the word pass numbered 1e6, which made every word
  // the last thing drawn: the word under test then had a higher order than every
  // box, the 'drawn after me' filter excluded all of them, and STRIKE fell
  // straight back to zero. A paint-order comparison needs ONE sequence.
  const painted = [];
  const CR = clipEl.getBoundingClientRect();
  // SCENE UNITS, so a finding can be matched back to a style without a browser.
  // #stage-cam carries the camera transform with transformOrigin 0% 0%, so its own
  // rect's top-left is the image of scene (0,0) and its width is STAGE_W x the
  // total scale — one division recovers both, exactly as mustprobe does it.
  const CAMEL = document.querySelector('#stage-cam');
  const CAMR = CAMEL ? CAMEL.getBoundingClientRect() : null;
  const K = CAMR && CAMR.width ? CAMR.width / 400 : 0;
  const toScene = (x, y, w, h) => (!K ? '' : ' scene ' + Math.round(w / K) + 'x' + Math.round(h / K)
    + ' @' + Math.round((x - CAMR.x) / K) + ',' + Math.round((y - CAMR.y) / K));
  {
    let order = 0;
    for (const el of clipEl.querySelectorAll('*')) {
      order += 1;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rr = el.getBoundingClientRect();
      if (rr.width < 1 || rr.height < 1) continue;
      const leafText = el.children.length === 0 && (el.textContent || '').trim().length >= 2;
      // OPACITY COUNTS FOR WORDS TOO. Scenes cross-fade constantly, so a caption on
      // its way out is still in the DOM at opacity 0 — and counting it as something
      // that covers its neighbour invents a collision on every transition.
      let vis = 1, n5 = el;
      while (n5 && n5 !== document.body) { vis *= parseFloat(getComputedStyle(n5).opacity); n5 = n5.parentElement; }
      if (vis < 0.6) continue;
      // AN OUTLINE IS NOT A SLAB, AND THE OLD ARITHMETIC SAID IT WAS.
      //
      //   solid = ea * ((c && c.a) || 1)
      //
      // A transparent background parses to alpha 0, so that middle term is 0,
      // which is falsy, so the OR promoted it to FULLY OPAQUE.
      // (No back-ticks in this comment: the whole probe is a template literal,
      //  so a quoted snippet here becomes an interpolation and throws.) Every outlined box
      // in every scene counted as a filled rectangle covering everything it
      // enclosed or crossed — including the deck's own 390-wide frame, which is
      // what put narration lines on the strike list. An unfilled bordered box
      // paints its FRAME and nothing else, so it is carried with its border bands
      // and only those bands can strike a word.
      let solid = false, frame = 0;
      let ea = 1, n4 = el;
      while (n4 && n4 !== document.body) { ea *= parseFloat(getComputedStyle(n4).opacity); n4 = n4.parentElement; }
      if (!leafText) {
        const c = rgb(cs.backgroundColor);
        const fill = c ? c.a : 0;
        solid = ea * fill >= 0.6;   // a thin scrim is legitimate
        if (!solid) {
          frame = Math.max(
            parseFloat(cs.borderTopWidth || '0'), parseFloat(cs.borderRightWidth || '0'),
            parseFloat(cs.borderBottomWidth || '0'), parseFloat(cs.borderLeftWidth || '0'),
          );
          if (ea < 0.6) frame = 0;
        }
      }
      if (!leafText && !solid && !frame) continue;
      // A BOX IS ONLY WHERE IT IS ACTUALLY PAINTED, AND A RECT DOES NOT KNOW THAT.
      // getBoundingClientRect ignores an ancestor's overflow:hidden, so the floor
      // every scene now lays down (top: GROUND, bottom: 0) reports a rect running
      // far below the stage crop and out into the deck. Clipped to the crop it is
      // the strip the reader sees; unclipped it was striking narration.
      // EVERY CLIPPING ANCESTOR, NOT JUST THE CROP. The first version of this
      // intersected with the stage crop alone and a rung immediately proved that
      // is not enough: ethics31 scrolls its ladder inside its own overflow:hidden
      // window, and the rung parked one space ABOVE that window reported a rect
      // sitting across THE SHELF's label. Visually it is not there at all. Walk up
      // to the crop and clip against each ancestor that hides its overflow.
      // A TILTED BOX'S RECT IS NOT ITS INK, AND THE DIFFERENCE IS ALL AT THE EDGES.
      //
      // getBoundingClientRect is axis-aligned, so a wide slab rotated three degrees
      // reports a rect several units taller than the slab — entirely in the corners,
      // where there is nothing. ethics24 settles a 280-wide lintel by 3 degrees and
      // its rect reached up into the caption above it while no part of the slab did.
      //
      // Recoverable exactly: for an unrotated W x H at angle t the rect measures
      //   Aw = W|cos t| + H|sin t|,  Ah = W|sin t| + H|cos t|
      // so W and H come back by solving the pair, and half the difference is the
      // corner overhang to deflate on each side. The angle is accumulated up to the
      // crop because the transform is usually on a parent, not on the fill itself.
      let rot = 0;
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const t = getComputedStyle(a).transform;
        if (t && t !== 'none') {
          const m = t.match(/matrix\(([^)]+)\)/);
          if (m) {
            const v = m[1].split(',').map(Number);
            if (v.length >= 4) rot += Math.atan2(v[1], v[0]);
          }
        }
        if (a === clipEl) break;
      }
      let dx = 0, dy = 0;
      const cA = Math.abs(Math.cos(rot)), sA = Math.abs(Math.sin(rot));
      if (sA > 0.004 && Math.abs(cA * cA - sA * sA) > 1e-6) {
        const den = cA * cA - sA * sA;
        const W = (rr.width * cA - rr.height * sA) / den;
        const H = (rr.height * cA - rr.width * sA) / den;
        if (W > 0 && H > 0 && W <= rr.width + 0.5 && H <= rr.height + 0.5) {
          dx = (rr.width - W) / 2; dy = (rr.height - H) / 2;
        }
      }
      let cx0 = rr.left + dx, cy0 = rr.top + dy, cx1 = rr.right - dx, cy1 = rr.bottom - dy;
      for (let a = el.parentElement; a; a = a.parentElement) {
        const acs = getComputedStyle(a);
        if (acs.overflowX !== 'visible' || acs.overflowY !== 'visible') {
          const ar = a.getBoundingClientRect();
          cx0 = Math.max(cx0, ar.left); cy0 = Math.max(cy0, ar.top);
          cx1 = Math.min(cx1, ar.right); cy1 = Math.min(cy1, ar.bottom);
        }
        if (a === clipEl) break;
      }
      cx0 = Math.max(cx0, CR.left); cy0 = Math.max(cy0, CR.top);
      cx1 = Math.min(cx1, CR.right); cy1 = Math.min(cy1, CR.bottom);
      if (cx1 - cx0 < 1 || cy1 - cy0 < 1) continue;
      painted.push({ el, order, x: cx0, y: cy0, w: cx1 - cx0, h: cy1 - cy0, frame });
    }
  }
  const orderOf = (el) => { let i = 0; for (const p of painted) { if (p.el === el) return p.order; i += 1; } return -1; };

  for (const d of nodes) {
    if (d.children.length !== 0) continue;
    const txt = (d.tagName === 'INPUT' ? (d.value || '') : (d.textContent || '')).trim();
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
    let tight = null;
    for (const c of clips) {
      const w = Math.min(r.right, c.right) - Math.max(r.left, c.left);
      const h = Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top);
      const f = w > 0 && h > 0 ? (w * h) / (r.width * r.height) : 0;
      if (f < keep) {
        keep = f;
        tight = c;
        overhang = [
          Math.max(0, c.top - r.top), Math.max(0, r.right - c.right),
          Math.max(0, r.bottom - c.bottom), Math.max(0, c.left - r.left),
        ];
      }
    }
    // A BOX THAT ATE ITS OWN WORD, which the bail below would otherwise excuse.
    //
    // logic8 is the case. Its tempting-move card is 64 tall; the heading inside it
    // needed three lines instead of one, so the trap sentence under the heading
    // started at y 64 and was clipped away ENTIRELY — a lesson called Two Tempting
    // Traps whose second trap did not appear on screen at all. Neither existing
    // rule saw it. CUT wants a word to be PARTLY clipped, and this one is wholly
    // gone; SPILL asks the word about its own scroll box, and the word is fine —
    // it is its PARENT that is too small.
    //
    // The bail on the next line is what excused it: a word its clip has removed
    // entirely is normally a prop waiting in the wings. Two conditions separate
    // the two cases and both are necessary. The word is at FULL OPACITY, so it is
    // not parked and fading; and the thing clipping it is SMALL — a plate, a card,
    // a caption box — rather than the stage crop, because a word outside the stage
    // is check-frame and check-space's business and they say so in scene units.
    const stageBox = clipEl.getBoundingClientRect();
    const eaten = keep < 0.02 && alpha > 0.9 && tight
      && (tight.width * tight.height) < 0.5 * (stageBox.width * stageBox.height);

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
    if (!eaten && (alpha <= 0.2 || keep <= 0.02)) continue;

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

    // ── DOES IT FIT ITS OWN BOX ────────────────────────────────────────────
    //
    //   "there are plenty of words that arent correctly in their boxes"
    //
    // KEEP measures a word against whatever is CLIPPING it, which is usually the
    // stage crop — so a label that overruns its own little plate, or a caption
    // capped at two lines that needs three, is invisible to it. The element's own
    // scroll box answers directly: content wider or taller than the box is content
    // the box is not showing. A React Native numberOfLines is a line-clamp with
    // overflow hidden, so a truncated label lands here as extra scrollHeight, which
    // is the general form of every "cut off" the reader has reported.
    const cw = d.clientWidth, ch = d.clientHeight;
    const spillX = cw > 2 ? d.scrollWidth - cw : 0;
    const spillY = ch > 2 ? d.scrollHeight - ch : 0;
    // 2px of slack: sub-pixel line boxes and a scaled stage both round against us,
    // and a word half a pixel over its plate is not what anybody is reporting.
    // TWO AXES, TWO THRESHOLDS, and the vertical one has to be loose.
    //
    // Content WIDER than its box is always a cut letter: 2px of slack for
    // sub-pixel rounding and no more. Content TALLER is not, because a line box
    // shorter than the face's own ascent-plus-descent overflows by a pixel or
    // three on perfectly ordinary type — every one of these scenes sets an
    // explicit lineHeight tighter than the font's natural one. Half a line is the
    // smallest overflow that can actually be a lost line of text, so 6.
    const spill = eaten ? 999 : (spillX > 2 ? spillX : (spillY > 6 ? spillY : 0));

    // ── IS SOMETHING PAINTED ON TOP OF IT ──────────────────────────────────
    //
    //   "words get covered by other things"
    //
    // groundAt above scans DOWNWARD from the word for what is behind it, which
    // is the right question for contrast and the wrong one for this. Anything
    // painted OVER the word sits ABOVE it in the same stack and was skipped
    // entirely, so a caption with an opaque panel laid across it measured a
    // perfect contrast against the ground it no longer reaches.
    //
    // Ancestors are excluded, and they are most of the stack: an ancestor with a
    // background paints BEHIND its own text, never over it. What is left is a
    // sibling or a cousin drawn later, which is exactly the defect.
    // A GRID, NOT THE CENTRE POINT.
    //
    // This sampled one point — the word's exact middle — and so could only ever
    // see something that buried the word. The reader walked "Do We Owe Strangers
    // Anything?" and found three things crossing words on one beat, and this rule
    // reported the lesson clean, because none of the three happened to pass
    // through the centre: a 2px marker line struck WHAT YOU|FEEL a third of the
    // way along, and a panel's bottom EDGE sliced the caption below it in half.
    //
    // Fifteen points across the word's own box catch both, and they also tell the
    // two apart: covered at the centre is a word BURIED (UNDER), covered only at
    // the edges is a word STRUCK THROUGH (STRIKE). They want different fixes —
    // one moves the word, the other breaks the line around it.
    // WHAT IS DRAWN OVER THIS WORD, BY GEOMETRY.
    //
    //   covered at its CENTRE  -> UNDER, the word is buried
    //   covered only at an EDGE -> STRIKE, the word is sliced or ruled through
    //
    // They want different fixes: one moves the word off the thing, the other
    // breaks the thing around the word. political19 had both on one beat.
    let coveredBy = '';
    let struckBy = '';
    try {
      // NOTHING INSIDE THE STAGE CROP CAN BE OVER A WORD OUTSIDE IT. orderOf
      // returns -1 for a deck word, and the paint-order filter below is written
      // 'mine >= 0 &&' — so a deck word skipped the filter and every stage box
      // counted as drawn after it.
      const mine = orderOf(d);
      if (mine < 0) throw new Error('outside the crop');
      const hits = painted.filter((p) => {
        if (p.el === d || p.el.contains(d) || d.contains(p.el)) return false;
        // only things drawn AFTER this word can be over it
        if (mine >= 0 && p.order < mine) return false;
        const ox = Math.min(r.left + r.width, p.x + p.w) - Math.max(r.left, p.x);
        const oy = Math.min(r.top + r.height, p.y + p.h) - Math.max(r.top, p.y);
        // TWO LINES OF ONE PARAGRAPH ARE NOT A COLLISION. Wrapped narration lines
        // are siblings whose boxes graze by a pixel or two because every face sets
        // a lineHeight tighter than its natural one — the same slack D-group notes
        // for vertical overflow. Require a real overlap, and for word-on-word
        // require they are not lines of the same block.
        const bothWords = (p.el.textContent || '').trim().length >= 2 && p.el.children.length === 0;
        if (bothWords && p.el.parentElement === d.parentElement) return false;
        // A TWO-STATE LABEL IS ONE LABEL. react-native-web renders the dim copy
        // and the lit copy of the same caption at the same box with the same
        // text; whichever is on top is not covering anything the reader wanted.
        if (bothWords && (p.el.textContent || '').trim() === txt
            && Math.abs(p.x - r.left) < 2 && Math.abs(p.y - r.top) < 2) return false;
        if (ox <= 1 || oy <= (bothWords ? 4 : 1)) return false;
        // A GRAZE ALONG A BOX EDGE IS NOT A STRIKE, BECAUSE A TEXT BOX IS NOT ITS
        // INK. Every label here carries leading above and below the glyphs, so a
        // marker resting on a caption's box overlaps it by a unit or two and
        // touches no letter. Measured across the corpus that was most of the list:
        // political36's flag grazed its title by 1 unit of 8, metaphysics37's rule
        // by 1 of 8, aesthetics4's hanging ring by 1 of 10 — none of them visible
        // in a screenshot, all of them findings.
        //
        // What separates those from the real ones is not a fixed number of pixels
        // but how much of the WORD is crossed. A thin vertical rule through a
        // caption covers little width and its whole height; a panel edge slicing a
        // label covers its whole width and a third of its height. Either counts;
        // clipping a corner does not.
        const frac = Math.max(ox / Math.max(1, r.width), oy / Math.max(1, r.height));
        if (frac < 0.35) return false;
        // A frame paints its bands. The interior is open paper.
        if (p.frame) {
          const band = p.frame + 1;
          const insideX = r.left >= p.x + band && r.left + r.width <= p.x + p.w - band;
          const insideY = r.top >= p.y + band && r.top + r.height <= p.y + p.h - band;
          if (insideX && insideY) return false;
          // A RING ROUND ONE WORD OF A LINE IS AN ANNOTATION, NOT A SLICE.
          // Boxes here are per ELEMENT, and a <Text> holding a whole premise is
          // one element — so logic14's ring, which circles the word NOTHING at
          // the end of the first row exactly as its header says, has its left
          // border falling in the middle of that element's box and looked like
          // ten struck words. Its border lands in the SPACE before the word;
          // there is no way to see that from element geometry.
          //
          // The tell is size. An annotation is smaller than the thing it marks;
          // a panel edge that really does slice a caption is larger. Note this
          // needs the frame test too — political19's 2px marker line is also
          // narrower than the caption it ruled through, and it is a filled View,
          // so it still fails as it should.
          if (p.w < r.width || p.h < r.height) return false;
        }
        return true;
      });
      const name = (p) => {
        const t = (p.el.textContent || '').trim();
        if (t) return 'the words ' + JSON.stringify(t.slice(0, 24));
        // WHERE, not just how big. A dimension alone cannot be matched back to a
        // style, so every remaining finding needed its own browser run to place.
        return Math.round(p.w) + 'x' + Math.round(p.h) + ' ' + (p.el.tagName || 'box').toLowerCase()
          + toScene(p.x, p.y, p.w, p.h);
      };
      const atCentre = hits.find((p) => cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h);
      if (atCentre) coveredBy = name(atCentre);
      else if (hits.length) struckBy = name(hits[0]);
    } catch (e) { coveredBy = ''; struckBy = ''; }

    const why = [];
    if (size < FLOOR) why.push('TINY');
    if (spill) why.push('SPILL');
    if (coveredBy) why.push('UNDER');
    if (struckBy) why.push('STRIKE');
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
      spill: Math.round(spill), sx: Math.round(spillX), sy: Math.round(spillY), coveredBy, struckBy,
      r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      // The same rect in SCENE units, so a finding names a place in the source.
      rs: K ? [Math.round((r.left - CAMR.x) / K), Math.round((r.top - CAMR.y) / K),
               Math.round(r.width / K), Math.round(r.height / K)] : null,
      over: overhang.map((v) => Math.round(v * 10) / 10) });
  }

  // ── A THING YOU ARE ASKED TO TAP MUST SAY WHAT IT IS ──────────────────────
  //
  // REPORTED, NOT GATED, and the distinction is the honest part. This found two
  // real defects — metaphysics-19 drew three unnamed rectangles for "tap one of the
  // 3 outlined parts above", and metaphysics-21 labelled its timeline's two ends and
  // left NOW, which was the answer, blank. It also flags logic-19, whose four cards
  // are plainly lettered E · K · 4 · 7 and which a screenshot shows is fine. Until
  // the disagreement is understood, a BLANK is a place to LOOK rather than a fact.
  //
  // Everything above measures words. It is blind, by construction, to the defect a
  // reader kept reporting:
  //
  //   "there are still lessons that have blank boxes that you cannot read so it is
  //    a guess for which one to press to answer"
  //
  // A box with no words in it has nothing to measure. metaphysics-19 asks the reader
  // to "tap one of the 3 outlined parts above" and draws all three as bare
  // rectangles; every word on the page was legible and the sweep said so.
  //
  // Asked here rather than in the source because the label is very often a SIBLING
  // of the tap target rather than a child — the scene draws a caption under a panel
  // and lays a hit box over it. Only the rendered page knows which words land inside
  // which box. The legible-word list above already holds every word and its rect.
  const blanks = [];
  try {
    for (const el of clipEl.querySelectorAll('[role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.2) continue;
      // ONLY WHAT THE READER IS ACTUALLY ASKED TO PRESS. A scene draws its answer
      // targets from the first beat and disables them until the question is live —
      // React Native Web writes that as aria-disabled — so counting those reports
      // every lesson as full of blank boxes on beats that ask nothing.
      if (el.getAttribute('aria-disabled') === 'true' || cs.pointerEvents === 'none') continue;
      // A CAPTION DIRECTLY ABOVE ITS STRIP IS ITS NAME. metaphysics-21 writes THE
      // PAST and THE FUTURE just over the two halves of its timeline and lays the
      // hit boxes on the strip itself; the words are outside the box by a few
      // pixels and name it perfectly well. So the test allows a caption's height
      // either side, and nothing further — a word across the stage is not a label.
      // 34, measured rather than guessed: metaphysics-21 sets its timeline captions
      // a line-gap above the strips they name — 28px on a 390-wide phone — and they
      // plainly name them. Wider than this and a caption from the other half of the
      // stage would start counting, which is the direction that hides the defect.
      const NEAR = 34;
      const named = seenWords.some((w) => {
        const cx = (w.r[0] + w.r[2]) / 2, cy = (w.r[1] + w.r[3]) / 2;
        return cx >= r.left - 4 && cx <= r.right + 4
          && cy >= r.top - NEAR && cy <= r.bottom + NEAR;
      });
      if (!named) blanks.push([Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]);
    }
  } catch (e) {}

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
  return JSON.stringify({ out: kept, blanks, done: prog >= 0.999 });
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

  // WHAT EARLIER RUNS LEFT BEHIND, BEFORE OPENING ANYTHING NEW. Closing at the
  // end is not enough on its own: a sweep of 186 lessons is long enough to get
  // interrupted, and a killed run never reaches its teardown. See cdptab.mjs —
  // sixty-four leaked pages is the difference between 1613 beats audited and
  // 1386 with 29 lessons NOT AUDITED, on identical source.
  const swept = await sweepStaleTabs(PORT, `http://localhost:${WEB}`);
  if (swept) console.log(`check-readable: closed ${swept} page(s) left by earlier runs`);

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
    // CLOSE THE TAB, NOT JUST THE SOCKET.
    //
    // This used to close only the WebSocket, so every run left LANES tabs alive in
    // the headless Chrome. After ten runs there were SIXTY-FOUR, and a browser
    // carrying sixty-four live React trees is slow enough that lessons stop
    // reaching their second beat: the same sweep went from 1613 beats audited to
    // 1386 with 29 lessons reported NOT AUDITED, on identical source. It reads as
    // the app getting worse. It is the instrument leaking.
    // NOT through `put`, which JSON.parses every reply: /json/close answers with
    // the bare string "Target is closing", so parsing it throws — and it threw
    // AFTER all 186 lessons had been measured, killing the process before it
    // printed a single finding. closeTab in cdptab.mjs reads the reply raw.
    const close = async () => {
      try { ws.close(); } catch { /* already gone */ }
      await closeTab(PORT, tab.id);
    };
    return { evaluate, send, tap, answerScene, answerDeck, answerControl, stamp, settle, shoot, close };
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

  // AND TWO SCENES CROSS A WORD ON PURPOSE.
  //
  // STRIKE cannot be settled by pixels the way FAINT and UNDER can. FAINT asks
  // "can this be read", which is a number. STRIKE asks "was this meant", and no
  // measurement answers that: aesthetics20 draws a 320x2 bar through IT TEACHES
  // YOU THINGS and its style is called `strike`, because the whole lesson is each
  // claim about art being struck out by something that does it better. Two hundred
  // units away, political19 drew a 2px marker line through WHAT YOU|FEEL and that
  // is the defect the reader reported. Identical geometry, opposite meanings.
  //
  // Named rather than budgeted, for the reason the fades above are: a NEW word
  // crossed in the same lesson still shows.
  const STRUCK_ON_PURPOSE = {
    // Each claim is struck out as the thing that does it better arrives.
    'aesthetics-aesthetics-20': ['*'],
    // The charter TEARS: one sheet drawn in two clipped windows, so every word
    // across the seam sits under its own twin. §21 records this as the shape that
    // made the pixel confirmation necessary in the first place.
    'political-political-7': ['*'],
    // The scene's own header: "the headline WAR OF ALL AGAINST ALL, struck through
    // as authority arrives". The war ENDING is the lesson.
    'political-political-1': ['WAR OF ALL AGAINST ALL'],
    // Its own header: "the boast NOTHING IS KNOWN cracks, and the question that
    // breaks it is printed inside the same box". The three crackA/B/C rules are
    // drawn ACROSS the boast on purpose — a claim that refutes itself, breaking.
    'epistemology-knowledge-6': ['NOTHING IS KNOWN', '…INCLUDING THAT?'],
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
    // THE BOUND IS A SAFETY STOP, NOT A SCHEDULE — and it used to be 14.
    //
    // Every loop here exits the moment the lesson says it is done, so a high bound
    // costs nothing; a low one silently truncates. J12's segmenting split took the
    // longest lessons from 11 beats to 19, and this fixed 14 promptly reported
    // THIRTEEN lessons as "measured fewer beats than they have" — all of them at
    // exactly 14, which is the tell. The content was fine; the instrument had a
    // ceiling the content had outgrown.
    //
    // 28 clears the longest lesson in the repo (argument, 26) with room to spare.
    for (let b = 0; b < 28; b += 1) {
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
      // A TAP TARGET WITH NOTHING IN IT, on both reads — the reader's "blank boxes
      // that you cannot read so it is a guess for which one to press".
      if ((a.blanks ?? []).length && (c.blanks ?? []).length) {
        const n = Math.min(a.blanks.length, c.blanks.length);
        hits.push({ why: 'BLANK', t: `${n} unnamed tap target${n > 1 ? 's' : ''}`,
          size: 99, keep: 1, con: 99, a: 1, r: a.blanks[0], over: [0, 0, 0, 0] });
      }

      // CONFIRM EVERY FAINT AGAINST THE PIXELS, and drop the ones the screen
      // disagrees with. One screenshot per beat that has a suspect — a cheap
      // filter in front of an expensive check, rather than 1591 screenshots.
      // UNDER JOINS FAINT AT THE PIXELS, and for a stronger reason than FAINT has.
      //
      // The paint stack says a word has something opaque above it. It cannot say
      // whether that something is actually hiding it — and this codebase has at
      // least two shapes where it is not. political-7 hangs a charter that TEARS
      // by drawing the SAME SHEET in two clipped windows, so every word across the
      // seam is half in each and each half sits under the other's container. A
      // two-state label is built the same way on purpose.
      //
      // A word genuinely under an opaque panel has no contrast in its own
      // rectangle, and that is a fact about the screen rather than a theory about
      // z-order. So the suspects are shot with the FAINT ones and cleared when the
      // pixels disagree — the same instrument, the same argument, one more class.
      if (hits.some((h) => h.why.includes('FAINT') || h.why.includes('UNDER'))) {
        // CLIP THE CAPTURE TO THE SUSPECTS. A full 780x1688 frame has to be
        // PNG-decoded on the one Node thread, which serialises every lane and
        // made the sweep three times slower. The union of the suspect words is
        // usually a few thousand pixels. (`clip` alone is fine; it is `clip`
        // PLUS captureBeyondViewport that hangs in --headless=new, §19.)
        const sus = hits.filter((h) => h.why.includes('FAINT') || h.why.includes('UNDER'));
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
            const suspect = h.why.includes('FAINT') || h.why.includes('UNDER');
            if (!suspect) return h;
            const real = inkRange(shot, (h.r[0] - bx) * px, (h.r[1] - byy) * px, h.r[2] * px, h.r[3] * px);
            if (real === null) return h;
            h.px = +real.toFixed(1);
            // The screen wins. Ancestor colours and paint order are both guesses;
            // this is the page.
            if (real >= CONTRAST) {
              const rest = h.why.split('+').filter((w) => w !== 'FAINT' && w !== 'UNDER');
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
      const crossed = STRUCK_ON_PURPOSE[id];
      if (crossed) {
        hits = hits.map((h) => {
          if (!h.why.includes('STRIKE')) return h;
          if (!crossed.includes('*') && !crossed.includes(h.t)) return h;
          const rest = h.why.split('+').filter((w) => w !== 'STRIKE').join('+');
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
            // SPILL joins CUT here for the same reason: a box too small for its
            // own words is a defect whenever it appears, and the explanation only
            // appears after the pick. UNDER does not — the reveal deliberately
            // lays the verdict over the option it is rejecting.
            const extra = post.out
              .filter((h) => h.why.indexOf('CUT') >= 0 || h.why.indexOf('SPILL') >= 0)
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
    // WRITTEN AS IT GOES, because a sweep of 186 lessons takes long enough to be
    // interrupted and one that died at 170 lost every measurement it had made.
    if (outPath) { try { fs.writeFileSync(outPath, JSON.stringify(report, null, 1)); } catch { /* a partial sheet is still worth having */ } }
    done += 1;
    const n = (k) => beats.reduce((a, x) => a + x.hits.filter((h) => h.why.includes(k)).length, 0);
    // EVERY CLASS GOES IN THE LINE, NOT JUST THE THREE IT WAS BORN WITH.
    // SPILL, UNDER and STRIKE were added later and never added here, so a lesson
    // with eleven words struck through printed "readable" — and when a run died
    // at 170 of 186 the progress log, the only surviving record, said the corpus
    // was clean. A per-item line that omits a class is worse than no line.
    const parts = [];
    for (const k of ['TINY', 'CUT', 'FAINT', 'SPILL', 'UNDER', 'STRIKE', 'BLANK']) {
      if (n(k)) parts.push(`${n(k)} ${k.toLowerCase()}`);
    }
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : parts.length ? parts.join(' · ')
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
  await Promise.all(lanes.map((T) => T.close()));

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
  for (const k of ['TINY', 'CUT', 'FAINT', 'SPILL', 'UNDER', 'STRIKE', 'BLANK']) {
    console.log(`    ${k.padEnd(6)} ${String(count(k)).padStart(4)} words  (${lessons(k)} lessons)`);
  }
  const worst = [];
  for (const r of report) for (const b of r.beats) for (const h of b.hits) worst.push({ id: r.id, beat: b.beat, ...h });
  worst.sort((a, b) => (a.size - b.size) || (a.keep - b.keep));
  console.log('\n  the twenty least readable:');
  for (const w of worst.slice(0, 20)) {
    console.log(`    ${w.why.padEnd(17)} ${w.size.toFixed(1).padStart(5)}px keep ${w.keep.toFixed(2)} con ${String(w.con).padStart(4)} a ${w.a}  ${w.id} b${w.beat}  "${w.t}"`);
  }

  // THE TWO THE READER NAMED, LISTED BY LESSON RATHER THAN BY SEVERITY.
  //
  // "plenty of words that arent correctly in their boxes, and words get covered by
  // other things … look at all other cinematic lessons for this too". A ranking by
  // size answers "which is worst"; this answers "which lesson do I open", which is
  // the question an author actually has.
  for (const k of ['SPILL', 'UNDER', 'STRIKE']) {
    const rows = worst.filter((w) => w.why.includes(k));
    if (!rows.length) continue;
    const by = new Map();
    for (const w of rows) { if (!by.has(w.id)) by.set(w.id, []); by.get(w.id).push(w); }
    console.log(`\n  ${k} — ${rows.length} words across ${by.size} lessons:`);
    for (const [id, list] of [...by.entries()].sort((x, y) => y[1].length - x[1].length).slice(0, +(process.env.READ_LIST || 14))) {
      const ex = list[0];
      const how = k === 'SPILL' ? `${ex.spill}px past its box`
        : k === 'STRIKE' ? `struck by ${ex.struckBy}`
        : `under ${ex.coveredBy}`;
      console.log(`      ${id.padEnd(30)} ${String(list.length).padStart(3)}  b${ex.beat} ${how}  "${ex.t}"`);
    }
    if (by.size > +(process.env.READ_LIST || 14)) console.log(`      … and ${by.size - +(process.env.READ_LIST || 14)} more lessons`);
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
