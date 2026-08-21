import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import BadgeMedal from '@/components/shared/BadgeMedal';
import RankSeal from '@/components/shared/RankSeal';
import SketchIcon from '@/components/shared/SketchIcon';
import { BADGES, isEarned, type BadgeDef, type ProgressStats } from '@/data/badges';
import { RANKS, rankOrder, rankDegree, rankInsignia } from '@/data/ranks';
import { ORDER_LABEL } from '@/constants/insignia';
import { useUserDataStore, SHOWCASE_MAX } from '@/stores/userDataStore';
import { C, TYPE, SPACE, RADIUS } from '@/constants/design';
import { touch } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE CABINET — what a reader chooses to be seen holding.
//
// Asked for directly: "a way that the user can display three distinct badges on
// their profile and their rank also on their profile … visible on the top of the
// user's profile that the user can edit."
//
// ── WHY IT SITS ABOVE EVERYTHING, AND WHY IT IS ONE ROW ────────────────────
//
// Profile already carries a rank card, a climb chart, six mastery bars, a
// trophy shelf and three charts, and the note in that screen about "a
// bombardment of information" is the reason this is a STRIP rather than a
// panel. One row, four objects, no numbers: the pin you hold and the three
// medals you picked. Everything explanatory is already further down the page,
// so this does not have to explain anything — it only has to be the first thing
// you see, which is the whole of what a cabinet is for.
//
// The rank pin is NOT one of the three. It is not chosen and cannot be
// unchosen, so putting it in the same row as three slots the reader controls
// would suggest it could be swapped out. It sits before them, larger, with a
// rule between: the thing you were given, then the things you picked.
//
// ── AN EMPTY SLOT IS A SLOT, NOT A GAP ────────────────────────────────────
//
// A reader with no badges chosen sees three dashed outlines carrying a pencil,
// because an empty strip that renders as blank paper reads as a broken row
// rather than as an invitation. The outline occupies the same box a filled slot
// does, so nothing shifts when one is filled.
// ─────────────────────────────────────────────────────────────────────────────

const SLOT = 54;

interface Props {
  stats: ProgressStats;
  rankIndex: number;
}

export default function Showcase({ stats, rankIndex }: Props) {
  const showcaseBadges = useUserDataStore((s) => s.showcaseBadges);
  const setShowcase = useUserDataStore((s) => s.setShowcase);
  const [picking, setPicking] = useState(false);

  const rank = RANKS[Math.max(0, Math.min(RANKS.length - 1, rankIndex))];
  const ins = rankInsignia(rankIndex);

  // Earned, in the case's own order — so the picker reads like the badge grid
  // rather than like a second, differently-sorted list of the same things.
  const earned = useMemo(() => BADGES.filter((b) => isEarned(b, stats)), [stats]);

  // A chosen id that is no longer earned (a reset, a merge from another device)
  // is dropped HERE rather than in the store — see the note on `showcaseBadges`.
  const chosen = useMemo(
    () => showcaseBadges
      .map((id) => earned.find((b) => b.id === id))
      .filter((b): b is BadgeDef => !!b)
      .slice(0, SHOWCASE_MAX),
    [showcaseBadges, earned],
  );

  const toggle = (id: string) => {
    touch();
    const has = showcaseBadges.includes(id);
    if (has) setShowcase(showcaseBadges.filter((x) => x !== id));
    // Full: the oldest choice makes way, so a tap always does something. A
    // no-op tap on a full cabinet reads as the button being broken.
    else setShowcase([...showcaseBadges, id].slice(-SHOWCASE_MAX));
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={() => { touch(); setPicking(true); }}
        accessibilityRole="button"
        accessibilityLabel="Edit the badges shown on your profile"
      >
        <View style={styles.rankCol}>
          <RankSeal
            glyph={rank.glyph}
            state="current"
            size={SLOT + 10}
            order={rankOrder(rankIndex)}
            degree={rankDegree(rankIndex)}
          />
          <Text style={[styles.rankName, { color: ins.base }]} numberOfLines={1}>
            {rank.name.toUpperCase()}
          </Text>
          {/* THE ORDER AND THE RUNG, not the Circle's subtitle — "LAPIS · THE
              REAL" measured wider than the 96pt column and rendered as
              "LAPIS · THE R…", which is a label that has stopped being one.
              The position on the ladder is the more useful half anyway: the
              colour already says which order this is. */}
          <Text style={styles.rankOrder} numberOfLines={1}>
            {rank.id} / {RANKS.length} · {ORDER_LABEL[rankOrder(rankIndex)].toUpperCase()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.slots}>
          {Array.from({ length: SHOWCASE_MAX }).map((_, i) => {
            const b = chosen[i];
            return (
              <View key={i} style={styles.slot}>
                {b ? (
                  <BadgeMedal family={b.family} tier={b.tier} glyph={b.glyph} earned size={SLOT} />
                ) : (
                  <View style={styles.empty}>
                    <SketchIcon name="pencil" size={15} color={C.dim} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Pressable>

      <PickerSheet
        visible={picking}
        onClose={() => setPicking(false)}
        earned={earned}
        chosen={showcaseBadges}
        onToggle={toggle}
      />
    </View>
  );
}

// ── the picker ──────────────────────────────────────────────────────────────
//
// A modal rather than a route, for the reason the other sheets in this app are:
// choosing what to display is a detour from reading the profile, and a detour
// that pushes a screen makes the back button mean something different.
function PickerSheet({
  visible, onClose, earned, chosen, onToggle,
}: {
  visible: boolean;
  onClose: () => void;
  earned: BadgeDef[];
  chosen: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Your cabinet</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <SketchIcon name="close" size={20} color={C.ink} />
            </Pressable>
          </View>
          <Text style={styles.sheetSub}>
            {earned.length === 0
              ? 'Finish a lesson and the first medals arrive. You can pin three of them here.'
              : `Pick up to ${SHOWCASE_MAX}. Tap a medal to add or remove it.`}
          </Text>

          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {earned.map((b) => {
              const on = chosen.includes(b.id);
              return (
                <Pressable
                  key={b.id}
                  onPress={() => onToggle(b.id)}
                  style={[styles.cell, on && styles.cellOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={b.name}
                >
                  <BadgeMedal family={b.family} tier={b.tier} glyph={b.glyph} earned size={56} />
                  <Text style={styles.cellName} numberOfLines={2}>{b.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: SPACE[3] },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: RADIUS.card,
    borderWidth: 1, borderColor: C.hairline,
    paddingVertical: SPACE[2], paddingHorizontal: SPACE[3], gap: SPACE[2],
  },
  rankCol: { alignItems: 'center', width: 104 },
  rankName: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 1, marginTop: SPACE[0], textAlign: 'center',
  },
  rankOrder: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 0.2, color: C.dim, textAlign: 'center',
  },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: C.hairline, marginHorizontal: SPACE[1] },
  slots: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  slot: { width: SLOT, height: SLOT, alignItems: 'center', justifyContent: 'center' },
  empty: {
    width: SLOT - 8, height: SLOT - 8, borderRadius: RADIUS.card,
    borderWidth: 1, borderColor: C.dim, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  scrim: { flex: 1, backgroundColor: 'rgba(26,26,26,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.paper, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: SPACE[3], paddingTop: SPACE[3], paddingBottom: SPACE[4], maxHeight: '78%',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontFamily: TYPE.title.family, fontSize: TYPE.title.fontSize, color: C.ink },
  sheetSub: {
    fontFamily: TYPE.label.family, fontSize: TYPE.label.fontSize,
    color: C.inkSoft, marginTop: SPACE[0], marginBottom: SPACE[2],
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[2], paddingBottom: SPACE[3] },
  cell: {
    width: 84, alignItems: 'center', paddingVertical: SPACE[1],
    borderRadius: RADIUS.card, borderWidth: 2, borderColor: 'transparent',
  },
  cellOn: { borderColor: C.HUE, backgroundColor: C.surface },
  cellName: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 0.4, color: C.inkSoft, textAlign: 'center', marginTop: SPACE[0],
  },
});
