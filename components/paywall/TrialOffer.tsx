import { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import PassChart, { PlanTiles, usePassArrival } from '@/components/paywall/PassChart';
import { INK, MID, PATINA } from '@/components/shared/tone';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { libraryStanding } from '@/lib/utils/passValue';
import { trialLengthPhrase } from '@/lib/utils/trial';
import {
  conversionTerms, REMINDER_PROMISE, startNotice, startTrialLabel,
} from '@/lib/utils/trialTerms';
import { BILLING_PERIOD_LABEL, FALLBACK_PRICE } from '@/constants/subscription';
import { C, SPACE } from '@/constants/design';
import { track } from '@/lib/posthog';

// -----------------------------------------------------------------------------
// THE TRIAL OFFER — raised after a free reader finishes a lesson, before the ad.
//
//   "I want this free trial to show up every time a free user finishes a lesson.
//    I want this free trial to show up before the ad ... a very beautiful free
//    trial for three days ... with the scholars pass certificate there showing
//    all the benefits."
//
// == WHY THIS MOMENT, AND WHY BEFORE THE AD ==================================
//
// It is the one instant in the app where the reader has just been given
// something and is about to be taken something from. They have finished a
// lesson, they are pleased, and the next thing that happens on a free account is
// an interstitial. Putting the offer after the ad would ask somebody to consider
// a subscription in the second after being advertised at, which is the worst
// frame of mind the app can produce.
//
// And accepting means the ad does not play at all. That is not a trick, it is
// the first thing the Pass buys, demonstrated one second after it is promised
// rather than described in a row of a table.
//
// == IT IS GOOGLE PLAY'S TRIAL, AND IT SAYS SO ===============================
//
// Accepting opens Google's payment sheet, and when the trial ends it becomes a
// Scholar's Pass automatically unless the reader cancels. So under the button,
// in this order: the promise that they will be reminded a day before it ends,
// large; then, small, how long it lasts, the price it becomes, and how to cancel.
// Every sentence is `lib/utils/trialTerms.ts`, the same words as every other door.
//
// == IT IS OFFERED ONLY WHILE IT CAN BE HONOURED =============================
//
// `canStartTrial()` is true only while Google Play is offering THIS reader a
// trial, and Google stops once they have had one. So "after every lesson" means
// every lesson there is still a trial to give, and never a screen promising three
// free days to somebody the button would charge.
//
// == EVERY FIGURE ON IT IS DERIVED ===========================================
//
// The chart comes from `PASS_LINES`, the tiles from the tree, the lessons left
// from `libraryStanding()`, the trial's length from the store's own offer, and
// the price from the store. Nothing on this screen is typed as a number.
// -----------------------------------------------------------------------------

/** How long the modal's slide takes before the chart starts to arrive. */
const ARRIVE_AFTER_MS = 320;

interface Props {
  /**
   * Accept: opens Google Play's sheet. Resolves with how it went, so this screen
   * can say what failed while the reader is still looking at it. On success the
   * host closes it and the store raises the conferral.
   */
  onAccept: () => Promise<string>;
  /** Decline — the lesson flow carries on, ad and all. */
  onDecline: () => void;
}

export default function TrialOffer({ onAccept, onDecline }: Props) {
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const trial = useSubscriptionStore((s) => s.monthly?.trial ?? null);
  const price = useSubscriptionStore((s) => s.monthly?.priceString ?? FALLBACK_PRICE);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4];
  const cardW = winW - PAD * 2;

  const lib = useMemo(() => libraryStanding(lessonsByBranch), [lessonsByBranch]);
  const { play, replay } = usePassArrival();

  useEffect(() => {
    track('trial_offered', { source: 'post_lesson', lessons_left: lib.left });
    replay(ARRIVE_AFTER_MS);
    // Deliberately keyed on nothing: one event and one arrival per showing, and
    // the figure the event carries is read once at that moment. Adding
    // `lib.left` to the deps would re-fire both every time the store moved
    // underneath a screen that is already up, which is the same class of fault
    // section 19 records for Insights' arrival firing on a value change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // THE OFFER CANNOT OUTLIVE THE TRIAL IT OFFERS. If the store stops offering one
  // while this is up, the reader is handed on exactly as if they had declined,
  // rather than left on a screen whose button would refuse them.
  useEffect(() => {
    if (!trial) onDecline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  // THE HEADLINE IS A COUNT, AND IT HAS A FALLBACK FOR THE ONE READER IT CANNOT
  // BE. Somebody who has finished the library has no "other N" -- the sentence
  // would read "The other 0 are waiting", which is both wrong and slightly
  // insulting to the person who has done the most work in the app.
  const headline = lib.left > 0
    ? `The other ${lib.left.toLocaleString()} are waiting.`
    : 'The whole library is waiting.';

  if (!trial) return null;
  const days = trialLengthPhrase(trial);

  const accept = async () => {
    if (busy) return;
    setNotice(null);
    setBusy(true);
    const outcome = await onAccept();
    setBusy(false);
    setNotice(startNotice(outcome));
  };

  return (
    <Modal visible animationType="slide" transparent={false} onRequestClose={onDecline}>
      <SafeAreaView style={st.root} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[st.words, { width: cardW }]}>
            <MetalPlate metal={PATINA} label={`${days.toUpperCase()} FREE`} />
            <Text style={st.kicker}>THAT WAS TODAY’S LESSON</Text>
            <Text style={st.head}>{headline}</Text>
            <Text style={st.sub}>{`Open every lesson free for ${days}.`}</Text>
          </View>

          {/* The five things the trial opens, on the same chart as the Pass tab,
              arriving the same way. */}
          <View style={{ width: cardW }}>
            <PassChart play={play} />
          </View>

          {/* And what they already have. A trial screen that lists only what is
              being withheld reads as a hostage note; this half says the app is
              holding the pace, not the library. */}
          <View style={{ width: cardW }}>
            <Text style={st.tilesKicker}>EVERY PLAN INCLUDES</Text>
            <PlanTiles />
          </View>
        </ScrollView>

        {/* THE FOOTER DOES NOT SCROLL. A decision this screen exists to invite,
            and the terms that come with it, must not be something you have to go
            looking for at the bottom of the page. */}
        <View style={[st.foot, { paddingHorizontal: PAD }]}>
          <Button
            label={busy ? 'One moment…' : startTrialLabel(trial)}
            onPress={() => void accept()}
            disabled={busy}
            size="lg"
          />
          <Text style={st.promise}>{REMINDER_PROMISE}</Text>
          <Text style={st.fine}>{conversionTerms(trial, price, BILLING_PERIOD_LABEL)}</Text>
          {notice ? <Text style={st.notice}>{notice}</Text> : null}
          <Button label="Not today" onPress={onDecline} variant="ghost" />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: SPACE[4],
    paddingTop: SPACE[4],
    paddingBottom: SPACE[4],
    gap: SPACE[4],
  },

  words: { alignItems: 'center' },
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 2.2, color: MID,
    marginTop: SPACE[3],
  },
  head: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 27, lineHeight: 33, color: INK,
    marginTop: SPACE[1], textAlign: 'center', includeFontPadding: false,
  },
  sub: {
    fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20, color: MID,
    marginTop: SPACE[2], textAlign: 'center',
  },
  tilesKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: MID,
    marginBottom: SPACE[2],
  },

  foot: {
    paddingTop: SPACE[3],
    paddingBottom: SPACE[2],
    borderTopWidth: 1,
    borderTopColor: C.hairline,
    backgroundColor: C.paper,
    gap: SPACE[2],
  },
  promise: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 20, color: INK, textAlign: 'center',
  },
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 16, color: MID,
    textAlign: 'center', paddingHorizontal: SPACE[1],
  },
  notice: {
    fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, color: INK, textAlign: 'center',
  },
});
