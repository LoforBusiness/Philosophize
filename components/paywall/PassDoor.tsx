import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import { INK, MID, PATINA, TEAL, EMBER, EMBER_INK, DEEP, PAPER, TINT, TINT_EDGE, mix } from '@/components/shared/tone';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { C, RADIUS, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { trialLengthPhrase, trialDays } from '@/lib/utils/trial';
import type { TrialPeriod } from '@/lib/purchases/types';
import {
  conversionTerms, REMINDER_PROMISE, SKIP_TRIAL_HEADING, skipTrialLabel, skipTrialTerms,
  startNotice, startTrialLabel,
} from '@/lib/utils/trialTerms';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOOR UNDER THE CHART, ON THE PASS TAB, IN SETTINGS AND ON THE PAYWALL.
//
//   "when a user is using the free version ... they are offered the free trial,
//    the three day free trial ... instead of just this pay six ninety nine."
//
// Two states, for a reader who does not hold the Pass. Which one they see is the
// store's answer, never this component's guess:
//
//   · GOOGLE PLAY OFFERS THEM A TRIAL (`canStartTrial()`): the trial is the
//     button. Straight under it, large, the promise that they will be reminded a
//     day before it ends. Under that, small, every term Google's policy asks for,
//     the automatic Scholar's Pass among them. All of it comes from
//     `lib/utils/trialTerms.ts`.
//
//     AND UNDER ALL OF THAT, A SMALLER BOX: pay today, no free days.
//
//       "below this I also want in a smaller box the option to just straight
//        subscribe for the 6.99 a month and skipping the free trial"
//
//     It is a second PURCHASE, not a second label. `purchasePackage` buys
//     RevenueCat's `defaultOption`, and Google hands a trial-eligible reader the
//     trial offer as their default — so a button pointed at the same call would
//     start the very trial it claims to skip. It goes through `subscribeNow`,
//     which buys the base plan by option (see lib/purchases/basePlan.ts), and it
//     is drawn only while the store has named such an option.
//   · NO TRIAL ON OFFER (they have had one, or it is not configured): the price
//     and the button, which buys the Pass here and now. Promising free days the
//     store will not give is the one thing this door may never do.
//
// ONE DOOR EVERYWHERE, since the hard paywall (2026-09-25). The no-trial button
// used to push the old paywall route, which ran its own copy of the purchase;
// the paywall IS this door now (`HardPaywall`), so the purchase runs here and
// there is exactly one path that charges anybody.
//
// A reader who HOLDS the Pass, on the trial or paid, gets nothing from this
// component. The screen shows `TrialStatus` or the ACTIVE plate instead.
//
// THE TRIAL IS STARTED THROUGH THE STORE, which raises the conferral itself, so
// no screen raises its own ceremony (check-pass §9e).
// ─────────────────────────────────────────────────────────────────────────────

/** Where the door is. The paywall's own sources name why it was raised. */
export type DoorSource = 'pass_tab' | 'settings' | 'intro' | 'locked_lesson' | 'locked_review' | 'route';

export default function PassDoor({ source, compact = false }: {
  source: DoorSource;
  /**
   * SHORTER LABELS, for Settings' narrow card. At about 225pt "Start your 3-day
   * free trial" broke onto two lines with "trial" alone on the second. The plate
   * above the button already says how long the trial is, so the button does not
   * have to.
   */
  compact?: boolean;
}) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const canTrial = useSubscriptionStore((s) => s.canStartTrial());
  const trial = useSubscriptionStore((s) => s.monthly?.trial ?? null);
  const monthly = useSubscriptionStore((s) => s.monthly);
  const startTrial = useSubscriptionStore((s) => s.startTrial);
  // THE STORE DECIDES WHETHER THE SECOND DOOR EXISTS, exactly as it decides
  // whether the first one does. Null here means Google named no option that
  // charges today, and the box is not drawn — a charge-now button that fell back
  // to starting a trial would be the §14 lie in its most expensive form.
  const basePlan = useSubscriptionStore((s) => s.monthly?.basePlan ?? null);
  const subscribeNow = useSubscriptionStore((s) => s.subscribeNow);
  const purchaseMonthly = useSubscriptionStore((s) => s.purchaseMonthly);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Its OWN busy flag and its own notice. Sharing them would grey out the trial
  // button while this sheet is open and print this sheet's failure under that
  // one, which is the wrong button to blame.
  const [paying, setPaying] = useState(false);
  const [payNotice, setPayNotice] = useState<string | null>(null);

  // Offered once per mount, and only while there is a trial to offer.
  const offered = useRef(false);
  useEffect(() => {
    if (!canTrial || offered.current) return;
    offered.current = true;
    track('trial_offered', { source });
  }, [canTrial, source]);

  // The store's localized string, and the shared fallback on web, in Expo Go and
  // before RevenueCat answers. Never a typed price.
  const price = monthly?.priceString ?? FALLBACK_PRICE;
  const period = BILLING_PERIOD_LABEL;

  // NO TRIAL ON OFFER: the price, and the purchase, run from here. It shares
  // `paying` with the charge-today box because only one of the two is ever drawn.
  const subscribe = async () => {
    if (paying) return;
    setPayNotice(null);
    track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source });
    setPaying(true);
    const outcome = await purchaseMonthly(source);
    setPaying(false);
    setPayNotice(
      outcome === 'unavailable' ? 'Purchases run in the installed Ashmere app.'
      : outcome === 'error' ? 'Something went wrong starting your subscription. Please try again.'
      : null,
    );
  };

  // Google's sheet opens over this screen. A sheet the reader closes says
  // nothing; one that fails says so here, next to the button that opened it.
  const begin = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    const outcome = await startTrial(source);
    setBusy(false);
    setNotice(startNotice(outcome));
  };

  // PAY TODAY. The conferral is raised by the store, like every other purchase
  // in this app, so this handler owns only the sheet's busy state and its notice.
  const payNow = async () => {
    if (paying) return;
    setPayNotice(null);
    track('subscribe_clicked', {
      plan: 'monthly', billing: 'monthly', source, skipped_trial: true,
    });
    setPaying(true);
    const outcome = await subscribeNow(source);
    setPaying(false);
    setPayNotice(startNotice(outcome));
  };

  if (isPro) return null;

  if (canTrial && trial) {
    return (
      <View style={st.door}>
        {compact ? (
          <MetalPlate
            metal={PATINA}
            label={`${trialLengthPhrase(trial).toUpperCase()} FREE`}
            style={st.plate}
          />
        ) : (
          <TrialTimeline trial={trial} price={price} period={period} />
        )}
        <Button
          label={busy ? 'One moment…' : startTrialLabel(trial, compact)}
          size="lg"
          disabled={busy}
          onPress={() => void begin()}
        />
        <Text style={st.promise}>{REMINDER_PROMISE}</Text>
        <Text style={st.fine}>{conversionTerms(trial, price, period)}</Text>
        {notice ? <Text style={st.notice}>{notice}</Text> : null}
        {/* THE OTHER DOOR, and only when the store has one to offer. A flat
            panel with an edge rather than a raised face: the depth kit's rule is
            that a ledge means "press me", and there is already one thing to
            press above this. It must not compete with the trial. */}
        {basePlan ? (
          <View style={st.skip}>
            <Text style={st.skipHead}>{SKIP_TRIAL_HEADING}</Text>
            <Text style={st.fine}>{skipTrialTerms(basePlan.priceString, period)}</Text>
            <Button
              label={paying ? 'One moment…' : skipTrialLabel(compact)}
              size="md"
              variant="secondary"
              disabled={paying}
              onPress={() => void payNow()}
            />
            {payNotice ? <Text style={st.notice}>{payNotice}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={st.door}>
      <Text style={st.priceLine}>
        <Text style={st.price}>{price}</Text>
        {` a ${period} · Cancel any time`}
      </Text>
      <Button
        label={paying ? 'One moment…' : compact ? 'Get the Pass' : 'Get the Scholar’s Pass'}
        size="lg"
        disabled={paying}
        onPress={() => void subscribe()}
      />
      {payNotice ? <Text style={st.notice}>{payNotice}</Text> : null}
    </View>
  );
}

/**
 * THE TRIAL AS THREE STOPS (2026-10-01): today, the reminder, the day it becomes
 * a Pass. The terms under the button say all of this in a sentence; this says it
 * as a road the reader can take in at a glance, which is how the clearest trial
 * screens in the category draw it (Blinkist's "how your trial works"). Every stop
 * is computed from the trial Google offers — its length, and so the reminder a
 * day before the end — and from the store's price. Nothing is typed.
 */
function TrialTimeline({ trial, price, period }: { trial: TrialPeriod; price: string; period: string }) {
  const days = trialDays(trial);
  const inDays = (n: number) => (n <= 0 ? 'TODAY' : n === 1 ? 'TOMORROW' : `IN ${n} DAYS`);
  const stops: { when: string; what: string; icon: SketchIconName; tone: string }[] = [
    { when: 'TODAY', what: 'Every lesson opens, free', icon: 'book', tone: TEAL },
    { when: inDays(days - 1), what: 'We remind you the trial is ending', icon: 'bell', tone: EMBER },
    { when: inDays(days), what: `It becomes a Scholar’s Pass at ${price} a ${period}, unless you cancel`, icon: 'pass', tone: DEEP },
  ];
  return (
    <View style={st.road} nativeID="trial-timeline">
      <Text style={st.roadHead}>HOW THE FREE TRIAL WORKS</Text>
      {stops.map((s, i) => (
        <View key={s.when + i} style={st.stop}>
          <View style={st.stopRail}>
            <View style={[st.stopNode, { backgroundColor: s.tone }]}>
              <SketchIcon name={s.icon} size={15} color={PAPER} />
            </View>
            {i < stops.length - 1 ? <View style={[st.stopLine, { backgroundColor: mix(s.tone, PAPER, 0.45) }]} /> : null}
          </View>
          <View style={st.stopBody}>
            <Text style={[st.stopWhen, { color: s.tone === EMBER ? EMBER_INK : s.tone }]}>{s.when}</Text>
            <Text style={st.stopWhat}>{s.what}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  door: { gap: SPACE[2] },
  road: {
    marginBottom: SPACE[2], padding: SPACE[3], paddingBottom: SPACE[1], borderRadius: RADIUS.card,
    backgroundColor: TINT, borderWidth: 1.5, borderColor: TINT_EDGE,
  },
  roadHead: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: PATINA.base, marginBottom: SPACE[2],
  },
  stop: { flexDirection: 'row', gap: SPACE[2] },
  stopRail: { width: 30, alignItems: 'center' },
  stopNode: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stopLine: { width: 3, flex: 1, minHeight: 12, borderRadius: 1.5, marginVertical: 2 },
  stopBody: { flex: 1, paddingTop: 1, paddingBottom: SPACE[3] },
  stopWhen: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.4 },
  stopWhat: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 19, color: INK, marginTop: 1 },
  plate: { alignSelf: 'center' },
  // THE PROMISE IS THE LARGER LINE, the conversion terms the smaller one, in the
  // order the reader asked for. Ink rather than grey, so it reads as a statement
  // and not as a disclaimer.
  promise: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 20, color: INK, textAlign: 'center',
  },
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: MID, textAlign: 'center',
  },
  notice: {
    fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, color: C.ink, textAlign: 'center',
  },
  // A CUT-IN PANEL, not a raised one. `SPACE[3]` of air above it so it reads as
  // a separate offer rather than more fine print belonging to the trial.
  skip: {
    marginTop: SPACE[3],
    padding: SPACE[3],
    gap: SPACE[2],
    borderWidth: 1.5,
    borderColor: C.edge,
    borderRadius: RADIUS.card,
    backgroundColor: C.paper,
  },
  skipHead: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, color: INK, textAlign: 'center',
  },
  priceLine: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: MID, textAlign: 'center' },
  price: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK },
});
