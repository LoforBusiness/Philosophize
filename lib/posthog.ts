import PostHog from 'posthog-react-native';

// One PostHog client for the whole app.
//
// Most of our analytics events originate in Zustand store actions (plain
// functions with no React hooks), so we keep a single instance here and also
// hand it to `<PostHogProvider client={posthog}>` in app/_layout.tsx — that way
// the store actions and the React tree (hooks, touch-autocapture, surveys) all
// share the exact same client.
//
// The client is `null` until a project key is set in .env.local, so the app
// runs perfectly fine before analytics is configured.

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

// Final scrub before anything leaves the device: never ship personal text
// (names, bios, emails, quote/note bodies). The Settings copy promises this.
const PII_KEYS = ['email', 'name', 'displayName', 'bio', 'text', 'quote', 'note', 'username', 'author'];

function stripPII(event: any) {
  if (!event) return event;
  // PII can ride out on two channels: the flat `properties` bag AND the person-
  // property channel that identify()/$set populates (event.$set / $set_once, and
  // their nested copies under properties). Scrub PII_KEYS from every one of them
  // so the "never ship personal text" promise holds even if a future identify()
  // call includes profile.email or displayName.
  const bags = [
    event.properties,
    event.$set,
    event.$set_once,
    event.properties?.$set,
    event.properties?.$set_once,
  ];
  for (const bag of bags) {
    if (bag && typeof bag === 'object') for (const k of PII_KEYS) delete bag[k];
  }
  if (event.properties) {
    // Touch-autocapture copies on-screen element text (quote bodies, names) into
    // these nested structures, which the flat scrub above misses — drop them
    // wholesale so no rendered user content can ride out on a tap event.
    delete event.properties.$elements;
    delete event.properties.elements;
    delete event.properties.$elements_chain;
    delete event.properties.elements_chain;
  }
  return event;
}

export const posthog = KEY
  ? new PostHog(KEY, {
      host: HOST,
      // Capture nothing until the user consents (Settings → Usage Analytics).
      // app/_layout.tsx flips this via optIn()/optOut() once the store hydrates.
      defaultOptIn: false,
      before_send: stripPII,
    })
  : null;

// Thin helpers so call sites never touch the nullable client directly. Every
// capture is automatically a no-op until consent is granted.
export function track(event: string, properties?: Record<string, any>) {
  posthog?.capture(event, properties);
}

export function identifyUser(distinctId: string, properties?: Record<string, any>) {
  posthog?.identify(distinctId, properties);
}

/**
 * WHAT A READER IS, as opposed to what they did.
 *
 * Every "broken down by" on the dashboard hangs off one of these, and the app set
 * none of them: `identify()` went out with a Supabase id and a `signup_method`,
 * so the comparison that decides whether the ads cost more engagement than they
 * earn — free against Scholar's Pass — could not be drawn at all.
 *
 * `$set`, not `$set_once`: a tier changes, and the chart wants the current one.
 * The scrubber in `before_send` runs over this bag too (that is what the `$set`
 * entries in `stripPII`'s list are for), so a personal field cannot ride out here
 * either.
 */
export function setPersonProperties(properties: Record<string, any>) {
  posthog?.capture('$set', { $set: properties });
}

export function resetUser() {
  posthog?.reset();
}

export function setAnalyticsConsent(enabled: boolean) {
  if (!posthog) return;
  if (enabled) posthog.optIn();
  else posthog.optOut();
}
