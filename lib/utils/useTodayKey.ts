import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Re-renders the caller whenever the calendar day changes across an app
// foreground — so day-derived UI (e.g. the live streak) refreshes the moment the
// user returns after midnight, instead of showing a value that lapsed while the
// app sat in the background. Same-day foregrounds set an identical key, so React
// bails out and nothing re-renders.
export function useTodayKey(): string {
  const [key, setKey] = useState(dayKey);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setKey(dayKey());
    });
    return () => sub.remove();
  }, []);
  return key;
}
