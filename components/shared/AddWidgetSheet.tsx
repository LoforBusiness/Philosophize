import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, Image, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import * as Application from 'expo-application';
import { canPinWidget, requestPinWidget } from '@/lib/widget/pinWidget';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';

// Fallback for launchers that don't support the system pin dialog: the manual
// long-press → Widgets → drag path, spelled out. Same bottom-sheet pattern as the
// saved-quotes / ranks sheets.
//
// Step 3 has to name the app, because that is how Android's picker groups widgets
// — under the launcher label, which is `expo.name` compiled into the APK. Reading
// it back off the installed binary means renaming the app can never leave this
// step pointing at a name the picker doesn't show, and needs no edit to do it.
// Web has no launcher and reports null, so that case names nobody rather than
// guessing.
const APP_NAME = Application.applicationName;
const STEPS = [
  'Touch and hold an empty area of your home screen.',
  'Tap “Widgets”.',
  APP_NAME ? `Find “${APP_NAME}” in the list.` : 'Find this app in the list.',
  // Must read exactly as the widget's `label` in app.json — that label is the
  // caption under the thumbnail this step is telling them to drag.
  'Drag the “Quote of the Day” widget where you want it.',
];

export default function AddWidgetSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height } = useWindowDimensions();
  const H = Math.min(Math.round(height * 0.82), 620);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  // Whether we can offer the one-tap system pin dialog (native module present +
  // launcher supports it). When false we show the manual steps instead.
  const canAdd = useMemo(() => canPinWidget(), []);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  // Fire the system "add widget?" dialog. On success it takes over the screen, so
  // we close the sheet; the home screen re-checks placement when it resumes and
  // hides the CTA. On the rare failure we keep the sheet open so nothing is lost.
  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const ok = await requestPinWidget();
      if (ok) onClose();
    } finally {
      setAdding(false);
    }
  };

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <MotiView
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setMounted(false)}>
        {visible && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { maxHeight: H }]}
          >
            <View style={styles.handle} />

            <ScrollView
              contentContainerStyle={styles.inner}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.kicker}>HOME-SCREEN WIDGET</Text>
              <Text style={styles.title}>
                Keep a quote <Text style={styles.titleItalic}>close</Text>
              </Text>
              <Text style={styles.sub}>
                A fresh philosophy quote on your home screen, changing through the day.
              </Text>

              <View style={styles.previewFrame}>
                <Image
                  source={require('../../assets/images/widget-preview.png')}
                  style={styles.preview}
                  resizeMode="contain"
                />
              </View>

              {canAdd ? (
                <>
                  <Pressable
                    onPress={handleAdd}
                    disabled={adding}
                    style={({ pressed }) => [styles.cta, styles.ctaAdd, pressed && { opacity: 0.85 }, adding && { opacity: 0.6 }]}
                  >
                    <Text style={styles.ctaText}>{adding ? 'OPENING…' : 'ADD TO HOME SCREEN'}</Text>
                  </Pressable>
                  <Text style={styles.addHint}>
                    Your phone will ask you to confirm, then drop it on your home screen.
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.steps}>
                    {STEPS.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}>
                          <Text style={styles.stepNumText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.ctaText}>GOT IT</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
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
    backgroundColor: Paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  inner: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 30 },

  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 3, textAlign: 'center' },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Ink, textAlign: 'center', marginTop: 6 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic' },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: InkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 6,
  },

  previewFrame: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: InkFaint,
    borderRadius: 18,
    backgroundColor: '#F1EFE8',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  preview: { width: '100%', height: 130 },

  steps: { marginTop: 22, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: Ink },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Ink, lineHeight: 20 },

  cta: {
    marginTop: 26,
    borderRadius: 12,
    backgroundColor: Ink,
    paddingVertical: 15,
    alignItems: 'center',
  },
  // The one-tap add is the primary action, so it sits right under the preview.
  ctaAdd: { marginTop: 22 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Paper, letterSpacing: 2 },
  addHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: InkSoft,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 10,
  },
});
