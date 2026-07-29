import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import SketchIcon from '@/components/shared/SketchIcon';

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
// ─────────────────────────────────────────────────────────────────────────────
export const MIN_VERSION_CODE = 16;

const PACKAGE = 'com.philosophize.app';
const Ink = '#1A1A1A';
const Paper = '#FAFAF7';
const InkSoft = '#6B6B6B';

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
    if (build !== null && build < MIN_VERSION_CODE) setStale(true);
  }, []);

  if (!stale) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <View style={styles.iconRing}>
            <SketchIcon name="reload" size={26} color={Ink} />
          </View>

          <Text style={styles.title}>Time to update</Text>
          <Text style={styles.body}>
            This version of Philosophize is out of date. Update to keep your streak, your
            progress and your saved quotes working properly.
          </Text>

          <Pressable
            onPress={openStore}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.ctaText}>UPDATE NOW</Text>
          </Pressable>

          <Text style={styles.foot}>Philosophize · Google Play</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18,17,15,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  box: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Paper,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
  },
  iconRing: {
    width: 54,
    height: 54,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    color: Ink,
    marginTop: 16,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13.5,
    lineHeight: 20,
    color: InkSoft,
    marginTop: 10,
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: Ink,
    borderRadius: 5,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: Paper, letterSpacing: 1.5 },
  foot: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#9A968C',
    letterSpacing: 1.5,
    marginTop: 14,
  },
});
