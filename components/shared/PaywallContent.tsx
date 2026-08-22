import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Linking, useWindowDimensions,
} from 'react-native';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import PassCard from '@/components/shared/PassCard';
import Button from '@/components/ui/Button';
import { MasteryRow, MetalPlate } from '@/components/profile/Struck';
import { METAL, ramp } from '@/components/shared/tone';
import { BRANCH_SHORT, BRANCH_ICON } from '@/components/shared/branchMarks';
import { Standing, LibraryLine, TheWall, PassTable, Rule } from '@/components/paywall/PassParts';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { awardedRank, rankOrder, rankDegree } from '@/data/ranks';
import { ALL_BRANCHES } from '@/data';
import { C, SPACE, BRANCH, type BranchKey } from '@/constants/design';
import { FALLBACK_PRICE } from '@/constants/subscription';
import { restDaysHeld } from '@/constants/streak';
import { effectiveStreak } from '@/lib/utils/streak';
import { libraryStanding, daysAtFreePace, allowanceLabel } from '@/lib/utils/passValue';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE SCHOLAR'S PASS OFFER.
//
// Rendered BOTH as a full-screen route (app/(app)/paywall.tsx, from Settings)
// and as the slide-up sheet (PaywallSheet, after a lesson and from the daily
// limit). The host supplies what "close" does.
//
// ── WHAT THIS SCREEN ARGUES, AND WHY IT CHANGED ─────────────────────────────
//
// It used to open on the merchandise: a drawn pass card, a headline, and three
// benefit lines. Handsome, and it made a case nobody could check — the reader
// was asked to want an object before being shown anything about their own
// position. Worse, the three lines were an undercount. Five things differ by
// tier and two of the biggest were unmentioned: a free reader cannot REPLAY a
// lesson they have finished, and cannot START a unit out of order. Both were
// being given away for nothing.
//
// So the screen opens on the READER — the rank they have been conferred, the
// lessons they have opened out of the whole library, and the wait in front of
// them measured in real days at the real allowance. Every figure on it comes out
// of `lib/utils/passValue.ts`, which derives them from the constants the gates
// actually read, and `npm run check:pass` re-derives all five claims from the
// functions that enforce them. A line that stops being true fails the build.
//
// The card still appears, and it is still in their name — but LAST, after the
// case, as the object they would be handed rather than the advertisement they
// are being shown.
//
// ── COLOUR ──────────────────────────────────────────────────────────────────
//
// None of its own. Ink and paper, the struck tones from `components/shared/tone`,
// and the six branch hues that `constants/design.ts` licenses as LABELS. The
// ember is deliberately absent: `constants/streak.ts` names the paywall as
// somewhere it may not go, and one colour that means one thing everywhere is
// worth more here than a warm accent.
// ─────────────────────────────────────────────────────────────────────────────

export default function PaywallContent({
  onClose,
  source,
}: {
  onClose: () => void;
  source?: string;
}) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const ready = useSubscriptionStore((s) => s.ready);
  const available = useSubscriptionStore((s) => s.available);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const purchaseMonthly = useSubscriptionStore((s) => s.purchaseMonthly);
  const restore = useSubscriptionStore((s) => s.restore);
  const refresh = useSubscriptionStore((s) => s.refresh);

  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);

  const rank = awardedRank(rankIndex, totalXP);
  const streak = effectiveStreak(
    streakRaw, lastLessonDate, restDaysHeld(restDaysEarned, restDaysUsed),
  );

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4]; // 24 either side
  const contentW = winW - PAD * 2;
  // Never wider than a card wants to be held — beyond ~360 it stops reading as
  // something in the hand.
  const cardW = Math.min(360, contentW);

  // The library, and the wait. One computation, read by two components.
  const lib = useMemo(() => libraryStanding(lessonsByBranch), [lessonsByBranch]);
  const days = daysAtFreePace(lib.left);

  // The six branches at the heights this reader actually stands at. Sorted by
  // progress, exactly as Profile sorts them, so the two screens agree about
  // which branch is "theirs".
  const mastery = useMemo(
    () =>
      ALL_BRANCHES.map((b) => {
        const total = b.paths.reduce((n, u) => n + u.lessons.length, 0);
        const done = Math.max(0, Math.min(total, lessonsByBranch[b.slug] ?? 0));
        return {
          slug: b.slug,
          name: BRANCH_SHORT[b.slug] ?? b.name.toUpperCase(),
          icon: BRANCH_ICON[b.slug] ?? ('frame' as const),
          hue: BRANCH[b.slug as BranchKey] ?? C.ink,
          done,
          total,
        };
      }).sort((a, b) => b.done / (b.total || 1) - a.done / (a.total || 1)),
    [lessonsByBranch],
  );

  // A local const, because TypeScript will not carry a narrowing of an IMPORTED
  // binding into a callback — it cannot know the module has not reassigned it.
  const terms = TERMS_URL;

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    track('paywall_viewed', { available, source });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const price = monthly?.priceString ?? FALLBACK_PRICE;

  const onSubscribe = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    track('subscribe_clicked', { plan: 'scholars_pass', billing: 'monthly', source });
    const outcome = await purchaseMonthly();
    setBusy(false);
    if (outcome === 'success') return; // the success state renders from isPro
    if (outcome === 'cancelled') return; // user backed out — say nothing
    if (outcome === 'unavailable')
      setNotice("Purchases run in the installed Ashmere app — this preview can't complete a real purchase.");
    else setNotice('Something went wrong starting your subscription. Please try again.');
  };

  const onRestore = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    const outcome = await restore();
    setBusy(false);
    if (outcome === 'restored') setNotice('Your Scholar’s Pass has been restored.');
    else if (outcome === 'none') setNotice('No previous purchase found on this account.');
    else if (outcome === 'unavailable') setNotice('Restoring works in the installed Ashmere app only.');
    else setNotice('Could not restore right now. Please try again.');
  };

  // ── Already subscribed ──────────────────────────────────────────────────────
  //
  // The card, unstamped, in their name — the same object the offer closes on, so
  // what they bought is visibly what they were shown. It replaced a hairline
  // circle with a star in it, which was the one screen in the app that thanked
  // somebody with a piece of clip art.
  if (isPro) {
    return (
      <View style={styles.safe}>
        <Header onClose={onClose} />
        <ScrollView contentContainerStyle={[styles.scroll, styles.proScroll]} showsVerticalScrollIndicator={false}>
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 460 }}
          >
            <PassCard
              variant="scholar"
              name={displayName || 'Philosopher'}
              rank={rank.current.name}
              glyph={rank.current.glyph}
              lines={PASS_CARD_LINES}
              order={rankOrder(rank.index)}
              degree={rankDegree(rank.index)}
              width={cardW}
            />
          </MotiView>
          <View style={styles.proPlate}>
            <MetalPlate metal={METAL.GOLD} label="ACTIVE" />
          </View>
          <Text style={styles.thanksTitle}>You’re a Scholar</Text>
          <Text style={styles.thanksBody}>
            Every lesson, every day, with nothing in the way of them. Thank you for
            keeping this project going.
          </Text>
          <Text style={styles.manageNote}>
            Manage or cancel anytime from your App Store / Google Play subscription settings.
          </Text>
          <Button label="Done" onPress={onClose} size="lg" style={styles.proCta} />
        </ScrollView>
      </View>
    );
  }

  // ── The offer ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.safe}>
      <Header onClose={onClose} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1 · WHO IS BEING OFFERED THIS. Their pin, their rank, their streak. */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420 }}
        >
          <Standing
            name={displayName || 'Philosopher'}
            rankIndex={rankIndex}
            totalXP={totalXP}
            streak={streak}
          />
        </MotiView>

        {/* 2 · WHERE THEY STAND AGAINST THE WHOLE LIBRARY, and how long the free
            allowance would take to finish it. This is the argument; everything
            below is detail. */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 420, delay: 140 }}
          style={styles.libBox}
        >
          <LibraryLine lessonsByBranch={lessonsByBranch} />
          <TheWall left={lib.left} days={days} ground={C.paper} />
        </MotiView>

        <Text style={styles.headline}>
          {lib.left > 0 ? 'Stop waiting for tomorrow.' : 'Keep every door open.'}
        </Text>
        <Text style={styles.sub}>
          Free is {allowanceLabel()}, with an advertisement after it. The Pass lifts the
          cap, reopens everything you have finished, and lets you start wherever you like.
        </Text>

        {/* 3 · THE SIX BRANCHES, at the heights they actually stand at. */}
        <Rule label="WHERE YOU ARE" />
        <View style={styles.masteryBox}>
          {mastery.map((m) => (
            <MasteryRow
              key={m.slug}
              name={m.name}
              hue={m.hue}
              done={m.done}
              total={m.total}
              icon={<SketchIcon name={m.icon} size={17} color={ramp(m.hue).shade} />}
            />
          ))}
        </View>

        {/* 4 · THE FIVE DIFFERENCES. */}
        <Rule label="FREE AGAINST THE PASS" />
        <PassTable width={contentW} />

        {/* 5 · THE OBJECT, in their name, after the case rather than before it. */}
        <View style={styles.cardWrap}>
          <PassCard
            variant="scholar"
            name={displayName || 'Philosopher'}
            rank={rank.current.name}
            glyph={rank.current.glyph}
            lines={PASS_CARD_LINES}
            order={rankOrder(rank.index)}
            degree={rankDegree(rank.index)}
            width={cardW}
          />
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.per}> / month</Text>
        </View>
        <Text style={styles.billNote}>Billed monthly · cancel anytime</Text>

        {!available && (
          <View style={styles.previewBanner}>
            <SketchIcon name="warning" color={C.inkSoft} size={16} />
            <Text style={styles.previewText}>
              You’re on the web / Expo Go preview. Real purchases work in the installed app build.
            </Text>
          </View>
        )}

        <Button
          label={busy ? 'One moment…' : `Start — ${price} / mo`}
          onPress={onSubscribe}
          disabled={busy || !ready}
          size="lg"
          style={styles.cta}
        />

        <Pressable onPress={onRestore} disabled={busy} style={styles.restoreBtn} hitSlop={8}>
          <Text style={styles.restoreText}>Restore purchase</Text>
        </Pressable>

        {notice && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </MotiView>
        )}

        <Text style={styles.legal}>
          Payment is charged to your store account at confirmation. The subscription renews monthly
          unless cancelled at least 24 hours before the period ends. Manage or cancel in your store
          account settings.
        </Text>
        <View style={styles.linksRow}>
          {terms ? (
            <>
              <Pressable hitSlop={8} onPress={() => Linking.openURL(terms)}>
                <Text style={styles.link}>Terms</Text>
              </Pressable>
              <Text style={styles.linkDot}>·</Text>
            </>
          ) : null}
          <Pressable hitSlop={8} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ENGRAVED ON THE CARD, so terse — a card states its terms, it does not sell
// them. The selling is `PassTable` above, which derives its rows from the gates.
// Three lines, because the face has room for three at a size that can be read.
const PASS_CARD_LINES = [
  'Every lesson, every day',
  'Reopen anything, start anywhere',
  'No advertisement, ever',
];

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
        <SketchIcon name="close" color={C.ink} size={22} />
      </Pressable>
    </View>
  );
}

// The price is the loudest thing on this screen by design, so the type here runs
// past `TYPE`'s five-step scale. Colour does not: see the file header.
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 52, justifyContent: 'center', paddingHorizontal: SPACE[3] },
  closeBtn: { width: 34, height: 34, alignItems: 'flex-start', justifyContent: 'center' },
  scroll: { paddingHorizontal: SPACE[4], paddingBottom: SPACE[5] + SPACE[2] },
  proScroll: { alignItems: 'center', paddingTop: SPACE[4] },
  proCta: { alignSelf: 'stretch', marginTop: SPACE[4] },

  libBox: { marginTop: SPACE[4] },

  headline: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 27,
    lineHeight: 33,
    color: C.ink,
    marginTop: SPACE[4],
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14.5,
    lineHeight: 21,
    color: C.inkSoft,
    marginTop: SPACE[2],
  },

  masteryBox: { gap: SPACE[2], marginTop: SPACE[3] },

  cardWrap: { marginTop: SPACE[5], alignItems: 'center' },

  priceRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: SPACE[4],
  },
  price: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: C.ink },
  per: { fontFamily: 'Inter_500Medium', fontSize: 16, color: C.inkSoft },
  billNote: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: C.inkSoft, textAlign: 'center', marginTop: 4,
  },

  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[2],
    backgroundColor: C.surfaceSoft,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: 4,
    padding: SPACE[2],
    marginTop: SPACE[3],
  },
  previewText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12.5, color: C.inkSoft, lineHeight: 18 },

  cta: { marginTop: SPACE[3] },

  restoreBtn: { alignItems: 'center', paddingVertical: SPACE[2] },
  restoreText: {
    fontFamily: 'Inter_500Medium', fontSize: 14, color: C.inkSoft, textDecorationLine: 'underline',
  },

  notice: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: 4,
    padding: SPACE[2],
    marginTop: 4,
  },
  noticeText: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: C.ink, lineHeight: 19, textAlign: 'center',
  },

  legal: {
    fontFamily: 'Inter_400Regular', fontSize: 11, color: C.inkSoft, lineHeight: 16,
    marginTop: SPACE[4], textAlign: 'center',
  },
  linksRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACE[1],
    marginTop: SPACE[2],
  },
  link: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.ink, textDecorationLine: 'underline' },
  linkDot: { color: C.inkSoft },

  proPlate: { marginTop: SPACE[3] },
  thanksTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: C.ink, textAlign: 'center',
    marginTop: SPACE[3],
  },
  thanksBody: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: C.inkSoft, lineHeight: 22,
    textAlign: 'center', marginTop: SPACE[2],
  },
  manageNote: {
    fontFamily: 'Inter_400Regular', fontSize: 12.5, color: C.inkSoft, lineHeight: 18,
    textAlign: 'center', marginTop: SPACE[3],
  },
});
