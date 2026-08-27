import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { PAPER_LIT, MID, METAL } from '@/components/shared/tone';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE LEAGUE PLACE — a numeral in a disc, and how much furniture it has earned.
//
//   "the numbers on the left side, one two three four five, look very boring and
//    not very premium looking … the one two three, they'd have a design. Even
//    four have a very small design, five [none]. But one two three four will have
//    a more and more complex design as the numbers go up … This is all to do with
//    the circle design and a design that can go out of the circle, the more
//    complex it gets."
//
// So: five rungs of a ladder, each adding one thing to the one below, and every
// addition OUTSIDE the disc.
//
//   5th   the disc alone
//   4th   two ticks, one either side, just clear of the rim
//   3rd   the ticks grow into two arcs
//   2nd   the arcs become laurel sprigs, four leaves each
//   1st   the sprigs grow a leaf and reach further, three rays crown the top,
//         and the disc takes a second rim
//
// ── WHY OUTSIDE, AND WHY THAT IS THE WHOLE RULE ─────────────────────────────
//
// §19 records this being got wrong on the badge case and having to be redone: a
// wreath was closed OVER the medal, and eight of its eighteen leaves ended up
// entirely behind it — so the higher tier wore the smaller-looking flourish and
// the fragment that did show read as a fault. The reader said so at the time, in
// almost the same words they have used here. **The part behind the disc is not
// subtle, it is absent.** Every mark below is drawn beyond r = 15 and nothing is
// ever painted under the numeral.
//
// ── AND THE TONE IS THE MATERIAL'S `base`, NOT ITS `rim` OR ITS `on` ────────
//
// The same section records three separate marks vanishing because a tone fitted
// for METAL was used on PAPER: `on` is #FFFFFF for all eight orders by
// construction, and seven of the eight `rim` values fail 3:1 against paper. The
// moment a mark is drawn BEYOND an edge it is on paper. `base` clears 4.5:1 on
// every order, so that is what the furniture is struck in.
//
// ── THE NUMERAL, AND WHY IT WAS STILL LOW ───────────────────────────────────
//
// It already carried `includeFontPadding: false`, which is the Android half, and
// it still sat low. The remaining cause is a fact about the FACE rather than a
// bug in the layout: flexbox centres the LINE BOX, and Playfair Display's line
// box runs from +1082 to −251 while a digit occupies 0 to 708 (cap height), all
// per 1000 em. So the box's middle sits 415.5 above the baseline and the digit's
// sits at 354 — the numeral is low by 61.5/1000 of an em, every time, in every
// container, at every size.
//
// Read straight out of the .ttf's `hhea` and `OS/2` tables rather than nudged by
// eye, and expressed as a fraction of the size so it stays true if the size ever
// moves. At 14pt it is 0.86px, which is exactly the "a little bit lower" that was
// reported.
// ─────────────────────────────────────────────────────────────────────────────

/** Playfair Display 700: (ascent − descent)/2 − capHeight/2, over unitsPerEm. */
const DIGIT_RISE = 0.0615;

const BOX = 46;              // the slot, wide enough for the furniture
const R = 15;                // the disc
const CX = BOX / 2;
const NUM_SIZE = 14;

const METALS = [METAL.GOLD, METAL.SILVER, METAL.BRONZE];

/** Polar → cartesian, 0° at twelve o'clock, clockwise. */
function at(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + Math.cos(a) * r, CX + Math.sin(a) * r] as const;
}

/**
 * A LEAF IS A FILLED SHAPE, NOT A STROKE — and that is the whole of the second
 * attempt at this.
 *
 * The first drew each leaf as a 1.5px line angled off a branch, which is how
 * `badgeShapes.laurelSprig` does it at the 66px a badge is drawn at. Rendered at
 * the 30px a league disc actually is, six hairlines radiating from a small circle
 * do not read as laurel — they read as legs, and first place looked like a
 * spider. §19 records the identical failure with crossed swords: "horns at 168px,
 * mush at the 66px the badge grid actually draws", and the thing that saved the
 * laurel there was that it is "a continuous curved MASS".
 *
 * So the branch stays a stroke and every leaf is a filled teardrop: two quadratic
 * curves out to a point and back. At 4.6 long by 2.4 across it is a shape at this
 * size rather than a hair.
 */
function leaf(deg: number, r: number, side: -1 | 1, len = 4.6, wide = 1.2) {
  const [bx, by] = at(deg, r);
  const [tx, ty] = at(deg - side * 7, r + len);
  // The two flanks bow out either side of the line from base to tip.
  const [c1x, c1y] = at(deg + side * 5, r + len * 0.45 + wide);
  const [c2x, c2y] = at(deg - side * 17, r + len * 0.45);
  return `M ${bx.toFixed(2)} ${by.toFixed(2)}`
    + ` Q ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`
    + ` Q ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)} Z`;
}

/** A tapered spike — the tick at fourth place and the pip at first. */
function spike(deg: number, r: number, len: number, halfW: number) {
  const [ax, ay] = at(deg - halfW, r);
  const [bx, by] = at(deg + halfW, r);
  const [tx, ty] = at(deg, r + len);
  return `M ${ax.toFixed(2)} ${ay.toFixed(2)} L ${tx.toFixed(2)} ${ty.toFixed(2)}`
    + ` L ${bx.toFixed(2)} ${by.toFixed(2)} Z`;
}

/**
 * The furniture for a place, 0-based. Nothing at index 4, most at index 0.
 *
 * Each rung ADDS to the one below and every mark sits beyond r = 15, so no part
 * of it is hidden behind the disc — §19's rule, learned when a wreath was closed
 * over a medal and eight of its eighteen leaves ended up entirely behind it.
 */
function furniture(place: number, ink: string) {
  const marks: React.ReactNode[] = [];
  const fill = (d: string, key: string, o = 1) => (
    <Path key={key} d={d} fill={ink} opacity={o} />
  );

  // 4th and better: one tapered tick either side, clear of the rim.
  if (place <= 3) {
    for (const side of [-1, 1] as const) {
      marks.push(fill(spike(side * 90, R + 2.4, 4.2, 3.4), `t${side}`));
    }
  }

  // 3rd and better: a crescent either side. Stroked, but at 2.2 it is a mass.
  if (place <= 2) {
    for (const side of [-1, 1] as const) {
      // 144° to 36° and 2.6 wide: at 96° and 2.2 it read as a dash rather than a
      // ring, so third place looked barely different from fourth. A crescent has
      // to be long enough to be an ARC.
      const r = R + 3.4;
      const [x0, y0] = at(side * 144, r);
      const [x1, y1] = at(side * 36, r);
      marks.push(
        <Path
          key={`a${side}`}
          d={`M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 ${side > 0 ? 1 : 0} ${x1.toFixed(2)} ${y1.toFixed(2)}`}
          stroke={ink} strokeWidth={2.6} fill="none" strokeLinecap="round"
        />,
      );
    }
  }

  // 2nd and better: laurel on the crescent. 1st grows a fourth leaf and reaches
  // further out, so the step up is OUTWARD — the only direction that shows.
  if (place <= 1) {
    // FIVE AGAINST THREE, and longer, so the step from second to first is a step
    // a reader can see without the two side by side. Every leaf is rooted ON the
    // crescent rather than floating beside it, which is what makes the pair read
    // as one wreath instead of two brackets.
    const n = place === 0 ? 5 : 3;
    const base = R + 4.2;
    const len = place === 0 ? 5.8 : 4.6;
    for (const side of [-1, 1] as const) {
      for (let i = 0; i < n; i += 1) {
        const deg = side * (138 - (i * 96) / (n - 1));
        marks.push(fill(leaf(deg, base, side, len), `l${side}${i}`));
      }
    }
  }

  // 1st only: a pip at the crown and a second rim, so the top of the disc is
  // finished rather than left as the one bare arc.
  if (place === 0) {
    marks.push(fill(spike(0, R + 2.2, 5.4, 4.6), 'pip'));
    marks.push(
      <Circle key="rim2" cx={CX} cy={CX} r={R + 1.5} stroke={ink} strokeWidth={1} fill="none" opacity={0.5} />,
    );
  }

  return marks;
}

export default function PlaceMark({ place }: { place: number }) {
  const metal = METALS[place];
  // Beyond the rim is PAPER, so the furniture takes the material's `base` — see
  // the note above on the three marks that vanished for reaching for `rim`.
  const ink = metal ? metal.base : MID;
  const marks = furniture(place, ink);

  return (
    <View style={st.box}>
      {marks.length ? (
        <Svg width={BOX} height={BOX} style={StyleSheet.absoluteFill} pointerEvents="none">
          <G>{marks}</G>
        </Svg>
      ) : null}

      {metal ? (
        <LinearGradient
          colors={[metal.lit, metal.base, metal.shade]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[st.disc, { borderColor: metal.rim }]}
        >
          <Text style={[st.num, { color: metal.on }]}>{place + 1}</Text>
        </LinearGradient>
      ) : (
        <View style={[st.disc, st.plain]}>
          <Text style={[st.num, { color: MID }]}>{place + 1}</Text>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  box: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: R * 2, height: R * 2, borderRadius: R, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  plain: { backgroundColor: PAPER_LIT, borderColor: C.hairline },
  num: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: NUM_SIZE,
    // Horizontally: a Text is centred as a BOX, so where the glyph lands inside
    // it is the font's business. Full width plus textAlign hands that to the type
    // engine, which is the only thing that knows the digit's side bearings.
    width: '100%', textAlign: 'center',
    includeFontPadding: false, textAlignVertical: 'center',
    // Vertically: the measured lift. See DIGIT_RISE.
    transform: [{ translateY: -NUM_SIZE * DIGIT_RISE }],
  },
});
