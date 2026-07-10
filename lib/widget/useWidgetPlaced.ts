import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

// Must match the widget "name" in app.json + the widgetName in render.tsx.
const WIDGET_NAME = 'QuoteOfTheDay';

// Whether the user currently has the Quote widget placed on their phone's home
// screen. Android-only. `null` until the first check resolves, so a CTA gated on
// this stays hidden rather than flashing for someone who already has the widget.
//
// Re-checks on mount and on every return to the foreground — placing or removing
// a widget happens out in the launcher (which backgrounds the app), so coming
// back is exactly when the answer can have changed.
export function useWidgetPlaced(): boolean | null {
  const [placed, setPlaced] = useState<boolean | null>(Platform.OS === 'android' ? null : true);

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      const { getWidgetInfo } = require('react-native-android-widget');
      const info = await getWidgetInfo(WIDGET_NAME);
      setPlaced(Array.isArray(info) && info.length > 0);
    } catch {
      // Native module absent (Expo Go) or the query failed — assume not placed so
      // the CTA still shows rather than vanishing on an error.
      setPlaced(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    check();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  return placed;
}
