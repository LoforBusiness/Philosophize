import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE THING AN OVER-THE-AIR UPDATE CANNOT REACH, AND HOW TO CLOSE IT.
//
// A new install runs the JS snapshot baked into the APK. That is structural: the
// binary always carries a bundle, and launch one happens before any download has
// finished. So whatever a brand-new reader sees FIRST is frozen at build time —
// which for this app is the welcome screen, the one screen whose entire job is
// introducing the app to people who have never seen it.
//
// The effect was not subtle. Build 19 shipped a welcome that was rewritten the
// next day; every new install played the OLD intro, latched `hasSeenWelcome`, and
// then played the NEW one on their second launch. Two different introductions on
// consecutive opens, and no over-the-air fix was possible, because the code that
// decides is inside the APK.
//
// So this runs BEFORE the first-run experience is decided: if we are on the
// embedded bundle and an update is waiting, take it and restart into it. After
// that, launch one renders from the newest published bundle, and the welcome —
// or anything else a new reader meets first — is updatable over the air forever.
// It has to be in a binary once. It never has to be again.
//
// WHAT IT DELIBERATELY DOES NOT DO:
//   · make anyone but a first-run reader wait — a returning reader has already
//     seen the intro, so there is nothing to be current about;
//   · block boot on a slow network — the whole thing is bounded, and a timeout
//     falls through to the embedded bundle, which is exactly today's behaviour;
//   · run anywhere it cannot work (web, Expo Go, dev client), where
//     `Updates.isEnabled` is false and this settles instantly.
//
// The sequence is split out as `runFirstRunUpdate`, which takes every effect it
// performs as an argument. That is not ceremony: this is the code path every
// single launch goes through, a mistake in it means an app that does not open,
// and injected dependencies are what let the whole decision tree — including the
// rollback loop below — be exercised in plain Node rather than hoped about.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How long the first launch may spend waiting for a newer bundle.
 *
 * It hides behind the launch animation, which already covers roughly four
 * seconds of fonts, auth and hydration, so a wait inside that window costs the
 * reader nothing they were not already spending. Past it the launch screen would
 * be sitting on a finished animation waiting for a network, which is worse than
 * an intro one version behind.
 */
export const BUDGET_MS = 4500;

/** Survives the restart, so the second pass knows not to replay the animation. */
export const RELOADED_KEY = 'philosophize-launch-reloaded';

/**
 * THE LOOP GUARD, and it is the most important thing in this file.
 *
 * `isEmbeddedLaunch` is true whenever the running bundle came from the APK — and
 * that includes the case where an update WAS downloaded, failed to launch, and
 * expo-updates correctly rolled back to the embedded copy. Without this marker
 * that state is indistinguishable from a fresh install: we would fetch, reload,
 * fall back, and fetch again, forever, on a device that never gets far enough to
 * accept a fix. A boot loop is the one bug an over-the-air update cannot repair.
 *
 * So the attempt is allowed EXACTLY ONCE per install, and the marker is written
 * before any of the work rather than after it — a crash halfway through must
 * still count as the one attempt.
 */
export const TRIED_KEY = 'philosophize-firstrun-update-tried';

export type Outcome =
  | 'disabled' // no updates here (web, Expo Go, dev client)
  | 'not-embedded' // already running a downloaded bundle
  | 'not-first-run' // they have met the app before; nothing to be current about
  | 'already-tried' // the loop guard
  | 'no-update' // we are the newest there is
  | 'reloading' // restarting into a newer bundle; nothing after this runs
  | 'error'; // offline, refused, malformed — run what we have

/** Every effect the sequence performs, injected so the whole tree is testable. */
export interface UpdateEnv {
  isEnabled: boolean;
  isEmbeddedLaunch: boolean;
  isFirstRun: boolean;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  checkForUpdate(): Promise<{ isAvailable: boolean }>;
  fetchUpdate(): Promise<{ isNew: boolean }>;
  reload(): Promise<void>;
}

/**
 * Decide whether to restart into a newer bundle, and do it.
 *
 * Resolves with what happened. `'reloading'` is the one outcome whose caller
 * never sees anything afterwards, because the app is being restarted.
 */
export async function runFirstRunUpdate(env: UpdateEnv): Promise<Outcome> {
  if (!env.isEnabled) return 'disabled';
  if (!env.isEmbeddedLaunch) return 'not-embedded';
  if (!env.isFirstRun) return 'not-first-run';
  try {
    if (await env.getItem(TRIED_KEY)) return 'already-tried';
    // Written BEFORE the work, so a crash mid-sequence still spends the attempt.
    await env.setItem(TRIED_KEY, '1');

    const check = await env.checkForUpdate();
    if (!check.isAvailable) return 'no-update';
    const fetched = await env.fetchUpdate();
    if (!fetched.isNew) return 'no-update';
    // Marked and awaited before restarting — after reload there is no "after".
    await env.setItem(RELOADED_KEY, '1');
    await env.reload();
    return 'reloading';
  } catch {
    // This must never be the reason an app fails to open.
    return 'error';
  }
}

/**
 * True when this process started from a bundle we just restarted into, so the
 * launch animation can be skipped rather than played twice on one cold start.
 * Read once and cleared, because it describes a single boot — unlike TRIED_KEY,
 * which is never cleared.
 */
export async function consumeReloadedFlag(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(RELOADED_KEY);
    if (v) await AsyncStorage.removeItem(RELOADED_KEY);
    return !!v;
  } catch {
    return false;
  }
}

/**
 * Holds the launch screen until it is known whether a newer bundle should run.
 *
 * Returns true once the answer is settled — immediately for everyone except a
 * first-run reader on the embedded bundle.
 *
 * @param enabled  gate on the store having hydrated; `isFirstRun` is a lie until
 *                 then, and a wrong answer here costs a reader their intro.
 */
export function useFirstRunUpdate(enabled: boolean, isFirstRun: boolean): boolean {
  const [settled, setSettled] = useState(false);
  const ran = useRef(false);
  // Read through a ref, NOT through the dependency array. `isFirstRun` flips the
  // moment the welcome records itself, and a dep change would run this effect's
  // cleanup — cancelling the timeout that is the only thing guaranteeing the
  // launch screen ever lifts.
  const firstRunRef = useRef(isFirstRun);
  firstRunRef.current = isFirstRun;

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;

    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setSettled(true);
      }
    };
    const timer = setTimeout(finish, BUDGET_MS);

    runFirstRunUpdate({
      isEnabled: Updates.isEnabled,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      isFirstRun: firstRunRef.current,
      getItem: (k) => AsyncStorage.getItem(k),
      setItem: (k, v) => AsyncStorage.setItem(k, v),
      checkForUpdate: () => Updates.checkForUpdateAsync(),
      fetchUpdate: () => Updates.fetchUpdateAsync(),
      reload: () => Updates.reloadAsync(),
    })
      // 'reloading' resolves only if the restart somehow did not happen, so
      // settling here is the correct fallback rather than a contradiction.
      .then(finish)
      .catch(finish);

    return () => clearTimeout(timer);
  }, [enabled]);

  return settled;
}
