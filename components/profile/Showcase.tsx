import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import BadgeMedal from '@/components/shared/BadgeMedal';
import RankSeal from '@/components/shared/RankSeal';
import SketchIcon from '@/components/shared/SketchIcon';
import Card from '@/components/ui/Card';
import { StruckNiche } from '@/components/profile/Struck';
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
// ── IT WAS ONE ROW, AND THE MEDALS HAD NO NAMES ────────────────────────────
//
// A reader, on the version this replaces: "make the showcase more pretty, have
// some depth, also I want to be able to read the different names of the badges
// that are listed on there."
//
// The second half is the one that decided the layout. The strip put the rank in
// a 104pt column and the three medals in what was left, which is about 70pt
// each — no room for a caption, so there were none. Three unlabelled marks is a
// case of curiosities: the reader knows they earned something and cannot say
// what, and a badge nobody can name is not a thing anybody displays. Names need
// room, so the row became two: the rank across the top, the medals across the
// bottom at ~100pt each, which carries a 26-character badge name over two lines
// with margin.
//
// The old header argued for a single strip on the grounds that Profile is
// already "a bombardment of information". That is still true and it is why the
// SECOND row carries no numbers, no progress and no dates — three medals and
// three names. A cabinet is not a readout.
//
// ── DEPTH, IN THE VOCABULARY THE SCREEN ALREADY HAS ────────────────────────
//
// Three layers, none of them invented here:
//
//   THE CARD  is a `Card` with `onPress`, so it grows the same 2px lip every
//             pressable surface in this app has. It was a hand-rolled View with
//             a hairline border — the one arrangement that says "document".
//   THE SOCKET is `StruckNiche`, the inverse of the `StruckTile` this screen is
//             already built out of: the same gradient run the other way, dark
//             along the top edge where light cannot reach into a cut. A medal
//             sitting in one reads as an object placed in a socket rather than
//             as a picture printed on a card.
//   THE MARKS  were already struck — §19 gave every pin and medal a lit side, a
//             shaded side and a drop shadow. They just had nothing to sit in.
//
// The rank pin is NOT one of the three. It is not chosen and cannot be
// unchosen, so putting it among three slots the reader controls would suggest it
// could be swapped out. It sits on its own line above them, with a rule between:
// the thing you were given, then the things you picked.
//
// ── AN EMPTY SLOT IS A SLOT, NOT A GAP ────────────────────────────────────
//
// A reader with no badges chosen sees three dashed sockets carrying a pencil,
// because an empty strip that renders as blank paper reads as a broken row
// rather than as an invitation. The socket occupies the same box a filled one
// does, and the caption below reserves its two lines either way, so nothing
// shifts when one is filled.
// ─────────────────────────────────────────────────────────────────────────────

const SLOT = 52;
/** The socket the medal sits in — big enough to hold the medal's own shadow. */
const NICHE = SLOT + 16;
/** Two lines of `micro`, reserved whether or not there is a name to put in it. */
const NAME_H = TYPE.micro.lineHeight * 2;

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
      <Card
        onPress={() => setPicking(true)}
        pad={3}
        accessibilityLabel="Edit the badges shown on your profile"
      >
        {/* ── what you were GIVEN ──────────────────────────────────────────── */}
        <View style={styles.rankRow}>
          <RankSeal
            glyph={rank.glyph}
            state="current"
            size={64}
            order={rankOrder(rankIndex)}
            degree={rankDegree(rankIndex)}
          />
          <View style={styles.rankText}>
            <Text style={[styles.rankName, { color: ins.base }]} numberOfLines={1}>
              {rank.name}
            </Text>
            {/* THE ORDER AND THE RUNG, not the Circle's subtitle — "LAPIS · THE
                REAL" measured wider than the old 96pt column and rendered as
                "LAPIS · THE R…", which is a label that has stopped being one.
                The position on the ladder is the more useful half anyway: the
                colour and the SHAPE already say which order this is. */}
            <Text style={styles.rankOrder} numberOfLines={1}>
              RANK {rank.id} OF {RANKS.length} · {ORDER_LABEL[rankOrder(rankIndex)].toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* ── and what you CHOSE ───────────────────────────────────────────── */}
        <View style={styles.cabinetHead}>
          <Text style={styles.cabinetLabel}>YOUR CABINET</Text>
          <View style={styles.editRow}>
            <Text style={styles.editText}>EDIT</Text>
            <SketchIcon name="pencil" size={12} color={C.inkSoft} />
          </View>
        </View>

        <View style={styles.slots}>
          {Array.from({ length: SHOWCASE_MAX }).map((_, i) => {
            const b = chosen[i];
            return (
              <View key={i} style={styles.slot}>
                <StruckNiche style={styles.niche} empty={!b}>
                  {b ? (
                    <BadgeMedal family={b.family} tier={b.tier} glyph={b.glyph} earned size={SLOT} />
                  ) : (
                    <SketchIcon name="pencil" size={16} color={C.dim} />
                  )}
                </StruckNiche>
                {/* THE NAME, which is the whole point of the rewrite. Two lines
                    are reserved either way — a caption that appears only when a
                    slot is filled makes the row change height as the reader
                    picks, and a cabinet that jumps is not one. */}
                <Text
                  style={[styles.slotName, !b && styles.slotNameEmpty]}
                  numberOfLines={2}
                >
                  {b ? b.name : 'Empty'}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

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
                  {/* THE SAME SOCKET the cabinet uses, so a medal is picked out
                      of one and put into another rather than moving between two
                      different kinds of surface. */}
                  <StruckNiche style={styles.cellNiche}>
                    <BadgeMedal family={b.family} tier={b.tier} glyph={b.glyph} earned size={52} />
                  </StruckNiche>
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

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  rankText: { flex: 1 },
  // The rank's own name in Playfair rather than in a caps micro label: it is a
  // TITLE the reader holds, and the old strip printed it as a caption because a
  // 104pt column could not carry anything larger.
  rankName: {
    fontFamily: TYPE.title.family, fontSize: TYPE.label.fontSize,
    includeFontPadding: false,
  },
  rankOrder: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 1.2, color: C.dim, marginTop: SPACE[0],
  },

  rule: { height: 1, backgroundColor: C.hairline, marginVertical: SPACE[2] },

  cabinetHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACE[1],
  },
  cabinetLabel: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 2, color: C.inkSoft,
  },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[0] },
  editText: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 1.6, color: C.inkSoft,
  },

  slots: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACE[1] },
  slot: { flex: 1, alignItems: 'center' },
  niche: { width: NICHE, height: NICHE },
  slotName: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    lineHeight: TYPE.micro.lineHeight, letterSpacing: 0.2,
    color: C.ink, textAlign: 'center',
    marginTop: SPACE[1], height: NAME_H,
  },
  slotNameEmpty: { color: C.dim },

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
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    gap: SPACE[2], paddingBottom: SPACE[3],
  },
  // THREE UP, NOT FOUR. At four columns a cell is 84pt and the names truncated —
  // "The Commonpla…", "Every Line Worth …" — which is the same complaint the
  // cabinet itself was rewritten for, one screen further in. Three columns give
  // ~114pt, which carries the longest name in the roll (24 characters) over two
  // lines with room to spare.
  cell: {
    width: '31%', alignItems: 'center', paddingVertical: SPACE[1],
    borderRadius: RADIUS.card, borderWidth: 2, borderColor: 'transparent',
  },
  cellNiche: { width: 68, height: 68 },
  cellOn: { borderColor: C.HUE, backgroundColor: C.surface },
  cellName: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 0.4, color: C.inkSoft, textAlign: 'center', marginTop: SPACE[0],
  },
});
