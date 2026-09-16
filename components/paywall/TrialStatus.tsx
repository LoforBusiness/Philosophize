import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import TrialReminderAsk from '@/components/paywall/TrialReminderAsk';
import { INK, MID, PATINA } from '@/components/shared/tone';
import { C, SPACE, RADIUS } from '@/constants/design';
import { BILLING_PERIOD_LABEL, FALLBACK_PRICE } from '@/constants/subscription';
import { trialLabel, trialLeft, whenLabel } from '@/lib/utils/trial';
import {
  autoConvertLine, cancelHowLine, cancelledLine, cancelSteps, RESTART_LINE, STORE,
} from '@/lib/utils/trialTerms';
import { usePassState, useSubscriptionStore } from '@/stores/subscriptionStore';

// ─────────────────────────────────────────────────────────────────────────────
// THE TRIAL, WHILE IT RUNS: WHEN IT ENDS, WHAT IT BECOMES, AND HOW TO STOP IT.
//
//   "be sure to explicitly say and for it to go into the app when the user's on
//    the free trial and to cancel the free trial I want this to be easy to do so
//    that the user won't be able to complain about not being able to cancel the
//    free trial before it ends"
//
// Shown at the TOP of the Pass tab (where the reminder notification lands), in
// Settings › Subscription, and on the paywall for a reader who already has it.
// Google Play's policy asks for the same: an easy way to cancel, inside the app.
//
// An app cannot cancel a Google Play subscription itself, so "easy" means a
// button that is impossible to miss, one sentence saying what happens in Google
// Play, and a link that opens on THIS subscription rather than on a list. The
// store re-reads the trial when the reader comes back, so the panel turns into
// "cancelled, you won't be charged" without them doing anything else.
//
// Three readings:
//   · RUNNING, WILL CONVERT: the date, the automatic Scholar's Pass, the reminder,
//     and Cancel free trial.
//   · CANCELLED: you won't be charged, it stays open until the date, and a way to
//     restart it for somebody who changes their mind.
//   · THE RETIRED ON-DEVICE TRIAL: ends by itself, nothing to cancel.
// ─────────────────────────────────────────────────────────────────────────────

export type TrialStatusSource = 'pass_tab' | 'settings' | 'paywall';

export default function TrialStatus({ source, compact = false }: {
  source: TrialStatusSource;
  /** Settings' narrow card. */
  compact?: boolean;
}) {
  const state = usePassState();
  const price = useSubscriptionStore((s) => s.monthly?.priceString ?? FALLBACK_PRICE);
  const openManage = useSubscriptionStore((s) => s.openManage);
  const [confirm, setConfirm] = useState(false);

  // THE COUNTDOWN MOVES ONCE A MINUTE, and only while there is a trial to count.
  const running = state.kind === 'trial' || state.kind === 'deviceTrial';
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [running]);

  const now = Date.now();
  const period = BILLING_PERIOD_LABEL;
  const size = compact ? 'md' : 'lg';

  if (state.kind === 'deviceTrial') {
    return (
      <View style={st.box} nativeID="trial-status">
        <MetalPlate
          metal={PATINA}
          label={trialLabel(trialLeft(state.endsAt, now)).toUpperCase()}
          style={st.plate}
        />
        <Text style={[st.head, compact && st.headCompact]}>
          {`Your free trial ends ${whenLabel(state.endsAt)}`}
        </Text>
        <Text style={st.body}>It ends by itself, and nothing is charged.</Text>
        <Button
          label="Keep the Scholar’s Pass"
          size={size}
          onPress={() => router.push('/(app)/paywall')}
        />
      </View>
    );
  }

  if (state.kind !== 'trial') return null;

  const ends = state.endsAt;
  const when = ends != null ? whenLabel(ends) : 'the trial ends';

  if (!state.willRenew) {
    return (
      <View style={st.box} nativeID="trial-status">
        <Text style={st.kicker}>FREE TRIAL CANCELLED</Text>
        <Text style={[st.head, compact && st.headCompact]}>You won’t be charged</Text>
        <Text style={st.body}>{cancelledLine(when)}</Text>
        {/* Short in Settings' narrow card, where the long label left "it" alone
            on a second line. */}
        <Button
          label={compact ? 'Keep my trial' : 'Changed your mind? Keep it'}
          variant="secondary"
          size={size}
          onPress={() => void openManage(source)}
        />
        <Text style={st.fine}>{RESTART_LINE}</Text>
      </View>
    );
  }

  return (
    <View style={st.box} nativeID="trial-status">
      {ends != null ? (
        <MetalPlate
          metal={PATINA}
          label={trialLabel(trialLeft(ends, now)).toUpperCase()}
          style={st.plate}
        />
      ) : null}
      <Text style={[st.head, compact && st.headCompact]}>{`Your free trial ends ${when}`}</Text>
      {/* SAID IN FULL, ON EVERY SCREEN THAT SHOWS THE TRIAL. The reader asked for
          the automatic conversion to be explicit, not implied by a price. */}
      <Text style={st.convert}>{autoConvertLine(price, period)}</Text>
      <TrialReminderAsk endsAt={ends} source={source} compact />
      <Button
        label="Cancel free trial"
        variant="destructive"
        size={size}
        onPress={() => setConfirm(true)}
      />
      <Text style={st.fine}>{cancelHowLine(when)}</Text>

      <CancelSheet
        visible={confirm}
        when={when}
        onClose={() => setConfirm(false)}
        onGo={() => { setConfirm(false); void openManage(source); }}
      />
    </View>
  );
}

/**
 * ONE STEP BEFORE GOOGLE PLAY OPENS, and it is not there to talk anybody out of
 * cancelling. "Keep my trial" is the quiet button. It is there because a reader
 * dropped into Google Play without a word does not know which button there does
 * what they came for, and "I couldn't find how to cancel" is the complaint this
 * whole panel exists to prevent.
 */
function CancelSheet({ visible, when, onClose, onGo }: {
  visible: boolean;
  when: string;
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={st.backdrop}>
        <Pressable style={[StyleSheet.absoluteFill, st.scrim]} onPress={onClose} />
        <View style={st.sheet} nativeID="trial-cancel-sheet">
          <Text style={st.sheetTitle}>Cancel your free trial</Text>
          <Text style={st.sheetMsg}>{cancelSteps(when)}</Text>
          <View style={st.sheetBtns}>
            <Button label={`Go to ${STORE}`} variant="destructive" onPress={onGo} />
            <Button label="Keep my trial" variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  box: { alignSelf: 'stretch', gap: SPACE[2] },
  plate: { alignSelf: 'center' },
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: MID, textAlign: 'center',
  },
  head: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, lineHeight: 26, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  headCompact: { fontSize: 16, lineHeight: 21 },
  convert: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 20, color: INK, textAlign: 'center',
  },
  body: {
    fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20, color: MID, textAlign: 'center',
  },
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: MID, textAlign: 'center',
  },

  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACE[4] },
  scrim: { backgroundColor: C.ink, opacity: 0.45 },
  sheet: {
    width: '100%', maxWidth: 380, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink,
    borderRadius: RADIUS.card, padding: SPACE[4], gap: SPACE[2],
  },
  sheetTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, lineHeight: 26, color: INK },
  sheetMsg: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: MID },
  sheetBtns: { gap: SPACE[1], marginTop: SPACE[2] },
});
