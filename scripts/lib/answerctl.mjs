// ONE SNIPPET FOR EVERY ANALOGUE ANSWER, SHARED BY EVERY HARNESS THAT DRIVES ONE.
//
// §21's rule, stated there twice already: **when a lesson gains a new way to be
// answered, the harness gains one too, in the same commit** — otherwise the next
// sweep quietly measures less and says nothing, because a beat it cannot answer
// ends the run and the beats it never reached are counted as clean.
//
// Four harnesses drive these controls — measure-must, check-spoiler, check-cover
// and check-hold — and until now each carried its own copy of the drag sequence.
// Four copies is four places to forget, and the lessons just gained FOUR more
// controls (lever, plot, split, field). So the sequence lives here, once, and the
// harnesses import it. Same argument as scripts/lib/previewroute.mjs holding one
// lock for four scripts.
//
// ── WHY POINTER EVENTS AND WHY MORE THAN ONE MOVE ───────────────────────────
//
// react-native-gesture-handler listens on POINTER events on the web, so a
// MouseEvent does nothing to any of these however carefully it is aimed. And a
// single jump from the press point is indistinguishable from a tap to the pan
// recogniser's activation check — `onUpdate` integrates translationX — so the
// sequence must be down, several moves, up, with a live pointerId throughout.
//
// ── WHERE IT DRAGS TO DOES NOT MATTER ───────────────────────────────────────
//
// These harnesses measure what a beat DRAWS; the beat's own boxes are read before
// the answer is given. The drag only has to get the gate open. So each target
// below aims somewhere unambiguously inside the control and never tries to be
// right — a harness that tried to answer correctly would be a second, unmaintained
// copy of every lesson's key.

/**
 * The ids every analogue control carries, in the order they are tried.
 *
 * ORDER MATTERS, and it is the fix check-spoiler already records: a control beat
 * still has `role=button` elements on it that are not its answer, so a generic
 * button branch firing first clicks something inert, reports success, and leaves
 * the lesson stuck on that beat forever. Analogue first, buttons after.
 */
export const CONTROL_IDS = ['drag-strip', 'lever-arc', 'split-bar', 'shape-plot', 'field-pad'];

/**
 * A JS expression string that answers whichever analogue control is on the beat.
 *
 * Returns the id it drove, or '' when there was none — so a caller can tell
 * "answered a control" from "found nothing" and fall through to its own button
 * branch rather than guessing.
 */
export const ANSWER_CONTROL = `(() => {
  const IDS = ${JSON.stringify(CONTROL_IDS)};
  for (const id of IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (!(r.width > 20 && r.height > 4)) continue;

    // Where to press and where to end up. A field pad is the only two-dimensional
    // one, so it is the only one that moves in y as well.
    const twoD = id === 'field-pad';
    const x0 = r.left + r.width * (twoD ? 0.3 : 0.12);
    const x1 = r.left + r.width * (twoD ? 0.72 : 0.58);
    const y0 = r.top + r.height * (twoD ? 0.7 : 0.5);
    const y1 = r.top + r.height * (twoD ? 0.28 : 0.5);

    const opts = (x, y, down) => ({
      bubbles: true, cancelable: true, composed: true,
      clientX: x, clientY: y,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: down ? 1 : 0,
    });
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', opts(x0, y0, true)));
      for (let k = 1; k <= 8; k++) {
        const t = k / 8;
        el.dispatchEvent(new PointerEvent('pointermove',
          opts(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, true)));
      }
      el.dispatchEvent(new PointerEvent('pointerup', opts(x1, y1, false)));

      // A PLOT DOES NOT COMMIT ON RELEASE, AND NOTHING ELSE HERE IS LIKE THAT.
      //
      // Every other control has one value, so lifting the finger IS the answer.
      // A plot has one per column, and committing on release meant a reader who
      // lifted to reach the second column had already answered — the defect
      // ShapePlot's header sets out. The commit is a button now, so the sequence
      // is drag THEN press, and a harness that stops at the drag leaves the lesson
      // parked on that beat and calls the short run a clean one (§21).
      // AND IT IS PRESSED TWICE, LATE AS WELL AS AT ONCE. The button is disabled
      // until the reader has actually drawn something, and "has drawn something"
      // reaches React through runOnJS — so a click dispatched on the same tick as
      // the pointerup lands on a button that is still inert. One immediate press
      // for the common case, one after the state has settled for the race; the
      // second is a no-op once the beat has moved on.
      if (id === 'shape-plot') {
        const press = () => {
          const set = document.getElementById('plot-set');
          if (set) set.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        };
        press();
        setTimeout(press, 260);
      }
      return id;
    } catch (e) { return ''; }
  }
  return '';
})()`;
