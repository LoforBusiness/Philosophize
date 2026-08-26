// THE PROBE — what one beat has on stage, read out of the real page.
//
// It lives here rather than inside measure-must.mjs so that BOTH the harness that
// runs it and the validator that decides whether a stored measurement is still
// good can hash the same text. ./muststamp.mjs says why that matters: a probe
// that quietly starts collecting less than it used to leaves every stamp green
// and every stored list wrong, and that has already shipped once.
import { STAGE_W, STAGE_H } from './mustrule.mjs';

export const MEASURE = `(() => {
  const cam = document.getElementById('stage-cam');
  const clip = document.getElementById('stage-clip');
  if (!cam || !clip) return JSON.stringify({ none: true });
  const cr = cam.getBoundingClientRect();
  const k = cr.width / ${STAGE_W};           // fit x scale, in one number
  if (!(k > 0.01)) return JSON.stringify({ none: true });
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.08) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const inked = (d) => {
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      const r = rg.getBoundingClientRect();
      if (r.width > 0.5 && r.height > 0.5) return r;
    } catch (e) {}
    return d.getBoundingClientRect();
  };
  // EVERY DRAWN THING SEPARATELY, not just their union, and not just the words.
  //
  // The first version of this recorded only text, on the reasoning that scenery
  // being cropped is what a push IS. That was wrong in the way that matters: a
  // reader reported the camera cutting the stickman in half and slicing the
  // illustration above him, and both were true — the frame audit had counted 438
  // clipped art elements and the rule had been written to ignore them.
  //
  // So three kinds are recorded, and the rule (scripts/lib/mustrule.mjs) decides
  // what to do with each:
  //
  //   figure  the union of one <Stickman>'s limb Views. The root is a zero-size
  //           absolute box, so its own rect says nothing; the descendants are the
  //           man. Several may be on stage — data-testid, not id, for that reason.
  //   text    a leaf carrying characters.
  //   art     a leaf with a background or a border: a prop, a plate, a bar, a rule.
  //
  // BLEED is the one distinction worth drawing at measurement time. A ground line
  // runs from x -20 to x 420 because it is MEANT to continue past the frame, and
  // demanding the camera contain it would pin every shot to scale 1 for nothing.
  // Anything that already extends past the stage was drawn to be cut; anything that
  // sits wholly inside it is a thing with edges, and cutting it looks like damage.
  const items = [];
  const push = (kind, bx, by, bw, bh, t) => {
    const cx = bx + bw / 2, cy = by + bh / 2;
    // ON STAGE NOW. Scenes park props off-stage before they enter, and a union that
    // swallowed those would demand the camera show empty paper.
    if (cx < -4 || cx > ${STAGE_W + 4} || cy < -4 || cy > ${STAGE_H + 4}) return;
    const bleed = bx < 2 || by < 2 || bx + bw > ${STAGE_W - 2} || by + bh > ${STAGE_H - 2};
    items.push({ k: kind, b: [+bx.toFixed(1), +by.toFixed(1), +bw.toFixed(1), +bh.toFixed(1)],
      ...(bleed ? { bleed: 1 } : {}), ...(t ? { t: t.slice(0, 40) } : {}) });
  };

  const seen = new Set();
  for (const fig of cam.querySelectorAll('[data-testid="figure"]')) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const part of fig.querySelectorAll('*')) {
      if (!vis(part)) continue;
      seen.add(part);
      const r = part.getBoundingClientRect();
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height);
    }
    if (x0 === Infinity) continue;
    push('fig', (x0 - cr.x) / k, (y0 - cr.y) / k, (x1 - x0) / k, (y1 - y0) / k, '');
  }

  for (const d of cam.querySelectorAll('div,span')) {
    if (seen.has(d) || !vis(d) || d.children.length !== 0) continue;
    const t = (d.textContent || '').trim();
    const st = getComputedStyle(d);
    const inked = t.length > 1 ? 'text'
      : ((st.backgroundColor && st.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
         parseFloat(st.borderTopWidth) > 0 || parseFloat(st.borderLeftWidth) > 0) ? 'art' : null;
    if (!inked) continue;
    let r = d.getBoundingClientRect();
    if (inked === 'text') {
      // The characters, not the layout box: a centred Text in a wide container has a
      // box far wider than its glyphs, and measuring the box would demand the camera
      // hold padding.
      try {
        const rg = document.createRange();
        rg.selectNodeContents(d);
        const q = rg.getBoundingClientRect();
        if (q.width > 0.5 && q.height > 0.5) r = q;
      } catch (e) {}
    }
    if (r.width < 1.5 || r.height < 1.5) continue;
    push(inked, (r.x - cr.x) / k, (r.y - cr.y) / k, r.width / k, r.height / k, inked === 'text' ? t : '');
  }
  // THE BEAT INDEX, not a guess at it. The progress bar's scaleX is (i+1)/beats,
  // so it answers "did the tap advance the lesson" outright — a hash of the page
  // text cannot tell a dead tap from two beats that happen to read the same.
  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    // DOMMatrixReadOnly throws on the literal string "none", which is what an
    // untransformed element reports. -1 means "cannot tell", and the caller treats
    // that as "assume it advanced" rather than stopping the sweep on a formatting
    // detail.
    if (bar) {
      const tf = getComputedStyle(bar).transform;
      if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a;
    }
  } catch (e) { prog = -1; }
  // THE END OF THE LESSON IS prog === 1, not the word "Finish" on the page.
  // aesthetics-aesthetics-16 says "Finished" in its second beat's narration, so a
  // text match called the lesson over at beat 1 and stored boxes for two of its
  // seven beats. The progress bar is (beat + 1) / beats — it cannot be fooled by
  // prose, and it is the same source the stepping already trusts.
  return JSON.stringify({ items, prog, done: prog >= 0.999 });
})()`;
