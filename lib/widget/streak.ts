import AsyncStorage from '@react-native-async-storage/async-storage';

// Reads the user's current day streak straight from the persisted userDataStore
// blob, so the HEADLESS widget task can show it without the app running. Mirrors
// the app's own rules: the streak counts only if the last lesson was today or
// yesterday (LessonReward's local YYYY-MM-DD dates); otherwise it reads 0.

const USERDATA_KEY = 'philosophize-userdata';

function dateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export async function readWidgetStreak(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(USERDATA_KEY);
    if (!raw) return 0;
    const state = JSON.parse(raw)?.state ?? {};
    const streak = typeof state.streak === 'number' ? state.streak : 0;
    const last = typeof state.lastLessonDate === 'string' ? state.lastLessonDate : null;
    if (!streak || !last) return 0;
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    return last === today || last === yesterday ? streak : 0;
  } catch {
    return 0;
  }
}
