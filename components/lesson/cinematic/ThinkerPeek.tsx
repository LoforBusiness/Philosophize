import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming, Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ERA, type EraKey } from '@/constants/design';
import { ALL_PHILOSOPHERS, eraGroupOfId } from '@/data/philosophers';
import { PAPER_LIT, PAPER_SHADE, SHADOW, mix } from '@/components/shared/tone';
import { INK, PAPER, SOFT } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// A SNAPSHOT, NOT A PROFILE.
//
// Tapping a name in the deck drops one short card: who they were, when, and the
// single line the roster already keeps about what they thought. That last part
// is the whole reason this is cheap — `oneLiner` exists on all 322 thinkers and
// is exactly the right length ("Trust experience, and question every easy
// certainty"). Nothing new had to be written for any of them.
//
// ── WHAT IT DELIBERATELY DOES NOT DO ────────────────────────────────────────
//
// The Thinkers tab already has the long form: bio, areas, four to six quotes,
// three facts, a quiz. Reproducing any of that here would make a reader choose
// between finishing the lesson and reading a profile, mid-question. This is a
// glance and then back to the lesson — three lines, no scroll, and it closes on
// the next tap.
//
// ── THE OPENING IS A LEADER LINE, THEN THE CARD ─────────────────────────────
//
// It used to fade in as one block, which said nothing about where it came from.
// Now a hairline draws DOWN from under the name that was tapped, and the card
// unfurls beneath it — so the card reads as having been pulled out of that
// word rather than as a panel that appeared.
//
// THE LINE LIVES IN A BAND OF ITS OWN, and that is the whole reason the layout
// has one. A leader drawn from the name's baseline would cross every line of
// narration between the name and the card, which is group S's one unbreakable
// rule — nothing may be drawn across a word. So the wrap opens a `TETHER`-tall
// strip BELOW the paragraph, which is empty by construction, and the line runs
// there. It still points at the name, because it takes the name's own x.
//
// ── ONE DRIVER, SO THE EXIT IS THE ENTRANCE BACKWARDS ───────────────────────
//
// Every stage reads the same 0→1 value, rather than each carrying its own timing.
// That is what makes the close a true reverse instead of a second animation that
// happens to look similar: the value runs back down, so the content fades before
// the card collapses before the line retracts — exactly the order they arrived
// in, undone.
//
// ── AND THE DRIVER IS LINEAR, WHICH TOOK A MEASUREMENT TO LEARN ─────────────
//
// The obvious build puts Material 3's `emphasized decelerate` (0.05, 0.7, 0.1,
// 1.0) on the driver itself and slices the stages out of it. Measured in the
// rendered page, the leader then drew its full 15 units in **10 milliseconds**:
// that curve is enormously front-loaded, so a stage occupying the first 42% of
// the VALUE occupies almost none of the TIME. A stage window is only honest on a
// linear driver.
//
// So the timing is linear and each stage eases itself — and the entrance/exit
// pair falls out for free rather than needing two curves. `1 - (1-u)³` run
// forwards is a decelerate (fast, then settling); the identical function read
// BACKWARDS is an accelerate (barely moving, then gone). That is exactly M3's
// entrance and exit pairing, from one expression, which is what makes "the close
// is the open reversed" true of the feel and not just of the order.
//
// The asymmetry that remains is DURATION, and it is theirs too: the exit is the
// shorter of the two, because a reader dismissing this is already looking at what
// they want next and making them watch it go is making them wait.
// ─────────────────────────────────────────────────────────────────────────────

const CARD_H = 74;
/** The empty strip between the paragraph and the card, which the leader runs down. */
const TETHER = 15;

const IN_MS = 420;
const OUT_MS = 250;

// The stages, as slices of the driver — and because the driver is linear these
// are also slices of the TIME. They OVERLAP on purpose: a card that waits for the
// line to finish reads as two events, and the point is that the line causes the
// card.
//
//   leader   0 → 160ms      card   109 → 420ms      words   202 → 420ms
const LINE: readonly [number, number] = [0, 0.38];
const CARD: readonly [number, number] = [0.26, 1];
const BODY: readonly [number, number] = [0.48, 1];

/**
 * One stage's own progress, eased.
 *
 * Cubic out. Forwards it decelerates into place; read backwards — which is what
 * the close does — the same curve accelerates away. Written out rather than
 * reached for from `Easing`, because these run inside a worklet on every frame
 * and an easing object is not a worklet.
 */
function stage(v: number, win: readonly [number, number]): number {
  'worklet';
  const raw = (v - win[0]) / (win[1] - win[0]);
  const u = raw < 0 ? 0 : raw > 1 ? 1 : raw;
  const t = 1 - u;
  return 1 - t * t * t;
}

export default function ThinkerPeek({ id, anchorX, onClose }: {
  /** The philosopher to show, or null. */
  id: string | null;
  /** Where the tapped name sits across the deck, in points from its left edge. */
  anchorX: number;
  onClose: () => void;
}) {
  const open = useSharedValue(0);
  useEffect(() => {
    open.value = withTiming(id ? 1 : 0, {
      duration: id ? IN_MS : OUT_MS,
      easing: Easing.linear,
    });
  }, [id, open]);

  const lineH = (v: number) => { 'worklet'; return stage(v, LINE) * TETHER; };
  const cardH = (v: number) => { 'worklet'; return stage(v, CARD) * CARD_H; };

  // The wrap is exactly as tall as what is inside it, so a closed card takes no
  // room at all and the deck below does not reserve a gap for it.
  const wrap = useAnimatedStyle(() => ({ height: lineH(open.value) + cardH(open.value) }));

  const tether = useAnimatedStyle(() => ({
    height: lineH(open.value),
    // It fades in over the first slice of its own draw, so the first pixel is not
    // a dot appearing out of nothing under the paragraph.
    opacity: interpolate(open.value, [0, 0.1], [0, 1], Extrapolation.CLAMP),
  }));

  const card = useAnimatedStyle(() => ({
    height: cardH(open.value),
    opacity: interpolate(open.value, [CARD[0], 0.58], [0, 1], Extrapolation.CLAMP),
    // A short rise INTO place. Not a scale: scaling a card scales the type inside
    // it, and type that grows into position is the one thing that always reads as
    // cheap however well it is timed.
    transform: [{ translateY: -7 * (1 - stage(open.value, CARD)) }],
  }));

  const body = useAnimatedStyle(() => ({ opacity: stage(open.value, BODY) }));

  // ── THE CARD OUTLIVES THE CLOSE, AND SAYING SO WAS NOT ENOUGH ──────────────
  //
  // This used to read `const p = id ? find(id) : null`, under a comment claiming
  // the card was kept mounted so the exit could play. It was not: the moment `id`
  // went null there was nothing to render, the subtree unmounted on that frame,
  // and the card vanished instead of retracting. The comment described the
  // intention and the line did the opposite, which is why measuring it — rather
  // than reading it — is what found it.
  //
  // So the last thinker SHOWN is held, and the animation is what decides whether
  // anything is visible. Held forever rather than cleared on completion: at rest
  // the wrap is zero-high with `pointerEvents: none`, so a card nobody can see or
  // touch costs one view, and a cleanup that races the timing is how the exit
  // would get cut short again.
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => { if (id) setShown(id); }, [id]);

  const p = shown ? ALL_PHILOSOPHERS.find((x) => x.id === shown) : null;
  const group = shown ? (eraGroupOfId(shown) as EraKey | null) : null;
  const hue = group ? ERA[group] : INK;

  return (
    <Animated.View nativeID="peek-wrap" style={[styles.wrap, wrap]} pointerEvents={id ? 'auto' : 'none'}>
      {p ? (
        <>
          {/* THE LEADER. Its left is the name's own centre, less half its width,
              so the line hangs under the middle of the word rather than beside
              it. Clamped into the deck so a name at either margin still gets a
              line that is inside the page. */}
          <Animated.View
            nativeID="peek-line"
            style={[
              styles.tether,
              { left: Math.max(1, anchorX - LINE_W / 2), backgroundColor: hue },
              tether,
            ]}
          />
          <Animated.View nativeID="peek-card" style={[styles.cardBox, card]}>
            <Pressable onPress={onClose} accessibilityRole="button" style={styles.press}>
              <LinearGradient
                colors={[PAPER_LIT, PAPER, mix(PAPER, PAPER_SHADE, 0.3)]}
                locations={[0, 0.5, 1]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.55, y: 1 }}
                style={styles.card}
              >
                {/* The era's own colour down the cut edge — the same rail a quote
                    plate of theirs carries, so the card and the plate agree. */}
                <View style={[styles.rail, { backgroundColor: hue }]} />
                <Animated.View style={body}>
                  <View style={styles.head}>
                    <Text style={[styles.name, { color: hue }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.dates} numberOfLines={1}>{p.lifespan}</Text>
                  </View>
                  <Text style={styles.line} numberOfLines={2}>{p.oneLiner}</Text>
                </Animated.View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </>
      ) : null}
    </Animated.View>
  );
}

const LINE_W = 1.5;

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', overflow: 'hidden' },
  tether: {
    position: 'absolute',
    top: 0,
    width: LINE_W,
    borderRadius: LINE_W,
  },
  cardBox: { position: 'absolute', left: 0, right: 0, top: TETHER, overflow: 'hidden' },
  press: { height: CARD_H },
  card: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: mix(PAPER, PAPER_SHADE, 0.7),
    paddingVertical: 7,
    paddingLeft: 12,
    paddingRight: 10,
    overflow: 'hidden',
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy },
    shadowOpacity: SHADOW.opacity,
    shadowRadius: 2.5,
    elevation: 1,
  },
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 13.5, fontWeight: '700', flexShrink: 1 },
  dates: { fontSize: 10.5, color: SOFT, letterSpacing: 0.3 },
  line: { fontSize: 12, lineHeight: 16, color: INK, marginTop: 3 },
});
