import AsyncStorage from '@react-native-async-storage/async-storage';
import { backgroundById, DEFAULT_WIDGET_BACKGROUND, type WidgetBackground } from '@/components/widget/backgrounds';

// Reads the chosen widget scene straight out of the persisted userDataStore blob,
// exactly the way readWidgetStreak does and for the same reason: the widget task
// is HEADLESS. It runs with no React tree, no Zustand hydration and no app, so it
// cannot ask the store — it has to read the same JSON the store persists.
//
// Never throws and never returns null. A widget that fails to resolve a setting
// should still draw a card; falling back to the first scene is always better than
// a blank rectangle on someone's home screen.

const USERDATA_KEY = 'philosophize-userdata';

export async function readWidgetBackground(): Promise<WidgetBackground> {
  try {
    const raw = await AsyncStorage.getItem(USERDATA_KEY);
    if (!raw) return backgroundById(DEFAULT_WIDGET_BACKGROUND);
    const id = JSON.parse(raw)?.state?.settings?.widgetBackground;
    // backgroundById already falls back on an unknown id, which covers a scene
    // being retired while somebody still has it selected.
    return backgroundById(typeof id === 'string' ? id : DEFAULT_WIDGET_BACKGROUND);
  } catch {
    return backgroundById(DEFAULT_WIDGET_BACKGROUND);
  }
}
