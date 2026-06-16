# Android home-screen widget — "Quote of the Day"

A native Android **App Widget** that shows a philosophy quote and changes it
**every ~3 hours**. Tapping it deep-links into the app and opens that quote's
thinker. Built with [`react-native-android-widget`](https://github.com/sAleksovski/react-native-android-widget)
so the widget UI + update logic live in TypeScript — no Kotlin.

> **Android only**, and like RevenueCat/AdMob it's a **native module**: it does
> NOT run in Expo Go or the web preview, and it only appears on a home screen
> from a real **EAS build** (dev client / internal / store). The code is complete;
> what's left is building and testing on a device/emulator.

---

## How it works (already implemented)

- **Quote rotation** — `lib/dailyQuote.ts → getRotatingQuote()` picks a quote from
  the full ~322-thinker pool using the current **3-hour time bucket**
  (`floor(now / 3h)`), so it's recomputed from the clock with nothing to store.
- **Widget UI** — `components/widget/QuoteWidget.tsx` renders the B&W "paper and
  ink" card using the library's `FlexWidget`/`TextWidget` primitives (these map to
  Android RemoteViews — normal RN components/fonts don't apply here).
- **Headless updates** — `components/widget/widget-task-handler.tsx` is the task
  Android calls for widget events (`WIDGET_ADDED`, `WIDGET_UPDATE`, etc.). It
  recomputes the current quote and re-renders. It's registered in **`index.js`**
  (the app's custom entry) on Android only.
- **Refresh cadence** — `app.json` sets `updatePeriodMillis: 10800000` (3h). The
  OS treats this as approximate (Doze can delay it), but because the quote is
  derived from the current time bucket, whatever shows is always correct for
  "now."
- **Tap → thinker** — the widget root has `clickAction: "OPEN_URI"` with
  `philosophize://thinker/<philosopherId>`. The route `app/thinker/[id].tsx`
  handles that link: it drops the user on the Thinkers tab and opens the
  philosopher's profile sheet.

## Files

| Piece | File |
|---|---|
| rotating-quote logic | `lib/dailyQuote.ts` (`getRotatingQuote`) |
| widget UI | `components/widget/QuoteWidget.tsx` |
| headless task handler | `components/widget/widget-task-handler.tsx` |
| handler registration (custom entry) | `index.js` (+ `package.json` `main`) |
| widget declaration | `app.json` → `react-native-android-widget` plugin |
| deep-link target | `app/thinker/[id].tsx` (+ Stack screen in `app/_layout.tsx`) |

---

## Build & test

```bash
# A native build is required — Expo Go won't show the widget.
eas build --profile development --platform android
# install the .apk on a device/emulator, then:
npx expo start --dev-client
```

On the device:
1. Long-press the home screen → **Widgets** → find **"Philosophize — Quote"**.
2. Drag it onto the home screen. It should render a quote card immediately
   (`WIDGET_ADDED`). Resize it — text reflows.
3. Wait for (or force) an update; the quote changes on the ~3-hour boundary.
   To test quickly, you can temporarily lower `updatePeriodMillis` — but Android's
   real minimum is **30 min** (1,800,000 ms); anything lower is ignored.
4. **Tap the widget** → the app opens to the Thinkers tab with that philosopher's
   profile sheet open (deep link `philosophize://thinker/<id>`).

## Notes / possible enhancements

- **Fonts:** the widget currently uses the system font (italic for the quote) to
  avoid bundling font assets. To match Playfair/Inter exactly, add the .ttf files
  under the plugin's `fonts: [...]` option and set `fontFamily` in `QuoteWidget`.
- **Faster real rotation:** if you want changes more often than the OS schedule
  allows, drive updates from the app with `requestWidgetUpdate(...)` (e.g. on app
  foreground) or a WorkManager task — the current setup is fully OS-driven.
- The custom `index.js` entry is required by the library so the headless widget
  bundle can register its task handler; it's guarded to Android, so web/iOS boot
  through `expo-router/entry` exactly as before.
