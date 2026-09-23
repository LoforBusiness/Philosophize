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
export const CONTROL_IDS = [
  'order-tiles', 'odd-one-out', 'trend-pick', 'sort-bins', 'poll-ballot',
  // RETIRED, and listed anyway. None of these appears in a lesson any more, but a
  // harness that stops knowing how to drive them cannot audit an older branch or a
  // revert -- and the cost of keeping four ids in a list is nothing against a
  // sweep that silently measures less (21). `drag-strip` and `split-bar` joined
  // them when the owner removed the two sliding controls.
  'lever-arc', 'field-pad', 'drag-strip', 'split-bar',
];

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

    // A POLL IS TAPPED, NOT DRAGGED, and it is the first control here that is.
    // Its rows are real buttons, so the pointer sequence below would press
    // whichever row happens to sit under the drag's start point -- which works by
    // accident and stops working the moment the ballot is laid out differently.
    // Press a row outright instead, and never the first: the ballot opens on a row
    // that is deliberately not the answer, and a harness that always took row 0
    // would answer correctly by luck in exactly the lessons where it opens there.
    // THE TREND PICK IS TAPPED TOO: its tiles are buttons, one per drawn shape.
    if (id === 'poll-ballot' || id === 'trend-pick' || id === 'odd-one-out') {
      try {
        const rows = el.querySelectorAll('[role="button"]');
        if (!rows.length) continue;
        const row = rows[rows.length > 1 ? 1 : 0];
        row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return id;
      } catch (e) { return ''; }
    }

    // AN ORDER IS EVERY TILE, ONCE EACH, AND THE "ONCE" IS LOAD-BEARING.
    //
    // The control commits on the LAST tap, so a harness that presses one tile
    // leaves the lesson parked on that beat and calls the short run clean -- the
    // failure 21 records for the drag rail, one control along. And tapping a tile
    // that already carries a numeral CLEARS the sequence (it is the way back), so
    // pressing the same tile twice would undo the run rather than finish it.
    // Every tile in DOM order is therefore exactly right: distinct, complete, and
    // making no attempt to be correct.
    if (id === 'order-tiles') {
      try {
        const tiles = [...el.querySelectorAll('[role="button"]')];
        if (!tiles.length) continue;
        // TWO ORDERED PASSES, AND THE SECOND ONE IS NOT BELT AND BRACES.
        //
        // The control commits on the LAST tap, and tapping a tile that already
        // carries a numeral CLEARS the run — that is its way back. One pass is
        // therefore correct only from a CLEAN control, and a sweep routinely meets
        // a partly answered one: measure-must tries its generic deck click first,
        // and an order tile is a wide role=button below the stage, so one tile is
        // already placed by the time this runs. The pass then clears at that tile
        // and ends short, the question is never answered, and four lessons stopped
        // one beat later with nothing in the log but a short beat count.
        //
        // Asking which tiles are placed is not available: react-native-web renders
        // no aria-selected on a button, and the DOM does not update between two
        // clicks in one tick anyway (measured — a tile still reads unplaced
        // immediately after its own click, and correct 400ms later). What DOES
        // hold is the arithmetic: a pass that meets a placed tile at index i clears
        // and leaves exactly the tiles after i, so the next pass starts with index
        // 0 free and runs clean to the end. Two passes converge from any state, and
        // once the sequence is complete the control disables itself, so the second
        // pass costs nothing.
        for (let pass = 0; pass < 2; pass++) {
          for (const t of tiles) {
            t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
          }
        }
        return id;
      } catch (e) { return ''; }
    }

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
