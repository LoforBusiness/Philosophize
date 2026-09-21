import { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, Linking, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import * as Application from 'expo-application';
import { track } from '@/lib/posthog';
import SketchIcon from '@/components/shared/SketchIcon';
import StatSticker from '@/components/shared/StatSticker';
import Button from '@/components/ui/Button';
import { C, TYPE, SPACE, RADIUS, LIP } from '@/constants/design';
import { FLOOR, FLOOR_CUT, EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// The oldest build allowed to keep running.
//
// Raise this ONLY to the number of a release that is already live and fully
// rolled out in Play — a learner blocked here has no way forward except an
// update that must actually exist for them. Then publish the update to EVERY
// runtime still in the wild, because an old build only ever receives updates
// published against its own runtime version; a gate published solely to the
// current runtime would reach precisely the people who don't need it.
//
// 16 = the release carrying the new icon and the branch artwork.
// 19 = the first binary containing expo-notifications and expo-audio. This is
//      what makes the gate worth raising rather than merely tidy: a build 16
//      reader has received every line of JS since, so they have rest days, the
//      welcome questions and the whole content expansion — but reminders and sound are
//      NATIVE, and no over-the-air update can ever put them on that binary. They
//      are not behind on content, they are permanently cut off from the retention
//      engine, and only a store update fixes it.
//
//      17 and 18 were consumed by builds that failed in EAS's install phase and
//      never shipped, so nothing exists between 16 and 19 to catch.
//
// 20 = the rename. The app is called Deeply now, and the launcher label, the
//      icon, the widget picker entry and the notification header are all
//      COMPILED RESOURCES — a build 19 reader on current JS gets an app that
//      calls itself Deeply on every screen while their home screen still says
//      Philosophize under a scroll icon, and no update can ever reconcile that
//      without the store.
//
//      Be honest about the difference from 19, because it changes what this
//      gate is doing. A build 16 reader was permanently cut off from reminders
//      and sound — genuinely broken, and the wall was a rescue. A build 19
//      reader is fully functional and merely inconsistent, so this raise trades
//      a working app for a coherent one. That is a defensible call for a rename
//      and a bad habit to acquire for anything less.
//
// 21 = the SECOND rename, to Ashmere, with a new icon — the reader with his mug
//      and his book. Same class of change as 20 and the same argument applies,
//      which is exactly why the gate is NOT being raised to 21 in the build that
//      carries it.
//
//      A gate is JavaScript. Raising this constant only reaches a binary through
//      an update published to THAT binary's runtime, so shipping 21 with the
//      number already at 21 walls nobody who is not already on 21 — it just
//      arms a wall pointed at a build that may still be rolling out. The raise
//      is a separate, later step: once 21 is live and at 100%, set this to 21
//      and publish to every runtime still reachable (§20's two conditions).
//
//      DONE, 2026-08-19. 21 reached 100% and this went to 21 in the same commit
//      that was published to BOTH runtimes — build 20's FIRST, because those are
//      the only people the wall is for and an update they never receive is a
//      wall that does not exist. After that publish there is one reachable
//      runtime again (§18).
//
// 22 = THE FIRST OPEN, and the first raise that is a POLICY rather than a repair.
//
//      What 22 fixes only a new reader ever meets: a fresh install of 21 had to
//      download 87.8MB of narration and restart into it before it could show the
//      right first screen, and the restart is a white page (§19). Nobody already
//      running the app will ever have another first open, so by the reasoning
//      used for 19, 20 and 21 this raise buys its readers nothing, and it costs
//      them the ~150MB the embedded narration now weighs.
//
//      The owner overruled that, and the reason is worth keeping because it is
//      about the SHIPPING MODEL rather than this release: "I want every old
//      version to force the user if they still have that old version to update."
//      Every binary below the newest gets walled, so there is exactly one
//      reachable runtime at all times and a publish can never be sent to a
//      runtime somebody was forgotten on — which is the silent failure §18 is
//      almost entirely about. The cost is a forced download; the purchase is
//      that the whole fleet is one version and the publish step has one target.
//
//      DONE, 2026-09-20. 22 reached 100% on Play, this went to 22, and the
//      commit was published to build 21's runtime FIRST — those are the only
//      people the wall is for, and a wall they never receive is not a wall.
// ─────────────────────────────────────────────────────────────────────────────
export const MIN_VERSION_CODE = 22;

const PACKAGE = 'com.philosophize.app';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS SCREEN IS, AND WHY IT IS BUILT OUT OF THE APP'S OWN PARTS (2026-09-20)
//
// It was a paper box with a 1.5px ink rule, a thin ring with a line icon in it,
// an italic Playfair sentence and a flat ink button at radius 5 — the pre-depth
// app, preserved under glass. Every other surface moved on (§19's depth kit),
// and this one did not, because nobody with a current build can ever see it.
//
// It is the LAST screen a lapsed reader sees, which is the argument for it
// mattering: they are being stopped, and what they are looking at while they
// decide whether to bother is a picture of how much care the thing they are
// being asked to download is made with.
//
// So it is the kit, unmodified:
//   · a flat white panel on the 2px `C.edge` — flat, because a ledge in this app
//     means a thing you can press, and the panel is not one (Card's own rule);
//   · the app's real ICON on a teal ledge, wearing the ember update badge — an
//     app tile is the one object a reader already associates with an update, and
//     it is the store's own vocabulary rather than an abstract mark;
//   · the reassurance as THREE STICKERS in a cut-in strip, because "your streak
//     is safe" is what the reader actually wants to know and a sentence about it
//     reads as boilerplate where their own streak, lessons and quotes drawn in
//     the tab bar's hand do not;
//   · and the shared `Button`, so the one thing to press here is the same object
//     they press everywhere else in the app.
//
// No new colour: ink, paper, the app's teal and one ember spark, which is the
// palette rule (§7 — the five tame colours take the area, the spark is small).
// ─────────────────────────────────────────────────────────────────────────────

/** C.ink at 72%. A scrim, so it is stated as an alpha rather than a palette entry. */
const SCRIM = 'rgba(26,26,26,0.72)';

/** What survives the update, in the reader's own terms. */
const KEPT = [
  { icon: 'days', label: 'STREAK' },
  { icon: 'lessons', label: 'PROGRESS' },
  { icon: 'quotes', label: 'QUOTES' },
] as const;

/**
 * The installed build number, or null when it can't be established.
 *
 * `Application.nativeBuildVersion` reads the versionCode compiled into the APK,
 * which is exactly what's wanted: the JS version in app.json travels with
 * over-the-air updates, so an old binary carrying new JS would report the new
 * number and slip straight past this gate.
 */
function installedBuild(): number | null {
  const raw = Application.nativeBuildVersion;
  if (!raw) return null;                     // web, Expo Go, dev client
  const s = String(raw).trim();
  // Whole digits ONLY. On Android this is the versionCode ("16"), but parseInt
  // would happily turn an unexpected "1.0.0" into 1 — which, against a minimum
  // of 16, would lock out every user on the planet including the up-to-date
  // ones. Anything that isn't a plain integer is treated as unknown, and unknown
  // never blocks.
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function openStore() {
  const market = `market://details?id=${PACKAGE}`;
  const web = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
  // The market:// scheme opens the Play app directly; it doesn't exist on a
  // device without Play services, so fall back to the browser rather than
  // leaving the one button on a blocking screen doing nothing.
  Linking.canOpenURL(market)
    .then((ok) => Linking.openURL(ok ? market : web))
    .catch(() => Linking.openURL(web).catch(() => {}));
}

/**
 * THE WALL ITSELF, exported so it can be LOOKED AT.
 *
 * The gate below renders nothing unless the app is running on an out-of-date
 * Android binary, which is a state no browser can ever be in and no current
 * reader will ever see again — so for the whole life of this screen the only
 * way to check it was to reason about the source. Splitting the panel out is
 * what lets `npm run sheet:gate` draw the real thing (§21).
 */
export function UpdateWall() {
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.scrim}>
        {/* The panel arrives rather than appearing: the modal's own fade carries
            the scrim, and the card rises the last few points under it. */}
        <MotiView
          from={{ opacity: 0, translateY: 18 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, easing: Easing.out(Easing.cubic) }}
          style={styles.panel}
        >
          {/* THE APP TILE. The icon on the teal ledge every raised thing in the
              app stands on, with the ember badge a store puts on an app that has
              an update waiting. */}
          <View style={styles.tileBox}>
            <View style={styles.tileLedge} />
            <View style={styles.tile}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.tileArt}
                accessibilityIgnoresInvertColors
              />
            </View>
            <View style={styles.badge}>
              <SketchIcon name="chevron-down" size={13} color={C.paper} />
            </View>
          </View>

          <Text style={styles.title}>Time to update</Text>
          <Text style={styles.body}>
            This version is out of date. The newest one is waiting on Google Play.
          </Text>

          {/* CUT INTO THE PAGE, not raised: a dark hairline where the light
              cannot reach into the cut and a white foot where it catches the far
              wall — StruckNiche's construction, which is how this app says
              "recess" without a gradient. */}
          <View style={styles.keep}>
            <View style={styles.keepCut} />
            <View style={styles.keepFoot} />
            <Text style={styles.keepKicker}>KEPT WHEN YOU UPDATE</Text>
            <View style={styles.keepRow}>
              {KEPT.map((k) => (
                <View key={k.label} style={styles.keepCell}>
                  <StatSticker name={k.icon} size={24} />
                  <Text style={styles.keepLabel}>{k.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Button label="Update now" onPress={openStore} size="lg" style={styles.cta} />

          <Text style={styles.foot}>ASHMERE · GOOGLE PLAY</Text>
        </MotiView>
      </View>
    </Modal>
  );
}

/**
 * Blocks the app when it's running a build older than MIN_VERSION_CODE.
 *
 * Deliberately fails OPEN: if the build number can't be read — web, Expo Go, a
 * dev client, anything unexpected — the app runs as normal. Being unable to
 * prove someone is out of date is not a reason to lock them out.
 */
export default function UpdateGate() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    // Android-only for now: this is the versionCode, and there is no iOS
    // release to compare against.
    if (Platform.OS !== 'android') return;
    const build = installedBuild();
    if (build !== null && build < MIN_VERSION_CODE) {
      setStale(true);
      // HOW MANY PEOPLE A GATE RAISE IS ACTUALLY STOPPING. §20 says the raise is
      // the one change in this file that can lock a reader out with no way back,
      // and until now the only evidence either way was the absence of complaints.
      track('update_required_shown', { build, minimum: MIN_VERSION_CODE });
    }
  }, []);

  if (!stale) return null;

  return <UpdateWall />;
}

const TILE = 76;
const BADGE = 26;

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACE[4],
  },
  panel: {
    width: '100%',
    maxWidth: 344,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.edge,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACE[4],
    paddingTop: SPACE[4],
    paddingBottom: SPACE[3],
    alignItems: 'center',
  },

  // The badge hangs off the tile's corner, so the box it sits in is the tile
  // plus its ledge and nothing else — the overhang is allowed to show.
  tileBox: { width: TILE, height: TILE + LIP.button },
  tileLedge: {
    position: 'absolute',
    left: 0, right: 0, top: LIP.button, bottom: 0,
    borderRadius: 20,
    backgroundColor: C.HUE,
  },
  tile: {
    width: TILE, height: TILE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.HUE,
    overflow: 'hidden',
    backgroundColor: C.surface,
  },
  tileArt: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: -4, right: -6,
    width: BADGE, height: BADGE, borderRadius: BADGE / 2,
    backgroundColor: EMBER,
    borderWidth: 2.5,
    borderColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    // A chevron pointing UP: the store's own "there is something newer" arrow,
    // and the one glyph in the set that can make it without a new drawing.
    transform: [{ rotate: '180deg' }],
  },

  title: {
    fontFamily: TYPE.display.family,
    fontSize: TYPE.display.fontSize,
    lineHeight: TYPE.display.lineHeight,
    color: C.ink,
    marginTop: SPACE[3],
    textAlign: 'center',
  },
  body: {
    fontFamily: TYPE.body.family,
    fontSize: 15,
    lineHeight: 22,
    color: C.inkSoft,
    marginTop: SPACE[1],
    textAlign: 'center',
  },

  keep: {
    alignSelf: 'stretch',
    marginTop: SPACE[3],
    paddingTop: SPACE[2],
    paddingBottom: SPACE[2] + 2,
    borderRadius: RADIUS.button,
    backgroundColor: FLOOR,
    overflow: 'hidden',
    alignItems: 'center',
  },
  keepCut: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 2,
    backgroundColor: FLOOR_CUT,
  },
  keepFoot: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 1.5,
    backgroundColor: PAPER_LIT,
  },
  // INK-SOFT, NOT DIM, and measured rather than chosen: C.dim is 2.0:1 on this
  // strip and 2.2:1 on paper — the "a tone fitted for METAL is invisible on
  // PAPER" rule (§19) arriving on a caption. A kicker nobody can read is a
  // decoration, and this screen has exactly one job.
  keepKicker: {
    fontFamily: TYPE.micro.family,
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: C.inkSoft,
  },
  keepRow: { flexDirection: 'row', alignSelf: 'stretch', marginTop: SPACE[1] },
  keepCell: { flex: 1, alignItems: 'center', gap: 3 },
  keepLabel: {
    fontFamily: TYPE.micro.family,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: C.inkSoft,
  },

  cta: { alignSelf: 'stretch', marginTop: SPACE[3] },
  foot: {
    fontFamily: TYPE.micro.family,
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.inkSoft,
    marginTop: SPACE[2],
  },
});
