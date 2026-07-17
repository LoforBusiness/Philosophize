import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

// JS side of the WidgetPin native module (modules/widget-pin). It asks the
// launcher to place the Quote widget via Android's system pin dialog. The module
// only exists in a real Android build — it's absent in Expo Go, on web, and in
// any build made before it was added — so every access is guarded and simply
// reports "not available" rather than throwing. Callers fall back to the manual
// add-a-widget instructions when this returns false.

// Must match the widget "name" in app.json and useWidgetPlaced's WIDGET_NAME.
const WIDGET_NAME = 'QuoteOfTheDay';

interface WidgetPinNative {
  isSupported: () => boolean;
  requestPin: (widgetName: string) => Promise<boolean>;
}

let native: WidgetPinNative | null = null;
if (Platform.OS === 'android') {
  try {
    native = requireNativeModule<WidgetPinNative>('WidgetPin');
  } catch {
    native = null; // older build without the module, or native side unavailable
  }
}

// True only when the native module is present AND the launcher supports one-tap
// pinning. Drives whether the sheet shows an "Add" button or manual steps.
export function canPinWidget(): boolean {
  if (!native) return false;
  try {
    return native.isSupported();
  } catch {
    return false;
  }
}

// Ask the launcher to add the widget. Resolves true if the system accepted the
// request (its confirm dialog appears); false if unsupported or unavailable.
// Whether the user actually confirms is detected separately, by re-checking
// placement when the app returns to the foreground (see useWidgetPlaced).
export async function requestPinWidget(): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.requestPin(WIDGET_NAME);
  } catch {
    return false;
  }
}
