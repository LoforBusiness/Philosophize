import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SketchIcon from './SketchIcon';
import { ProfileArtFill } from './ProfileArt';
import { PROFILE_BACKGROUNDS, backgroundById, tonePalette } from '@/data/profileBackgrounds';
import { profileNameStyle, profileNameText } from '@/data/profileFonts';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

// Choosing the artwork. Every swatch is a REAL miniature of the profile header —
// the art, the wash over it, and the name in the face currently chosen — because
// the only thing worth knowing when picking a background is whether your own name
// still reads on it. A grid of raw thumbnails cannot answer that.
export default function ProfileArtSheet({
  visible,
  value,
  fontId,
  name,
  onPick,
  onClose,
}: {
  visible: boolean;
  value: string;
  fontId: string;
  name: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const H = Math.round(height * 0.86);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  if (!mounted) return null;

  const GAP = 12;
  const PAD = 18;
  // Two per row, with a few pixels of headroom. Sizing them to the EXACT
  // available width (2·w + gap === width − 2·pad) is a one-column grid the
  // moment anything takes a pixel — a scrollbar, a rounding, a border — and it
  // fails silently by just looking like a list.
  const cardW = Math.floor((width - PAD * 2 - GAP) / 2) - 3;
  const cardH = Math.round(cardW * 0.72);

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <MotiView
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: 'timing', duration: 220 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setMounted(false)}>
        {visible && (
          <MotiView
            key="art-sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 420, easing: Easing.out(Easing.cubic) }}
            style={[styles.sheet, { height: H }]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={10} style={styles.hBtn}>
                <SketchIcon name="close" size={16} color={Ink} />
              </Pressable>
              <View style={styles.hTitleWrap}>
                <Text style={styles.hKicker}>PICTURE &amp; BACKGROUND</Text>
                <Text style={styles.hName}>Choose your look</Text>
              </View>
              <View style={{ width: 34 }} />
            </View>

            <ScrollView
              contentContainerStyle={{ padding: PAD, paddingBottom: 28 + insets.bottom }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.note}>
                One picture is both your profile picture and the background behind your name.
              </Text>

              <View style={[styles.grid, { gap: GAP }]}>
                {PROFILE_BACKGROUNDS.map((bg) => {
                  const selected = bg.id === value;
                  const pal = tonePalette(bg.tone);
                  return (
                    <Pressable
                      key={bg.id}
                      onPress={() => onPick(bg.id)}
                      style={({ pressed }) => [
                        styles.card,
                        { width: cardW, height: cardH },
                        selected && styles.cardOn,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <ProfileArtFill backgroundId={bg.id} />

                      {/* The point of the swatch: the name, on this art, right now. */}
                      <View style={styles.cardInner}>
                        <Text
                          numberOfLines={1}
                          style={[profileNameStyle(fontId, 15), { color: pal.text }]}
                        >
                          {profileNameText(fontId, name || 'Philosopher')}
                        </Text>
                        <Text style={[styles.cardRank, { color: pal.muted }]}>RANK · NOVICE</Text>
                      </View>

                      {selected ? (
                        <View style={styles.tick}>
                          <SketchIcon name="check" size={13} color={Paper} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.legendRow}>
                <Text style={styles.legend}>
                  {backgroundById(value).name}
                </Text>
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.doneText}>DONE</Text>
              </Pressable>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
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
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, gap: 12 },
  hBtn: {
    width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: Ink,
    alignItems: 'center', justifyContent: 'center',
  },
  hTitleWrap: { flex: 1, alignItems: 'center' },
  hKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: InkSoft, letterSpacing: 2.5 },
  hName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: Ink, marginTop: 1 },

  note: {
    fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: InkSoft,
    marginBottom: 14, includeFontPadding: false,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: InkFaint,
    justifyContent: 'flex-end',
  },
  cardOn: { borderWidth: 3, borderColor: Ink },
  cardInner: { padding: 10 },
  cardRank: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.4, marginTop: 4,
    includeFontPadding: false,
  },
  tick: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12, backgroundColor: Ink,
    alignItems: 'center', justifyContent: 'center',
  },

  legendRow: { alignItems: 'center', marginTop: 16 },
  legend: { fontFamily: 'PlayfairDisplay_700Bold_Italic', fontSize: 15, color: Ink },

  footer: {
    paddingHorizontal: 18, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: InkFaint, backgroundColor: Paper,
  },
  doneBtn: {
    height: 48, borderRadius: 8, backgroundColor: Ink,
    alignItems: 'center', justifyContent: 'center',
  },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Paper, letterSpacing: 2 },
});
