import { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { INK, PAPER } from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf, PLATE_FACE } from './stageSkin';

// ─────────────────────────────────────────────────────────────────────────────
// The live brick structure for logic-arguments-2 ("The Master Builder").
//
// An argument as a building: two premise-stones at the base, a conclusion keystone
// resting on top. This is the lesson's hero visual, so — exactly like the figures
// (see Stickman.tsx / rig.ts) — it is drawn as native RN Views moved by Reanimated
// transforms, NOT as an <Svg>. react-native-svg 15 re-uploads the whole surface to
// a GPU bitmap on any animated child (~10fps full-screen on an S24 Ultra); Views
// composite the collapse and the fly-up on the GPU for free.
//
// This component is a DUMB renderer, the way Stickman is: the parent computes one
// derived `S` (each stone's translate / rotate / scale / opacity, and every
// annotation's opacity) on the UI thread and this applies it. Brick FACE TEXT is a
// plain React prop — it is not animated geometry, so a re-render swaps it for
// nothing, and a freshly-lettered stone is re-laid by the parent so the swap never
// pops.
//
// ── STRUCK, NOT OUTLINED (group AG) ─────────────────────────────────────────
//
// It used to be four hairline rectangles on paper: a 1.5pt ink border, a PAPER
// fill, a 2-unit rule for a plinth. Everything else in the app is an object — a
// rounded face on a hard ledge, lit from the top left and never anywhere else — so
// the stones now carry the depth kit's plate (`PLATE_FACE` on a `LIP`), and their
// base rises out of the floor as a real plinth (drawn by the SCENE, which owns the
// site; `PLINTH_*` below is the shared geometry).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('logic');
const { SHADE } = TONE;
const LIP = lipOf(TONE);

// Brick geometry, in STAGE units (the same 400×560 space the figures live in — the
// structure sits inside the camera container, so it pans and zooms with them).
// The base is kept narrow and centred (a compact column) so the two builders stand
// clearly BESIDE it rather than buried behind it — only their reaching arms cross
// over, and those tuck behind since the structure draws on top.
export const BW = 114;          // brick width
export const BH = 41;           // brick height
export const CENTER_X = 200;    // structure centre
export const BASE_LX = 142;     // base-left brick centre
export const BASE_RX = 258;     // base-right brick centre
export const BASE_Y = 452;      // base row centre (a bench height, not the floor)
export const KEY_X = CENTER_X;  // keystone centre
export const KEY_Y = BASE_Y - BH - 3;   // keystone centre, RESTING on the base
/** The plinth's top edge, three units under the base row. */
export const PLINTH_Y = BASE_Y + BH / 2 + 3;
/** And its height: down to the ground line (GROUND is 500), so it stands on the floor. */
export const PLINTH_H = 500 - PLINTH_Y;
export const PLINTH_W = 244;

/** The boundary the FORM outline traces, vertically: the keystone's top to the plinth. */
export const FORM_TOP = KEY_Y - BH / 2 - 4;
export const FORM_H = PLINTH_Y - FORM_TOP;

/** One stone's animated state. */
export interface BrickXf { tx: number; ty: number; rot: number; scale: number; opacity: number }
/** The whole structure, computed by the parent each frame. */
export interface StructState {
  p1: BrickXf; p2: BrickXf; key: BrickXf;
  /** The dashed empty keystone slot (the fly-up question). */
  slotOp: number;
  /** The PREMISES plaque, inscribed on the plinth. */
  tagBase: number;
  /** The CONCLUSION plaque, over the keystone on its leader. */
  tagConc: number;
  /** The dashed FORM boundary, and the box it traces. */
  formOp: number;
  formX: number;
  formW: number;
  /** The therefore-mark at the keystone's shoulder. */
  markOp: number;
}

interface Props {
  S: SharedValue<StructState>;
  p1Label: string;
  p2Label: string;
  keyLabel: string;
}

// Ruled writing lines for an UNLETTERED stone. Act 1 shows blank stones for three
// straight beats, and a bare rectangle there read as unfinished art rather than as
// "a stone waiting for a sentence". Two ruled lines say the second thing.
const RULED_LONG = [0, 1, 2, 3, 4, 5, 6];
const RULED_SHORT = [0, 1, 2, 3];

function Brick({ label }: { label: string }) {
  if (!label) {
    return (
      <View style={styles.brick}>
        <View style={styles.ruledRow}>
          {RULED_LONG.map((k) => <View key={k} style={styles.ruledDash} />)}
        </View>
        <View style={[styles.ruledRow, { marginTop: 7 }]}>
          {RULED_SHORT.map((k) => <View key={k} style={styles.ruledDash} />)}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.brick}>
      <Text style={styles.brickText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </View>
  );
}

export default function BrickStructure({ S, p1Label, p2Label, keyLabel }: Props) {
  // Placement helper: a brick box is centred on the origin (left/top pull it back
  // by half), so translate puts its CENTRE at (tx,ty) and rotate/scale pivot there.
  const box = useMemo<ViewStyle>(
    () => ({ position: 'absolute', left: -BW / 2, top: -BH / 2, width: BW, height: BH }),
    []
  );

  const s1 = useAnimatedStyle(() => {
    const b = S.value.p1;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const s2 = useAnimatedStyle(() => {
    const b = S.value.p2;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const sk = useAnimatedStyle(() => {
    const b = S.value.key;
    return { opacity: b.opacity, transform: [{ translateX: b.tx }, { translateY: b.ty }, { rotate: `${b.rot}deg` }, { scale: b.scale }] };
  });
  const slotStyle = useAnimatedStyle(() => ({ opacity: S.value.slotOp }));
  const baseTag = useAnimatedStyle(() => ({ opacity: S.value.tagBase }));
  const concTag = useAnimatedStyle(() => ({ opacity: S.value.tagConc }));
  const markStyle = useAnimatedStyle(() => ({ opacity: S.value.markOp }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: S.value.formOp,
    left: S.value.formX,
    width: S.value.formW,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* THE FORM: a dashed boundary round the standing stack, drawn behind the
          stones. "This shape is the basic form of an argument" is the sentence it
          belongs to, and the shape is what it names. Dashed, because a dashed
          outline in this app is a BOUNDARY and never a mass. */}
      <Animated.View style={[styles.form, formStyle]} />

      {/* Empty dashed keystone slot — shown only for the fly-up question. It has to
          carry its own translate to the keystone spot: `box` only re-centres the
          brick on its origin, and every stone is otherwise placed by the animated
          transform the parent supplies. Without this the slot rendered at the
          scene's top-left corner, far off stage, and was never once seen. */}
      <Animated.View style={[box, styles.slotAt, slotStyle]}>
        <View style={styles.slot}>
          {/* the gap states the question the fly-up answers */}
          <Text style={styles.slotMark}>?</Text>
        </View>
      </Animated.View>

      {/* THE THEREFORE-MARK at the keystone's shoulder — logic's own sign for the
          claim that follows. Three discs rather than the glyph: a missing glyph is
          invisible to a width test (it measures narrow and passes), and at 6 units
          across a drawn dot is crisper than type. */}
      <Animated.View style={[styles.mark, markStyle]}>
        <View style={[styles.markDot, styles.markTop]} />
        <View style={[styles.markDot, styles.markLeft]} />
        <View style={[styles.markDot, styles.markRight]} />
      </Animated.View>

      {/* the three stones. The keystone is drawn last so a collapse tumbles it
          across the base rather than behind it. */}
      <Animated.View style={[box, s1]}><Brick label={p1Label} /></Animated.View>
      <Animated.View style={[box, s2]}><Brick label={p2Label} /></Animated.View>
      <Animated.View style={[box, sk]}><Brick label={keyLabel} /></Animated.View>

      {/* ROLE CALL-OUTS. These used to be 9.5px grey captions floating near the
          structure, which on a phone read as specks. They are plaques now, so the
          build reads as a LABELLED DIAGRAM — the annotation names its subject
          instead of hovering near it. CONCLUSION sits over the keystone on a
          leader that touches its top edge; PREMISES is INSCRIBED ON THE PLINTH,
          which is what a plinth is for and what keeps it off the base stones' own
          faces. Both are centred on the column (x 200), clear of both builders
          (x 62 and 330) at every camera scale. */}
      <Animated.View style={[styles.tagConc, concTag]}>
        <View style={styles.plaque}><Text style={styles.plaqueText}>CONCLUSION</Text></View>
        <View style={styles.leader} />
      </Animated.View>
      <Animated.View style={[styles.tagPrem, baseTag]}>
        <View style={styles.plaque}><Text style={styles.plaqueText}>PREMISES</Text></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A STONE IS A STRUCK PLATE (group AG): a white face on a rounded ink outline,
  // standing on a hard ledge. No gradient anywhere in it.
  brick: {
    width: BW, height: BH,
    borderWidth: 2, borderColor: INK, borderRadius: 6,
    backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 7,
  },
  brickText: {
    fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 14.5, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },
  // SHADE, not RULE: a RULE-weight hairline on a white face is a structural tick
  // that all but disappears at the stage's scale, and these have to READ as "a face
  // waiting for a sentence" from arm's length.
  ruledRow: { flexDirection: 'row', gap: 5 },
  ruledDash: { width: 7, height: 1.5, backgroundColor: SHADE, borderRadius: 1 },

  // THE FORM. `left` and `width` are animated (the box follows how many stones are
  // standing), so only the constants live here.
  form: {
    position: 'absolute', top: FORM_TOP, height: FORM_H,
    borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed', borderRadius: 8,
  },

  slotAt: { transform: [{ translateX: KEY_X }, { translateY: KEY_Y }] },
  slot: {
    width: BW, height: BH, borderRadius: 6,
    borderWidth: 2, borderColor: SHADE, borderStyle: 'dashed',
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
  },
  slotMark: {
    fontFamily: 'Inter_700Bold', fontSize: 22, color: SHADE, includeFontPadding: false,
  },

  // ── the therefore-mark ──────────────────────────────────────────────────────
  // A 20×20 box at the keystone's left shoulder: the keystone's left edge is at
  // 143, so 113…133 clears it with ten units to spare and sits well inside the
  // form's own left edge (79).
  mark: { position: 'absolute', left: 113, top: 392, width: 20, height: 20 },
  markDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  markTop: { left: 7, top: 0 },
  markLeft: { left: 1, top: 12 },
  markRight: { left: 13, top: 12 },

  // ── the role call-outs ──────────────────────────────────────────────────────
  // Geometry, so the leader actually touches what it names:
  //   CONCLUSION  plaque 16 + leader 5 = 21 tall, sitting on the keystone's top
  //               edge (KEY_Y − BH/2 = 387.5) → top 366.5.
  //   PREMISES    inscribed on the plinth face (475.5 … 500), so top 479.5 centres
  //               a 16-tall plaque in it with four units of stone either side.
  tagConc: {
    position: 'absolute', left: 0, right: 0, top: KEY_Y - BH / 2 - 21, alignItems: 'center',
  },
  tagPrem: {
    position: 'absolute', left: 0, right: 0, top: PLINTH_Y + 4, alignItems: 'center',
  },
  plaque: {
    height: 16, paddingHorizontal: 9, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.5, color: PAPER,
    includeFontPadding: false,
  },
  leader: { width: 1.5, height: 5, backgroundColor: INK },
});
