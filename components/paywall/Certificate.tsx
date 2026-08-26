import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G } from 'react-native-svg';
import { INK, PAPER, PAPER_LIT, PAPER_SHADE, FAINT, MID, METAL, mix } from '@/components/shared/tone';
import { EMBOSS } from '@/components/profile/Struck';
import { SPACE } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE CERTIFICATE.
//
// A Scholar's PASS is an admission, so the object is an engraved certificate:
// a double-ruled frame with cut corners, a guilloché ground, an inscriptional
// title, the holder's name, a ruled schedule of what it admits you to, and a
// seal. `PassCard` already draws the pocket-sized version of this idea; this is
// the framed one, at full page width, and the two are deliberately the same
// family — a reader who has met the card recognises the certificate.
//
// ── WHY A CERTIFICATE AND NOT A PRICING CARD ────────────────────────────────
//
// The brief was "premium, gamified, with depth, not a bunch of random colours",
// and those pull in opposite directions everywhere except here. A pricing card
// gets its premium feel from colour and its gamification from badges bolted on
// the side. An engraved certificate gets BOTH from the same place: it is the
// object a credential actually comes on, it is already ink on paper, and the
// depth in it is real — a frame, a ground, a raised face, a struck seal, all lit
// from the one light this app has always used.
//
// ── NO COLOUR IS DECLARED IN THIS FILE ──────────────────────────────────────
//
// Same rule as PassParts: every value comes from `tone`, `METAL` or `mix` of the
// two, and check-pass fails the build on a stray hex. The Scholar's certificate
// is struck in GOLD and the free one in PAPER, and that is the entire difference
// in palette — one metal against none. Two objects that differ by material read
// as two grades of the same thing; two objects that differ by hue read as two
// unrelated products.
//
// ── THREE MEASURED RULES ────────────────────────────────────────────────────
//
// · GOLD'S `base` IS 2.51:1 ON PAPER. PassParts records it: fine inside a rim,
//   useless for a hairline standing alone on the page. So every gold rule here
//   runs base → shade → rim as a gradient, or uses `INK_GOLD` — gold mixed a
//   third of the way into ink — for anything that must simply be SEEN.
// · A BIG FACE BARELY SHADES. StruckPanel measured the full PAPER_LIT →
//   PAPER_SHADE run across 350px and got a tan stain in one corner. The face
//   here runs a third of that and takes its depth from its EDGES instead: a lit
//   top rim, the frame, and the shadow it sits on.
// · EMBOSS GOES ON DISPLAY TYPE ONLY. Below about 13px an ink shadow stops
//   reading as depth and starts reading as a rendering fault (Struck.tsx).
// ─────────────────────────────────────────────────────────────────────────────

/** The one light, as LinearGradient endpoints. Matches tone.LIGHT everywhere. */
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

/**
 * Gold, dragged a third of the way toward ink.
 *
 * The one derived tone this file needs and the reason is measured: `METAL.GOLD`
 * is a metal, tuned to be read against its own rim on a medal, and its `base`
 * measures 2.51:1 on paper. A 1px rule painted in it is invisible. This clears
 * the 3:1 a mark needs while still plainly being the gold rather than a grey.
 */
const INK_GOLD = mix(METAL.GOLD.base, INK, 0.34);

export type CertVariant = 'scholar' | 'free';

/** Everything that differs between the two grades, in one place. */
function dressing(variant: CertVariant) {
  const gold = variant === 'scholar';
  return {
    gold,
    /** The frame's two rules. */
    outer: gold ? INK_GOLD : INK,
    inner: gold ? mix(METAL.GOLD.base, INK, 0.18) : FAINT,
    /** The guilloché ground under the head. */
    ground: gold ? mix(METAL.GOLD.base, INK, 0.1) : mix(PAPER_SHADE, INK, 0.06),
    /** Display type. */
    title: gold ? INK : INK,
    /** The hairline under the title. */
    rule: gold ? INK_GOLD : mix(PAPER_SHADE, INK, 0.2),
  };
}

// ── the frame ────────────────────────────────────────────────────────────────

/**
 * A DOUBLE RULE WITH CUT CORNERS, drawn as one path rather than styled.
 *
 * PassCard's note applies unchanged: a nested-border approach is three or four
 * Views and a lot of arithmetic, and it still cannot notch a corner. As a path
 * it is exact, it scales with the card, and the inner rule can be inset by a
 * true offset rather than by a second box.
 *
 * INERT. §17's rule 7 is about an ANIMATED full-screen `<Svg>` costing ~10fps —
 * this one never redraws, which is the whole reason the frame is allowed to be
 * SVG while every moving thing in the app is a View.
 */
function Frame({ w, h, variant }: { w: number; h: number; variant: CertVariant }) {
  const d = dressing(variant);
  // The notch scales, so a wide certificate does not get a token corner cut.
  const notch = Math.max(9, Math.round(w * 0.036));
  const o = 2.5;               // outer rule inset
  const gap = 5.5;             // between the two rules

  const cut = (inset: number, n: number) => {
    const l = inset, t = inset, r = w - inset, b = h - inset;
    return [
      `M ${l + n} ${t}`, `L ${r - n} ${t}`, `L ${r} ${t + n}`,
      `L ${r} ${b - n}`, `L ${r - n} ${b}`, `L ${l + n} ${b}`,
      `L ${l} ${b - n}`, `L ${l} ${t + n}`, 'Z',
    ].join(' ');
  };

  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={cut(o, notch)} fill="none" stroke={d.outer} strokeWidth={1.8} />
      <Path d={cut(o + gap, Math.max(4, notch - gap))} fill="none" stroke={d.inner} strokeWidth={0.9} />
    </Svg>
  );
}

// ── the guilloché ────────────────────────────────────────────────────────────

/**
 * THE ENGINE-TURNED GROUND, and it is what actually makes this read as engraved.
 *
 * Real certificates carry a guilloché — the fine interfering wave pattern struck
 * to make forgery hard. It is the single strongest "this is a document" signal
 * available, it is pure line, and it costs nothing in colour, which is exactly
 * the constraint this app works under.
 *
 * TWO SINE TRAINS AT DIFFERENT FREQUENCIES, sampled as polylines. Not arcs: the
 * repo's offline rasteriser cannot read `A` commands (§21), and while nothing
 * rasterises this today, a shape drawn out of (x, y) pairs stays inspectable in
 * plain Node, which is the rule `sceneArt` and `rig` are both built on.
 *
 * VERY LOW CONTRAST ON PURPOSE. It sits under the title, so anything strong
 * enough to notice is strong enough to fight the words on top of it (D31 — the
 * app's own decoration may not be painted across a word). At 0.5px and this
 * tone it reads as texture and disappears the moment you look at the type.
 *
 * AND IT STOPS ABOVE THE MOTTO. Rendered full-bleed across the head, the lowest
 * of the three wave trains ran straight through the italic line — technically
 * behind it, and behind is not the same as harmless: it is the one line on the
 * certificate set in a light italic, which is the type least able to hold its
 * own against texture. The trains are laid out in the upper `BAND` of the head
 * and fade out below it, so the motto sits on clean paper.
 */
function Guilloche({ w, h, variant }: { w: number; h: number; variant: CertVariant }) {
  const d = dressing(variant);
  const paths = useMemo(() => {
    const out: string[] = [];
    const STEP = 4;
    // Two trains, three lines each. The beat between 1.0 and 1.618 is what makes
    // the interference read as woven rather than as stripes.
    // The title and its rule occupy the top ~68% of the head; the motto has the
    // rest. Everything below BAND is left bare.
    const BAND = h * 0.68;
    for (const [freq, amp, phase] of [[1.0, 0.30, 0], [1.618, 0.22, Math.PI / 3]] as const) {
      for (let k = -1; k <= 1; k++) {
        const mid = BAND / 2 + k * (BAND * 0.26);
        const pts: string[] = [];
        for (let x = 0; x <= w; x += STEP) {
          const u = (x / w) * Math.PI * 2 * 3 * freq + phase;
          const y = mid + Math.sin(u) * (BAND * amp * 0.5);
          pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        out.push(`M ${pts.join(' L ')}`);
      }
    }
    return out;
  }, [w, h]);

  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <G opacity={0.5}>
        {paths.map((p, i) => (
          <Path key={i} d={p} fill="none" stroke={d.ground} strokeWidth={0.5} />
        ))}
      </G>
    </Svg>
  );
}

// ── a rosette, for the corners ───────────────────────────────────────────────

/**
 * A SMALL ENGRAVED ROSETTE in each top corner of the head.
 *
 * Certificates put a mark where the frame turns, and it does something a border
 * cannot: it says the edge is DECORATED rather than merely drawn. Twelve lobes
 * out of one polyline, so it stays a line drawing at any size.
 */
function Rosette({ size, color }: { size: number; color: string }) {
  const d = useMemo(() => {
    const r = size / 2;
    const pts: string[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const rad = r * (0.62 + 0.30 * Math.abs(Math.cos(a * 6)));
      pts.push(`${(r + Math.cos(a) * rad).toFixed(2)} ${(r + Math.sin(a) * rad).toFixed(2)}`);
    }
    return `M ${pts.join(' L ')} Z`;
  }, [size]);
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Path d={d} fill="none" stroke={color} strokeWidth={0.9} />
    </Svg>
  );
}

// ── the certificate ──────────────────────────────────────────────────────────

export interface CertificateProps {
  variant: CertVariant;
  /** Inscriptional title — 'THE SCHOLAR’S PASS'. */
  title: string;
  /** One line under the rule, e.g. 'Admits the bearer to the whole library'. */
  motto: string;
  /** 'ISSUED TO' name, or null on a certificate nobody holds yet. */
  holder?: string | null;
  /** A second line under the holder — their rank, or the terms of the free tier. */
  holderNote?: string | null;
  /** The seal, drawn by the caller so this file need not know about ranks. */
  seal?: React.ReactNode;
  /** A small plate at the top right — 'ACTIVE', 'YOUR TIER'. */
  flag?: React.ReactNode;
  /** The schedule of entitlements. */
  children: React.ReactNode;
  /** Anything below the schedule — a price, a button, the terms. */
  footer?: React.ReactNode;
  width: number;
}

/** The head's resting height. It grows from here; it never shrinks below it. */
const HEAD_MIN = 96;
/** Above this card width the title sets at its full 21px. Measured — see below. */
const TITLE_FULL_W = 300;

export default function Certificate({
  variant, title, motto, holder, holderNote, seal, flag, children, footer, width,
}: CertificateProps) {
  const d = dressing(variant);

  // ── THE FRAME NEEDS THE HEIGHT, AND ONLY LAYOUT KNOWS IT ──────────────────
  //
  // A cut-corner double rule has to be drawn at the card's real pixel size: an
  // SVG stretched with preserveAspectRatio="none" would skew the corner notches
  // into parallelograms and thin the rule on one axis, which is exactly the sort
  // of thing that looks like a rendering fault rather than a design.
  //
  // So it is measured. The state lives HERE rather than on the page, which is
  // §19's rule from the Profile work stated the other way round: a flag that
  // gates a child belongs to the child. The page re-rendering because this card
  // learned its own height would be the same defect that cost Profile 976ms.
  const [h, setH] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.height);
    // Rounded and compared before setting: a fractional height that jitters by a
    // twentieth of a pixel between passes would loop this forever.
    if (next !== h) setH(next);
  };

  // ── AND THE HEAD MEASURES ITSELF TOO, FOR THE SAME REASON ─────────────────
  //
  // It used to be a fixed 96pt with the guilloché drawn to match. On a 320dp
  // phone the title needs three lines and the head needs about 120, so the first
  // line of THE SCHOLAR'S PASS was sliced off along its top edge — on the widest
  // type on the most important object on the screen, and only on the narrow
  // phone, which is §19's own lesson about "PER ACTIVE DAY" arriving again.
  //
  // So the head grows and the ground follows it.
  const [headH, setHeadH] = useState(HEAD_MIN);
  const onHead = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.height);
    if (next !== headH) setHeadH(next);
  };

  // ── THE TITLE SCALES WITH THE CARD ────────────────────────────────────────
  //
  // Measured rather than guessed (scripts/lib/ttfwidth.mjs, against Cinzel's own
  // .ttf): "THE SCHOLAR’S" sets 210pt wide at 21px with its tracking, and a
  // 320dp phone leaves 224pt inside the head. That is a 14pt margin — enough,
  // but not enough to be sure of across two text engines, and the failure it
  // produces is an ellipsis in the middle of the certificate's own name.
  //
  // Below about 300pt of card the type steps down. `check:pass` re-derives the
  // fit at every width from the same font file.
  const titleSize = width >= TITLE_FULL_W ? 21 : Math.max(16, Math.round(width * 0.062));

  return (
    <View style={[s.shadow, { width }]} onLayout={onLayout}>
      <LinearGradient
        // A THIRD OF A TILE'S FALL-OFF — see the header. The rest of the depth is
        // in the frame, the lit rim and the shadow.
        colors={[PAPER_LIT, PAPER, mix(PAPER, PAPER_SHADE, 0.34)]}
        locations={[0, 0.5, 1]}
        start={LIGHT_START}
        end={LIGHT_END}
        style={s.card}
      >
        {/* The lit rim along the top edge. One pixel, and it is what stops a big
            pale face reading as a flat rectangle. */}
        <View pointerEvents="none" style={[s.rim, { backgroundColor: PAPER_LIT }]} />

        {/* ── the head ─────────────────────────────────────────────────────── */}
        <View style={[s.head, { minHeight: HEAD_MIN }]} onLayout={onHead}>
          <Guilloche w={width - 2} h={headH} variant={variant} />
          <View style={s.corners} pointerEvents="none">
            <Rosette size={16} color={d.inner} />
            <Rosette size={16} color={d.inner} />
          </View>
          <Text
            style={[
              s.title,
              { color: d.title, fontSize: titleSize, lineHeight: Math.round(titleSize * 1.28), letterSpacing: titleSize * 0.124 },
              EMBOSS,
            ]}
            // THREE, NOT TWO. Two lines truncated "THE SCHOLAR’S PASS" to
            // "THE SCHOLAR’S …" on a narrow phone — an ellipsis where the name
            // of the thing should be. The head grows, so a third line costs
            // nothing but the room it takes.
            numberOfLines={3}
          >
            {title}
          </Text>
          <View style={s.ruleRow}>
            <View style={[s.ruleLine, { backgroundColor: d.rule }]} />
            <View style={[s.ruleDot, { backgroundColor: d.rule }]} />
            <View style={[s.ruleLine, { backgroundColor: d.rule }]} />
          </View>
          <Text style={s.motto} numberOfLines={2}>{motto}</Text>
          {flag ? <View style={s.flag}>{flag}</View> : null}
        </View>

        {/* ── the holder ───────────────────────────────────────────────────── */}
        {holder ? (
          <View style={s.holderRow}>
            {seal ? <View style={s.sealBox}>{seal}</View> : null}
            <View style={s.holderBody}>
              <Text style={s.issued}>ISSUED TO</Text>
              <Text style={s.holderName} numberOfLines={1}>{holder}</Text>
              {holderNote ? (
                <Text style={s.holderNote} numberOfLines={2}>{holderNote}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ── the schedule ─────────────────────────────────────────────────── */}
        <View style={s.body}>{children}</View>

        {footer ? <View style={s.footer}>{footer}</View> : null}
      </LinearGradient>
      {/* OVER the face, not under it — the frame is printed on the card. Drawn
          only once the height is known, so it never appears at the wrong size. */}
      {h > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Frame w={width} h={h} variant={variant} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  // The shadow is on a plain wrapper because a LinearGradient with a shadow and a
  // borderRadius renders the shadow through the corners on Android.
  shadow: {
    shadowColor: INK,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 1.2, height: 3 },
    elevation: 4,
  },
  card: { borderRadius: 3, overflow: 'hidden', paddingBottom: SPACE[3] },
  rim: { position: 'absolute', left: 0, right: 0, top: 0, height: 1 },

  head: {
    alignItems: 'center', justifyContent: 'center',
    // SPACE[4], not SPACE[5]. At 32pt a side the title had 208pt to set in on a
    // 320dp phone and needs 210; at 24 it has 224. The eight points either side
    // are the difference between a two-line title and a truncated one.
    paddingHorizontal: SPACE[4],
    paddingTop: SPACE[3], paddingBottom: SPACE[2],
  },
  corners: {
    position: 'absolute', left: SPACE[3], right: SPACE[3], top: SPACE[2],
    flexDirection: 'row', justifyContent: 'space-between',
  },
  title: {
    // Cinzel — Roman inscriptional capitals, which is what a certificate's name
    // is actually cut in. Size, tracking and leading are all set per card at the
    // call site above; only the face and the alignment belong here.
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 6 },
  ruleLine: { width: 34, height: 1 },
  ruleDot: { width: 4, height: 4, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  motto: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 13.5,
    lineHeight: 18,
    color: MID,
    textAlign: 'center',
    marginTop: 6,
  },
  flag: { position: 'absolute', right: SPACE[3], bottom: -11 },

  holderRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE[3],
    paddingHorizontal: SPACE[4], paddingTop: SPACE[3], paddingBottom: SPACE[2],
  },
  sealBox: { width: 54, alignItems: 'center' },
  holderBody: { flex: 1, minWidth: 0 },
  issued: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.6, color: MID,
  },
  holderName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: INK, marginTop: 1,
    includeFontPadding: false,
  },
  holderNote: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 15, color: MID, marginTop: 2,
  },

  body: { paddingHorizontal: SPACE[4], paddingTop: SPACE[2] },
  footer: { paddingHorizontal: SPACE[4], paddingTop: SPACE[3] },
});

// ── the schedule ─────────────────────────────────────────────────────────────

/**
 * A HEADING INSIDE THE CERTIFICATE — 'WHAT THIS ADMITS YOU TO'.
 *
 * A ruled caption rather than a bold line, because a certificate's internal
 * headings are engraved rules with a word sitting in them, and because the
 * schedule below has two kinds of row that must stay clearly separated.
 */
export function ScheduleHead({ label, tint }: { label: string; tint?: string }) {
  const color = tint ?? mix(PAPER_SHADE, INK, 0.5);
  return (
    <View style={r.headRow}>
      <Text style={[r.headLabel, { color }]}>{label}</Text>
      <View style={[r.headRule, { backgroundColor: mix(color, PAPER, 0.55) }]} />
    </View>
  );
}

/**
 * ONE LINE OF THE SCHEDULE, in one of three grades.
 *
 * ── WHY THE GRADES ARE MATERIALS AND NOT COLOURS ────────────────────────────
 *
 * The brief asked for the Pass rows to be HIGHLIGHTED, and the obvious way to do
 * that — a tint behind them — is the thing §19 records as making the whole
 * Insights tab read cheap: large saturated fills on paper. So a `granted` row is
 * not a coloured row. It is a row that has been STRUCK: cut into the page as a
 * recess, with a gold rail down its edge and a gold-rimmed tick. It differs from
 * its neighbours by depth and by material, which is how every other reward in
 * this app already differs from the thing below it.
 *
 * · `granted` — the Pass gives you this and the free tier does not. Recessed,
 *   railed and ticked in gold. These are the rows the reader is buying.
 * · `included` — true on both tiers. Flat, an ink tick, a hairline under it.
 * · `limit` — what the free tier actually allows. Flat, and the mark is a RULE
 *   rather than a tick, because a tick meaning "you have this, but only a bit of
 *   it" is the kind of half-true a paywall must not print.
 */
export type RowGrade = 'granted' | 'included' | 'limit';

export function ScheduleRow({
  grade, label, detail, last = false,
}: {
  grade: RowGrade;
  label: string;
  /** The value, or null — which draws the em-rule: not at all. */
  detail: string | null;
  last?: boolean;
}) {
  const granted = grade === 'granted';

  const body = (
    <View style={[r.row, granted && r.rowGranted]}>
      <View style={r.markBox}>
        {granted ? (
          <LinearGradient
            colors={[METAL.GOLD.lit, METAL.GOLD.base, METAL.GOLD.shade]}
            start={LIGHT_START}
            end={LIGHT_END}
            style={[r.mark, { borderColor: METAL.GOLD.rim }]}
          >
            <View style={[r.tickShort, { backgroundColor: METAL.GOLD.on }]} />
            <View style={[r.tickLong, { backgroundColor: METAL.GOLD.on }]} />
          </LinearGradient>
        ) : grade === 'included' ? (
          <View style={[r.mark, { borderColor: mix(PAPER_SHADE, INK, 0.45) }]}>
            <View style={[r.tickShort, { backgroundColor: INK }]} />
            <View style={[r.tickLong, { backgroundColor: INK }]} />
          </View>
        ) : (
          // A LIMIT IS NOT A TICK. An open square with a bar across it: the shape
          // says "bounded", which is the honest drawing for "one a day".
          <View style={[r.mark, { borderColor: mix(PAPER_SHADE, INK, 0.32) }]}>
            <View style={[r.bar, { backgroundColor: mix(PAPER_SHADE, INK, 0.55) }]} />
          </View>
        )}
      </View>

      <View style={r.textBox}>
        <Text style={[r.label, granted && r.labelGranted]} numberOfLines={2}>{label}</Text>
        <Text
          style={[r.detail, granted && r.detailGranted, detail === null && r.detailNone]}
          numberOfLines={2}
        >
          {detail ?? 'not at all'}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      {granted ? (
        // THE RECESS. StruckNiche's rule, applied to a strip: a groove is bright
        // where a dome is dark, so this runs the tile's gradient BACKWARDS and
        // takes the dark hairline along its top edge, where the light cannot
        // reach into the cut. Reverse those two and the row stops being cut in
        // and starts floating off the certificate.
        <LinearGradient
          colors={[mix(PAPER, PAPER_SHADE, 0.5), PAPER, PAPER_LIT]}
          locations={[0, 0.45, 1]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={r.niche}
        >
          <View pointerEvents="none" style={[r.nicheTop, { backgroundColor: mix(PAPER_SHADE, INK, 0.26) }]} />
          <LinearGradient
            colors={[METAL.GOLD.lit, METAL.GOLD.base, METAL.GOLD.shade]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={r.rail}
            pointerEvents="none"
          />
          {body}
          <View pointerEvents="none" style={[r.nicheFoot, { backgroundColor: PAPER_LIT }]} />
        </LinearGradient>
      ) : (
        body
      )}
      {!last && !granted ? (
        <View style={[r.hair, { backgroundColor: mix(PAPER_SHADE, PAPER, 0.35) }]} />
      ) : null}
    </View>
  );
}

const r = StyleSheet.create({
  headRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE[2],
    marginTop: SPACE[3], marginBottom: SPACE[1],
  },
  headLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.7 },
  headRule: { flex: 1, height: 1 },

  niche: { borderRadius: 3, overflow: 'hidden', marginVertical: 3 },
  nicheTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 1 },
  nicheFoot: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
  // 3pt of metal down the cut edge. Wider reads as a highlighter pen, which is
  // the exact "cheap" this redesign is avoiding.
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },

  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2], paddingVertical: 7 },
  rowGranted: { paddingLeft: SPACE[2] + 3, paddingRight: SPACE[2], paddingVertical: 9 },

  markBox: { width: 20, alignItems: 'center' },
  mark: {
    width: 17, height: 17, borderRadius: 2, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  // The tick is two bars rather than a glyph: at 17px an icon font's checkmark
  // is a smudge, and two rotated rectangles are exact at any size.
  tickShort: {
    position: 'absolute', width: 5, height: 1.8, borderRadius: 1,
    transform: [{ translateX: -3.2 }, { translateY: 2.4 }, { rotate: '45deg' }],
  },
  tickLong: {
    position: 'absolute', width: 9, height: 1.8, borderRadius: 1,
    transform: [{ translateX: 1.4 }, { translateY: 0.6 }, { rotate: '-45deg' }],
  },
  bar: { width: 8, height: 1.8, borderRadius: 1 },

  textBox: { flex: 1, minWidth: 0 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, color: INK, lineHeight: 17 },
  labelGranted: { fontFamily: 'Inter_700Bold' },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 15, color: MID, marginTop: 1 },
  // INK, NOT MID, on a granted row. `MID` is 5.3:1 on paper and about 3.1:1 in
  // the shaded corner of a struck surface — the trap §19 records for the quote
  // plate's byline and PassParts records again for `C.inkSoft`. A recess is a
  // struck surface, so its secondary text takes the darker tone.
  detailGranted: { color: INK, fontFamily: 'Inter_500Medium' },
  detailNone: { fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12.5 },

  hair: { height: 1, marginLeft: 20 + SPACE[2] },
});
