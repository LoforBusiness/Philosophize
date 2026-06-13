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
  if (event && event.properties) {
    for (const k of PII_KEYS) delete event.properties[k];
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

export function resetUser() {
  posthog?.reset();
}

export function setAnalyticsConsent(enabled: boolean) {
  if (!posthog) return;
  if (enabled) posthog.optIn();
  else posthog.optOut();
}
