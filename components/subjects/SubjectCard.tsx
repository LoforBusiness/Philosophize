// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT IN HOME'S SHELF — a large card, most of the screen wide, with the next
// one peeking in on either side.
//
// ── THE PLACE, NOT A WHITE SLIP UNDER IT (2026-09-30) ────────────────────────
//
// "They look kind of plain still … honestly, the quick start cards look better than
// the subject cards." The difference was the foot: a Quick Start card's words sit on
// the picture's own dark ground, and a subject card's sat on a white slip, so every
// card read as a picture with a form under it. The foot is the deepest colour IN the
// picture now (foot.ts), the card's edge is that same colour so the picture is framed
// in it, and the card stands on a ledge of it taken toward ink.
//
// The picture is drawn PARALLAX wider each side than its window, and the shelf slides
// it against the card as the card moves (`artStyle`, SubjectCarousel) — the depth a
// flat card cannot have on its own.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import Card from '@/components/ui/Card';
import type { Subject } from '@/data/subjects';
import Poster from './Poster';
import { CARD_POSTER } from './posterArt';
import { DoneTag, SoonTag } from './tag';
import { footOf, kickerOf, FOOT_TEXT, FOOT_SOFT } from './foot';
import { CARD_PAD, CARD_TITLE, PARALLAX, cardArtHeight } from './tileLayout';

/** The card face's own border, each side (Card). */
const BORDER = 2;

export default function SubjectCard({
  subject, done, width, onPress, artStyle,
}: {
  subject: Subject;
  done: number;
  width: number;
  onPress: () => void;
  /** The picture's slide against the card (the shelf's parallax). */
  artStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
}) {
  const soon = subject.status === 'soon';
  const { foot, ledge } = footOf(subject);
  const winW = width - 2 * BORDER;
  const artH = cardArtHeight(width);
  return (
    <Card pad={0} onPress={onPress} ledge={ledge}
      style={{ backgroundColor: foot, borderColor: foot }}
      accessibilityLabel={`Open ${subject.name}${soon ? ', coming soon' : ''}`}
      containerStyle={{ width }}>
      <View style={[styles.window, { width: winW, height: artH }]}>
        <Animated.View style={[styles.slide, artStyle]}>
          <Poster art={subject.slug} hue={subject.hue} width={winW + 2 * PARALLAX} height={artH}
            image={CARD_POSTER[subject.slug]?.source} />
        </Animated.View>
      </View>
      <View style={styles.foot}>
        <Text style={styles.kicker} numberOfLines={1}>{kickerOf(subject)}</Text>
        <Text style={styles.name} numberOfLines={2}>{subject.name}</Text>
        <Text style={styles.blurb} numberOfLines={2}>{subject.blurb}</Text>
        <View style={styles.tagRow}>
          {soon ? <SoonTag /> : done > 0 ? <DoneTag done={done} /> : (
            <View style={styles.start}>
              <Text style={[styles.startText, { color: foot }]}>START HERE</Text>
            </View>
          )}
          <View style={styles.go}>
            <Text style={[styles.goText, { color: foot }]}>›</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // The face's radius less its border, so the picture's corners sit inside the rule.
  window: { overflow: 'hidden', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  slide: { position: 'absolute', top: 0, left: -PARALLAX },
  foot: { paddingHorizontal: CARD_PAD, paddingTop: 12, paddingBottom: CARD_PAD - 2 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: FOOT_SOFT, marginBottom: 3 },
  name: {
    fontFamily: CARD_TITLE.family, fontSize: CARD_TITLE.fontSize, lineHeight: CARD_TITLE.lineHeight,
    color: FOOT_TEXT,
  },
  blurb: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5, lineHeight: 19,
    // Two lines reserved, so every card on the shelf is one height whichever blurbs wrap.
    color: FOOT_SOFT, marginTop: 3, minHeight: 38,
  },
  tagRow: { marginTop: 12, minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  start: { backgroundColor: FOOT_TEXT, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  startText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  go: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: FOOT_TEXT,
    alignItems: 'center', justifyContent: 'center',
  },
  goText: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 22, marginTop: -2, marginLeft: 1 },
});
