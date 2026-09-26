import { memo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RankSeal from '@/components/shared/RankSeal';
import Meter from '@/components/ui/Meter';
import { MetalPlate } from '@/components/profile/Struck';
import {
  RANKS, rankProgress, rankOrder, rankDegree, rankInsignia,
} from '@/data/ranks';
import { circleForRank, RANK_EPITHETS } from '@/data/rankLore';
import {
  INK, MID, PAPER_LIT, FLAT_FACE, FLAT_EDGE, FLOOR, FLOOR_CUT, PATINA, mix,
} from '@/components/shared/tone';
import { LINE } from '@/components/shared/drawn';

// ─────────────────────────────────────────────────────────────────────────────
// THE RANK YOU HOLD AND THE ONE YOU ARE CLIMBING TO — one object, two screens.
//
// Profile's PROGRESS TO NEXT RANK and the Ranks & Badges sheet's hero were two
// hand-built copies of the same three facts (the pin you hold, how far through
// its band you are, the pin that comes next), in two different looks: a flat ink
// bar on one, an outlined box and a hairline bar on the other. The owner asked for
// the section to be redesigned and for the sheet to go with it, so there is one
// header now and both draw it.
//
// It is built the way the app's drawn objects are (components/shared/drawn.tsx):
//
//   · THE PIN YOU HOLD stands on a small display stand — a thing you earned is an
//     object you keep on a shelf, which is what a trophy is;
//   · THE PIN YOU ARE CLIMBING TO waits in a SOCKET cut into the card, locked, so
//     the reader can see the shape of the thing they have not got yet — and where
//     it will go;
//   · THE BAR is the app's one chunky Meter, struck in the rank's own METAL, so an
//     iron rank climbs in iron and a jade one in jade.
//
// The words say each fact once. "N XP TO <NEXT>" lives here, so the climb chart
// under it is drawn with its legend off (RankClimbChart `legend={false}`).
// ─────────────────────────────────────────────────────────────────────────────

export default memo(function RankHeader({ rankIndex, totalXP }: { rankIndex: number; totalXP: number }) {
  const { current, next, index, pending, pct, toNext, inBand, bandSize } = rankProgress(rankIndex, totalXP);
  const metal = rankInsignia(index);
  const circle = circleForRank(current.id);
  const epithet = RANK_EPITHETS[current.id];

  // THE NAME IS SIZED TO THE ROOM IT ACTUALLY GETS. Between the pin and the
  // socket the middle column is ~150pt on a 390 phone and ~90 on a 320 one, where
  // a fixed 25pt "Questioner" came out "Quest…". `adjustsFontSizeToFit` does
  // nothing on the web, so it is arithmetic: Playfair Bold runs about 0.56 of an
  // em a character. The kicker drops its circle when the column is narrow.
  const [midW, setMidW] = useState(0);
  const nameFs = midW > 0 ? Math.max(17, Math.min(25, (midW - 4) / (current.name.length * 0.56))) : 25;
  const roomy = midW === 0 || midW >= 150;

  return (
    <View>
      <View style={styles.top}>
        <View style={styles.stand}>
          <RankSeal
            glyph={current.glyph}
            state="current"
            size={64}
            order={rankOrder(index)}
            degree={rankDegree(index)}
          />
          <View style={styles.standTop} />
          <View style={styles.standFoot} />
        </View>

        <View style={styles.mid} onLayout={(e) => setMidW(e.nativeEvent.layout.width)}>
          <Text style={styles.kicker} numberOfLines={1}>
            RANK {current.id} OF {RANKS.length}
            {roomy ? ` · ${circle.name.replace(/^The /, '').replace(/ Circle$/, '').toUpperCase()}` : ''}
          </Text>
          {/* Two lines as a last resort, for the longest names on the narrowest
              phone, rather than an ellipsis where the rank's name goes. */}
          <Text style={[styles.name, { fontSize: nameFs, lineHeight: nameFs * 1.2 }]} numberOfLines={2}>
            {current.name}
          </Text>
          {epithet ? <Text style={styles.epithet} numberOfLines={2}>{epithet}</Text> : null}
        </View>

        {next ? (
          <View style={styles.socket}>
            <RankSeal
              glyph={next.glyph}
              state="locked"
              size={40}
              order={rankOrder(index + 1)}
              degree={rankDegree(index + 1)}
            />
            <Text style={styles.socketWord}>NEXT</Text>
          </View>
        ) : (
          <View style={styles.socket}>
            <MetalPlate metal={PATINA} label="TOP" />
          </View>
        )}
      </View>

      <Meter pct={next ? pct : 1} color={metal.base} height={14} style={styles.meter} />

      <View style={styles.foot}>
        <Text style={styles.xp}>
          {next ? `${inBand.toLocaleString()} / ${bandSize.toLocaleString()} XP` : `${totalXP.toLocaleString()} XP`}
        </Text>
        <Text style={styles.toGo} numberOfLines={1}>
          {pending
            ? `FINISH A LESSON TO REACH ${(next?.name ?? '').toUpperCase()}`
            : next
              ? `${toNext.toLocaleString()} XP TO ${next.name.toUpperCase()}`
              : 'HIGHEST RANK ACHIEVED'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // A display stand: the pin sits on a raised top with a foot under it.
  stand: { width: 70, alignItems: 'center' },
  standTop: {
    marginTop: -4, width: 54, height: 9, borderRadius: 3,
    backgroundColor: FLAT_FACE, borderWidth: LINE * 0.8, borderColor: INK,
  },
  standFoot: {
    width: 40, height: 6, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
    backgroundColor: FLAT_EDGE, borderWidth: LINE * 0.8, borderTopWidth: 0, borderColor: INK,
    boxShadow: `0px 2px 0px ${mix(FLAT_EDGE, INK, 0.25)}`,
  },

  mid: { flex: 1, minWidth: 0 },
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: MID,
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25, lineHeight: 30, color: INK, marginTop: 2,
  },
  epithet: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, lineHeight: 17, color: MID, marginTop: 1,
  },

  // The next pin's socket: a cut-in well, dark along its top edge where the
  // light cannot reach, the same construction as the app's selected-chip floor.
  socket: {
    width: 62, paddingTop: 7, paddingBottom: 5, alignItems: 'center', borderRadius: 14,
    backgroundColor: FLOOR, borderTopWidth: 2, borderTopColor: FLOOR_CUT,
    borderBottomWidth: 1.5, borderBottomColor: PAPER_LIT,
  },
  socketWord: {
    marginTop: 3, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5, color: MID,
  },

  meter: { marginTop: 14 },
  foot: { marginTop: 7, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  xp: {
    fontFamily: 'Inter_700Bold', fontSize: 13, color: INK,
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
  toGo: {
    flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: MID,
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
});
