// ─────────────────────────────────────────────────────────────────────────────
// ONE OF PHILOSOPHY'S COURSES ON ITS SUBJECT PAGE — a branch, which opens its road.
//
// The branch's poster (posters.ts) fills the card's left side, flush with its edge
// and the card's full height, in the branch's own hue from design.ts; the words are
// ink on the white face beside it. The same construction as the subject tiles, turned
// on its side, so a list of six reads as a shelf of covers.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Card from '@/components/ui/Card';
import { C, BRANCH, type BranchKey } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import Poster from './Poster';
import { DoneTag } from './tag';
import { TILE_PAD, BRANCH_TITLE, BRANCH_NAME_LINES, BRANCH_CARD_H, branchArt } from './tileLayout';

/** The card face's own border, each side (Card). */
const BORDER = 2;

export default function BranchCard({
  slug, name, desc, units, done, onPress,
}: {
  slug: BranchKey;
  name: string;
  desc: string;
  units: number;
  done: number;
  onPress: () => void;
}) {
  const hue = BRANCH[slug];
  const { width } = useWindowDimensions();
  const art = branchArt(width);
  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(hue)} accessibilityLabel={`Open ${name}`}>
      <View style={styles.row}>
        <Poster art={slug} hue={hue} width={art} height={BRANCH_CARD_H - 2 * BORDER} style={styles.poster} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={BRANCH_NAME_LINES}>{name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{desc}</Text>
          <View style={styles.foot}>
            <Text style={styles.units} numberOfLines={1}>{units} UNIT{units === 1 ? '' : 'S'}</Text>
            <DoneTag done={done} />
          </View>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: TILE_PAD, paddingRight: TILE_PAD, height: BRANCH_CARD_H - 2 * BORDER },
  // The face's radius less its border, so the poster's corners sit inside the rule.
  poster: { borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  text: { flex: 1 },
  name: { fontFamily: BRANCH_TITLE.family, fontSize: BRANCH_TITLE.fontSize, lineHeight: BRANCH_TITLE.lineHeight, color: C.ink },
  desc: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, lineHeight: 17,
    color: C.inkSoft, marginTop: 2,
  },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, minHeight: 20 },
  units: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.4, color: C.inkSoft, flexShrink: 0 },
  arrow: { fontFamily: 'Inter_400Regular', fontSize: 18, color: C.ink },
});
