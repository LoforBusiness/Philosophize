import { useEffect, useState } from 'react';
import { Modal, View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/stores/uiStore';
import HardPaywall from '@/components/paywall/HardPaywall';

// The Scholar's Pass offer presented as a dismissible slide-up — raised from a
// locked stop on a branch road, a lesson or a unit review (since the hard
// paywall, 2026-09-25, every lesson needs the Pass). Tapping the backdrop, the
// handle area, or the close button dismisses it and returns the user to where
// they were; so does the Pass arriving, and the stop they tapped is then open.
// Mounted globally in the root layout.
const Page = '#F1EEE7';
const Ink = '#1A1A1A';
const InkFaint = '#D9D7CE';

export default function PaywallSheet() {
  const open = useUIStore((s) => s.paywallOpen);
  const close = useUIStore((s) => s.closePaywall);
  const source = useUIStore((s) => s.paywallSource);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.93);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <MotiView
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setVisible(false)}>
        {open && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { height: H, paddingBottom: insets.bottom }]}
          >
            <View style={styles.handle} />
            <View style={{ flex: 1 }}>
              <HardPaywall source={source} onClose={close} onUnlocked={close} inSheet />
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Page,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 2 },
});
