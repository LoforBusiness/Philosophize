import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import { INK, MID, PATINA } from '@/components/shared/tone';
import { C, RADIUS, SPACE } from '@/constants/design';
import { FALLBACK_PRICE, BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { trialLengthPhrase } from '@/lib/utils/trial';
import {
  conversionTerms, REMINDER_PROMISE, SKIP_TRIAL_HEADING, skipTrialLabel, skipTrialTerms,
  startNotice, startTrialLabel,
} from '@/lib/utils/trialTerms';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE DOOR UNDER THE CHART, ON THE PASS TAB AND IN SETTINGS.
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
//     and the button. Promising free days the store will not give is the one thing
//     this door may never do.
//
// A reader who HOLDS the Pass, on the trial or paid, gets nothing from this
// component. The screen shows `TrialStatus` or the ACTIVE plate instead.
//
// THE TRIAL IS STARTED THROUGH THE STORE, which raises the conferral itself, so
// no screen raises its own ceremony (check-pass §9e).
// ─────────────────────────────────────────────────────────────────────────────

export type DoorSource = 'pass_tab' | 'settings';

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

  // A PAID PURCHASE IS NOT RUN FROM HERE. The paywall route owns the busy state,
  // the failure notices and the restore path.
  const subscribe = () => {
    track('subscribe_clicked', { plan: 'monthly', billing: 'monthly', source });
    router.push('/(app)/paywall');
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
        <MetalPlate
          metal={PATINA}
          label={`${trialLengthPhrase(trial).toUpperCase()} FREE`}
          style={st.plate}
        />
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
      <Button label={compact ? 'Get the Pass' : 'Get the Scholar’s Pass'} size="lg" onPress={subscribe} />
    </View>
  );
}

const st = StyleSheet.create({
  door: { gap: SPACE[2] },
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
