import { useCallback, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useWindowDimensions, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import ScreenTransition from '@/components/shared/ScreenTransition';
import RankSeal from '@/components/shared/RankSeal';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import { METAL, MID, INK, mix, PAPER_SHADE } from '@/components/shared/tone';
import Certificate, { ScheduleHead, ScheduleRow } from '@/components/paywall/Certificate';
import PassHerald from '@/components/paywall/PassHerald';
import { LibraryLine, TheWall } from '@/components/paywall/PassParts';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { awardedRank, rankOrder, rankDegree } from '@/data/ranks';
import { C, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import {
  PASS_LINES, includedLines, libraryStanding, daysAtFreePace, longFree, longPass,
} from '@/lib/utils/passValue';
import { quipFor } from '@/lib/utils/passQuips';
import { useTodayKey } from '@/lib/utils/useTodayKey';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB.
//
// A tab of its own, between Insights and Profile — the shape Duolingo and
// Brilliant both use, and the reasoning behind it is not imitation: a paywall
// that only ever appears when a reader is BLOCKED is an ambush, and one that
// lives at a permanent address is a shop. A reader can walk in, read the terms
// at their own pace, and walk out, which is the difference between being sold to
// and being offered something.
//
// ── WHAT IS ON IT, TOP TO BOTTOM ────────────────────────────────────────────
//
// The herald, standing on the certificate's own top edge and being rude about
// it. Then the SCHOLAR'S PASS certificate, carrying everything: the five things
// the Pass adds, struck and recessed and railed in gold, and under them the six
// things every reader already has, flat. Then — below it, and deliberately
// second — the reader's CURRENT certificate, which says what the free tier
// actually gives them, in the same object, in paper instead of gold.
//
// The order is the brief's and it is also the right one. The thing being offered
// goes first because that is what the tab is for; the thing they hold goes
// second because it is the comparison, and a comparison read before the offer is
// just a list.
//
// ── EVERY LINE ON BOTH CERTIFICATES IS DERIVED ──────────────────────────────
//
// §14's rule, and this screen is the reason it exists: the paywall once carried
// three hand-typed benefits, two of the five real ones were missing, and nobody
// noticed for months. `PASS_LINES` holds the differences and `includedLines()`
// counts the library, the thinkers, the quotes, the ranks and the badges out of
// the tree. `npm run check:pass` re-derives all of it from the gates that
// enforce it, so a claim that stops being true fails the build.
//
// NOTHING HERE MAY BE TYPED AS A NUMBER — not on the certificates and not in the
// herald's lines. CLAUDE.md was still saying 132 saveable quotes when the real
// figure was 228.
// ─────────────────────────────────────────────────────────────────────────────

export default function PassTab() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const available = useSubscriptionStore((s) => s.available);
  const monthly = useSubscriptionStore((s) => s.monthly);

  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4];
  const contentW = winW - PAD * 2;

  // THE RANK THEY HAVE BEEN CONFERRED, not what the XP alone would buy.
  // `userDataStore.rankIndex` advances at most one tier per finished lesson so a
  // rank-up always lands on the reward screen (§7), and every other surface draws
  // the awarded one — a certificate showing a different rank from the Profile
  // would be the app disagreeing with itself in the reader's own name.
  const rank = awardedRank(rankIndex, totalXP);
  const lib = useMemo(() => libraryStanding(lessonsByBranch), [lessonsByBranch]);
  const days = daysAtFreePace(lib.left);

  // ── WHICH LINE HE SAYS ────────────────────────────────────────────────────
  //
  // Keyed on the local day and the tier, so it holds still for the whole day —
  // the rule streakMood states and this screen needs even more than the streak
  // tab does. A line that re-rolled per visit would change under a reader who
  // was part-way through reading it, on the one screen in the app where they are
  // being asked to decide something.
  const today = useTodayKey();
  const quip = useMemo(() => quipFor(isPro, today), [isPro, today]);

  // The localized string from the store when there is one, and the fallback on
  // web, in Expo Go and before RevenueCat answers. `SubPackage` carries a numeric
  // `price` too — that one is for analytics, which cannot add labels up — and the
  // UI must keep using the string.
  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const period = BILLING_PERIOD_LABEL;

  // A local const: TypeScript will not carry a narrowing of an IMPORTED binding
  // into a callback, because it cannot know the module has not reassigned it.
  const terms = TERMS_URL;
  const privacy = PRIVACY_URL;

  // A REF, NOT STATE. This flag exists only to fire one analytics event once per
  // visit to the app — nothing on screen depends on it — and as state it caused a
  // full re-render of this whole tree (two engraved certificates, the herald, the
  // eleven ruled rows) on the frame the reader arrives, which is the frame they
  // are least able to spare. A ref remembers just as well and renders nothing.
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (seen.current) return;
      seen.current = true;
      track('paywall_viewed', { available, source: 'pass_tab' });
    }, [available]),
  );

  const included = useMemo(() => includedLines(), []);

  return (
    <ScreenTransition bg={C.paper}>
      <SafeAreaView style={st.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[st.body, { paddingHorizontal: PAD }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── the masthead ───────────────────────────────────────────────── */}
          <Text style={st.kicker}>THE OFFER</Text>
          <Text style={st.h1}>Scholar’s Pass</Text>

          {/* ── the herald, standing on the certificate's top edge ─────────── */}
          <PassHerald quip={quip} width={contentW} delay={220} />

          {/* ── THE SCHOLAR'S PASS ─────────────────────────────────────────── */}
          <Certificate
            variant="scholar"
            width={contentW}
            title="THE SCHOLAR’S PASS"
            motto="Admits the bearer to the whole library, without limit"
            holder={displayName || 'Philosopher'}
            holderNote={`${rank.current.name} · ${totalXP.toLocaleString()} XP`}
            seal={
              <RankSeal
                glyph={rank.current.glyph}
                state="current"
                size={46}
                order={rankOrder(rank.index)}
                degree={rankDegree(rank.index)}
              />
            }
            flag={
              isPro ? (
                <MetalPlate metal={METAL.GOLD} label="ACTIVE" />
              ) : null
            }
            footer={
              isPro ? (
                <Text style={st.footNote}>
                  Yours already. Manage or cancel it any time from Settings.
                </Text>
              ) : (
                <View style={st.buy}>
                  <View style={st.priceRow}>
                    <Text style={st.price}>{price}</Text>
                    <Text style={st.per}>/ {period}</Text>
                  </View>
                  <Text style={st.footNote}>Cancel any time. No advertisements, ever.</Text>
                </View>
              )
            }
          >
            {/* THE FIVE THINGS BEING BOUGHT, and they come first inside the
                certificate for the same reason the certificate comes first on the
                page: this is what the reader is deciding about. */}
            <ScheduleHead label="WHAT THE PASS ADDS" tint={mix(METAL.GOLD.base, INK, 0.34)} />
            {PASS_LINES.map((l, i) => (
              <ScheduleRow
                key={l.id}
                grade="granted"
                label={l.label}
                detail={longPass(l)}
                last={i === PASS_LINES.length - 1}
              />
            ))}

            {/* AND EVERYTHING THEY ALREADY HAVE, said plainly. A subscription
                screen that lists only what is missing reads as a list of things
                being withheld; this is the half that says the app is not holding
                the library hostage, only the pace. */}
            <ScheduleHead label="AND EVERYTHING BELOW, AS ALWAYS" />
            {included.map((l, i) => (
              <ScheduleRow
                key={l.id}
                grade="included"
                label={l.label}
                detail={l.detail}
                last={i === included.length - 1}
              />
            ))}
          </Certificate>

          {!isPro ? <SubscribeBar /> : null}

          {/* ── the wall, between the two certificates ─────────────────────── */}
          {!isPro && lib.left > 0 ? (
            <View style={st.wallBox}>
              <LibraryLine lessonsByBranch={lessonsByBranch} />
              <View style={{ height: SPACE[3] }} />
              <TheWall left={lib.left} days={days} ground={C.paper} />
            </View>
          ) : null}

          {/* ── WHAT THEY HOLD TODAY ───────────────────────────────────────── */}
          <View style={st.divider}>
            <View style={st.divRule} />
            <Text style={st.divLabel}>WHAT YOU HOLD TODAY</Text>
            <View style={st.divRule} />
          </View>

          <Certificate
            variant="free"
            width={contentW}
            title="THE DAY PASS"
            motto="Free, for as long as you like — one sitting at a time"
            holder={displayName || 'Philosopher'}
            holderNote={isPro ? 'Superseded by your Scholar’s Pass' : 'Your current tier'}
            seal={
              <RankSeal
                glyph={rank.current.glyph}
                state="current"
                size={40}
                order={null}
                degree={0}
              />
            }
          >
            <ScheduleHead label="INCLUDED, IN FULL" />
            {included.map((l, i) => (
              <ScheduleRow
                key={l.id}
                grade="included"
                label={l.label}
                detail={l.detail}
                last={i === included.length - 1}
              />
            ))}

            {/* THE SAME FIVE ROWS, SHOWING THE FREE SIDE. Not a second list of
                features — the identical schedule with the other column's values,
                which is what makes the two certificates comparable at a glance
                rather than two unrelated brochures. */}
            <ScheduleHead label="WHERE IT STOPS" />
            {PASS_LINES.map((l, i) => (
              <ScheduleRow
                key={l.id}
                grade="limit"
                label={l.label}
                detail={longFree(l)}
                last={i === PASS_LINES.length - 1}
              />
            ))}
          </Certificate>

          <Text style={st.legal}>
            The Scholar’s Pass renews every {period} until cancelled.{' '}
            <Text style={st.link} onPress={() => terms && Linking.openURL(terms)}>Terms</Text>
            {'  ·  '}
            <Text style={st.link} onPress={() => privacy && Linking.openURL(privacy)}>Privacy</Text>
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

/**
 * THE BUY BAR, and it is deliberately not a sticky one.
 *
 * A pinned button would cover the bottom of a certificate the reader is being
 * asked to read, and the tab bar is already 70pt of that edge. It sits directly
 * under the offer instead, which is where somebody who has just read it is
 * looking.
 *
 * THE PURCHASE IS NOT RUN FROM HERE. It goes through the paywall route, which
 * owns the busy state, the failure notices and the restore path — three things
 * that would otherwise have two implementations able to disagree about whether
 * somebody had just been charged.
 *
 * WHICH IS ALSO WHY IT IS NOT GATED ON `available`. The obvious version hid the
 * button when the store had not answered, and that produces the worst possible
 * screen: a certificate with a price printed on it and no way to act on it, and
 * no explanation either. The paywall route already handles an unavailable store
 * properly, with a notice and a restore path. A shop window should always open
 * the door; whether there is anything behind it is the till's problem.
 */
function SubscribeBar() {
  return (
    <View style={st.subBar}>
      <Button
        label="Take the Scholar’s Pass"
        size="lg"
        icon="star"
        onPress={() => {
          track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source: 'pass_tab' });
          router.push('/(app)/paywall');
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  body: { paddingTop: SPACE[3], paddingBottom: SPACE[5] * 2, gap: SPACE[3] },

  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 2, color: MID,
  },
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: C.ink,
    marginTop: -2, marginBottom: SPACE[1], includeFontPadding: false,
  },

  buy: { alignItems: 'center', gap: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: C.ink, includeFontPadding: false },
  per: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: MID },
  footNote: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 16, color: MID,
    textAlign: 'center',
  },

  subBar: { marginTop: SPACE[1] },
  wallBox: { marginTop: SPACE[2] },

  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[4] },
  divRule: { flex: 1, height: 1, backgroundColor: mix(PAPER_SHADE, C.paper, 0.3) },
  divLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: MID },

  legal: {
    fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16, color: MID,
    textAlign: 'center', marginTop: SPACE[3],
  },
  link: { fontFamily: 'Inter_500Medium', color: C.ink, textDecorationLine: 'underline' },
});
