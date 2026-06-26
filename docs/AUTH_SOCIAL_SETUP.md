# Social sign-in setup — Apple & Google

The **code is already wired** (`lib/auth/social.ts`, `components/shared/AuthPanel.tsx`,
the `onAuthStateChange` listener in `app/_layout.tsx`, and `app.json`). Email +
password works today, including in the web preview. **Apple and Google need a
native build + dashboard setup** before they function — none of it works in the
web preview or Expo Go.

> **Why not the web preview?** `expo-apple-authentication` and
> `@react-native-google-signin/google-signin` are native modules. On web the app
> uses `lib/auth/social.web.ts` (stubs) and simply hides the social buttons, so
> the screen still renders. Real Apple/Google sign-in only runs in a **dev-client
> or store build** on a device/simulator.

Both providers use the **native ID-token flow** into Supabase
(`supabase.auth.signInWithIdToken`) — no browser redirect, no deep-link plumbing
(`detectSessionInUrl` stays `false`).

---

## 0. Already done in the repo
- Installed `expo-apple-authentication` + `@react-native-google-signin/google-signin`.
- `app.json`: `ios.usesAppleSignIn: true`, the `expo-apple-authentication` plugin,
  and the `@react-native-google-signin/google-signin` plugin (with an
  `iosUrlScheme` **placeholder** you must replace — see step 2).
- `lib/auth/social.ts` implements `signInWithApple()` / `signInWithGoogle()`;
  `configureGoogleSignIn()` runs at launch from `app/_layout.tsx`.
- The auth screen renders Google (iOS+Android) and Apple (iOS only) buttons.

## 1. Apple — Apple Developer + Supabase
1. **developer.apple.com → Identifiers**: on App ID `com.philosophize.app`, enable
   the **Sign in with Apple** capability.
2. Create a **Services ID** (e.g. `com.philosophize.app.signin`) → enable Sign in
   with Apple on it.
3. **Keys** → create a key with **Sign in with Apple** → download the `.p8`
   **once**; note the **Key ID** and your 10-char **Team ID**.
4. **Supabase → Authentication → Providers → Apple**: toggle ON. In **Client IDs**
   add **both** `com.philosophize.app` (the native App ID — required, or the native
   token's audience is rejected) **and** the Services ID, comma-separated. Provide
   the secret (Team ID + Key ID + `.p8`, or the generated JWT). Save.
   - No env var is needed for Apple; the native flow uses the bundle id.
   - **Nonce:** the app does not pass a nonce (the Supabase RN sample omits it). If
     sign-in ever fails with a nonce-mismatch error, enable **Skip nonce checks**
     on the Apple provider too (same toggle as Google in step 2.4).

## 2. Google — Google Cloud + Supabase
1. **Google Cloud Console → APIs & Services → Credentials**: configure the OAuth
   consent screen (External; scopes `email`, `profile`), then create **3 OAuth
   client IDs**:
   - **Web** — gives a client id **and secret** (both go into Supabase).
   - **iOS** — bundle id `com.philosophize.app`; this gives the **iOS URL scheme**
     (reverse of the iOS client id, `com.googleusercontent.apps.XXXX`).
   - **Android** — package `com.philosophize.app` + the **SHA-1** of your signing
     cert (`eas credentials`; also add Google Play's app-signing SHA-1 for prod).
2. **`app.json`** → replace the placeholder in the google-signin plugin:
   `"iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"` with the real
   reversed iOS client id.
3. **`.env.local`**:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com   # the Web client id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...apps.googleusercontent.com   # the iOS client id
   ```
4. **Supabase → Authentication → Providers → Google**: toggle ON. Client ID = the
   **Web** client id, Client Secret = the Web client secret. In **Authorized Client
   IDs** add the **Web, iOS, and Android** client ids (the token's audience is the
   platform client id). Enable **Skip nonce checks** (the library doesn't surface
   the raw nonce by default). Save.

## 3. Build & test (native — required)
```bash
npx expo prebuild --clean          # applies the config plugins / entitlements
eas build --profile development --platform ios      # and/or android
# install the dev build on a device, then:
npx expo start --dev-client
```
Verify on a **real device**:
- iOS shows **both** Google and Apple buttons; Android shows Google only.
- Tapping each completes the native sheet → lands in the app (Profile shows "Sign Out").
- Apple returns name/email **only on the first** authorization (we persist it then).
  To re-test first sign-in: iOS Settings → your Apple ID → Sign in with Apple →
  the app → **Stop Using**.

## ⚠️ App Store rule (Guideline 4.8)
Because the app offers **Google** sign-in on iOS, Apple **requires** Sign in with
Apple on iOS too — they ship together or the build is rejected. (Plain
email/password alone does not trigger this; the ads SDK is not a login.) Apple is
already wired and iOS-gated, so you're covered as long as both providers are
configured.

## Gotchas
- **Native build required** — adding `usesAppleSignIn` / the plugins is a native
  change; it does **not** apply over EAS Update/OTA. Plan a build.
- **Android Apple**: `expo-apple-authentication` is iOS-only, so the Apple button
  is hidden on Android (gated by `Platform.OS === 'ios'` + `isAvailableAsync()`).
- **Google Android `DEVELOPER_ERROR`** = wrong/missing SHA-1 on the Android OAuth
  client (register both the EAS/upload and Play-managed signing SHA-1).
- **Supabase "Unacceptable audience"** = a client id is missing from the provider's
  authorized list (Apple: App ID + Services ID; Google: Web + iOS + Android).
- The `GoogleSignin.signIn()` response shape changed across major versions; the
  code uses the current `isSuccessResponse(response)` + `response.data.idToken`
  form. If a future bump changes it, adjust `lib/auth/social.ts`.

## Where the code lives
| Piece | File |
|---|---|
| Apple/Google client flow + Google config | `lib/auth/social.ts` |
| Web/Expo Go stub (hides buttons) | `lib/auth/social.web.ts` |
| Auth screen (email + social + guest) | `components/shared/AuthPanel.tsx` |
| Google configure-at-launch | `app/_layout.tsx` |
| Native config (plugins, usesAppleSignIn, iosUrlScheme) | `app.json` |
| Google client id env vars | `.env.local` (see `.env.example`) |
| Terms / Privacy URLs | `constants/legal.ts` |
