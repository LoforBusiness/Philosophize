// ─────────────────────────────────────────────────────────────────────────────
// ONE OF PHILOSOPHY'S COURSES ON ITS SUBJECT PAGE — a branch, which opens its road.
//
// It replaces the photographed branch card the Learn tab used to draw (the owner
// asked for the branches to be redrawn in the same language as the subjects, so the
// whole flow is one look). The branch keeps its own hue from design.ts: the drawing's
// panel and the ledge are that colour, the words are ink on white.
// ─────────────────────────────────────────────────────────────────────────────
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Card from '@/components/ui/Card';
import { C, BRANCH, type BranchKey } from '@/constants/design';
import { lipOf } from '@/components/shared/tone';
import SubjectArt from './SubjectArt';
import { sceneTones } from './subjectScenes';
import { DoneTag } from './tag';
import { TILE_PAD, BRANCH_TITLE, BRANCH_NAME_LINES, branchArt } from './tileLayout';

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
  const t = sceneTones(hue);
  const { width } = useWindowDimensions();
  const art = branchArt(width);
  return (
    <Card pad={0} onPress={onPress} ledge={lipOf(hue)} accessibilityLabel={`Open ${name}`}>
      <View style={styles.row}>
        <View style={[styles.panel, { backgroundColor: t.tile, width: art, height: art }]}>
          <SubjectArt art={slug} hue={hue} size={art - 8} />
        </View>
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
  row: { flexDirection: 'row', alignItems: 'center', padding: TILE_PAD, gap: TILE_PAD },
  panel: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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
