import { useEffect, useMemo } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import PassChart, { PlanTiles, usePassArrival } from '@/components/paywall/PassChart';
import { INK, MID, METAL } from '@/components/shared/tone';
import { useUserDataStore } from '@/stores/userDataStore';
import { libraryStanding } from '@/lib/utils/passValue';
import { trialLengthPhrase } from '@/lib/utils/trial';
import { FREE_DAILY_LESSON_LIMIT, TRIAL_DAYS, lessonsWord } from '@/constants/subscription';
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
// == IT IS OFFERED ONLY WHILE IT CAN BE HONOURED =============================
//
// `canStartTrial()` is false for anyone paying and for anyone who has already
// taken it. The reader asked for it after EVERY lesson, and it is -- for as long
// as there is a trial left to give. A screen that came back every day saying
// "three days free" to somebody who had already spent them would be a lie the
// app told repeatedly, which is the one thing section 14 is written to stop.
//
// == IT WEARS THE PASS TAB'S CHART NOW, AND ITS ARRIVAL ======================
//
//   "when a free user finished the lesson, they still get that old look. I want
//    it changed to the new look ... I want that [animation] to show up when the
//    user finishes the lesson and sees the offer."
//
// The engraved certificate is gone from here as it went from the tab. The chart
// and the tiles are `PassChart`, the same object the tab and Settings draw, and
// the arrival is the tab's too: the glint, then the Pass column stamping in. It
// waits for the modal to finish sliding up, because cells stamped during the
// slide are stamped where nobody is looking yet.
//
// == EVERY FIGURE ON IT IS DERIVED ===========================================
//
// The chart comes from `PASS_LINES`, the tiles from the tree, the lessons left
// from `libraryStanding()`, and the length of the trial from `TRIAL_DAYS`.
// Nothing on this screen is typed as a number.
// -----------------------------------------------------------------------------

/** How long the modal's slide takes before the chart starts to arrive. */
const ARRIVE_AFTER_MS = 320;

interface Props {
  /** Accept — grants the trial and hands over to the conferral. */
  onAccept: () => void;
  /** Decline — the lesson flow carries on, ad and all. */
  onDecline: () => void;
}

export default function TrialOffer({ onAccept, onDecline }: Props) {
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4];
  const cardW = winW - PAD * 2;

  const lib = useMemo(() => libraryStanding(lessonsByBranch), [lessonsByBranch]);
  const days = trialLengthPhrase();
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

  // THE HEADLINE IS A COUNT, AND IT HAS A FALLBACK FOR THE ONE READER IT CANNOT
  // BE. Somebody who has finished the library has no "other N" -- the sentence
  // would read "The other 0 are waiting", which is both wrong and slightly
  // insulting to the person who has done the most work in the app.
  const headline = lib.left > 0
    ? `The other ${lib.left.toLocaleString()} are waiting.`
    : 'The whole library is waiting.';

  return (
    <Modal visible animationType="slide" transparent={false} onRequestClose={onDecline}>
      <SafeAreaView style={st.root} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[st.words, { width: cardW }]}>
            <MetalPlate metal={METAL.GOLD} label={`${days.toUpperCase()} FREE`} />
            <Text style={st.kicker}>THAT WAS TODAY’S LESSON</Text>
            <Text style={st.head}>{headline}</Text>
            <Text style={st.sub}>
              Open the Scholar’s Pass for {days} — no card, no charge, and nothing
              to cancel. It closes again on its own.
            </Text>
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

        {/* THE FOOTER DOES NOT SCROLL. A decision this screen exists to invite
            must not be something you have to go looking for at the bottom of the
            page. */}
        <View style={[st.foot, { paddingHorizontal: PAD }]}>
          <Button label={`Start your ${TRIAL_DAYS}-day free trial`} onPress={onAccept} size="lg" />
          <Button label="Not today" onPress={onDecline} variant="ghost" />
          <Text style={st.fine}>
            When it closes you go back to {FREE_DAILY_LESSON_LIMIT}{' '}
            {lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day. Everything you have
            earned stays yours.
          </Text>
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
  fine: {
    fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15, color: MID,
    textAlign: 'center', paddingHorizontal: SPACE[2],
  },
});
