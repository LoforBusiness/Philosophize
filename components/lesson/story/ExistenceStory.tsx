import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import SketchIcon from '@/components/shared/SketchIcon';
import LessonReward from '../LessonReward';
import { getBritishVoice } from '@/lib/voice';
import { createDroneAudio, type DroneAudio } from '@/lib/droneAudio';
import type { Lesson } from '@/data/types';

/* -------------------------------------------------------------------------- *
 *  "Why Does Anything Exist?" — a cinematic opening for the metaphysics
 *  branch. The screen goes black for the "imagine nothing" meditation (slow,
 *  long pauses), then on "Now open them" evocative B&W images fade in behind
 *  the narrated text with a slow Ken Burns drift. A deep voice reads the script;
 *  an ambient drone breathes underneath; two questions appear over the imagery.
 * -------------------------------------------------------------------------- */

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;
const absFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const rand = (n: number) => { const x = Math.sin(n * 127.1 + 0.5) * 43758.5453; return x - Math.floor(x); };

// web-only grayscale so the photos match the B&W aesthetic (ignored on native)
const BW = Platform.OS === 'web'
  ? ({ filter: 'grayscale(100%) contrast(1.06) brightness(0.9)' } as unknown as object)
  : null;

// Background plates (CC0, via Openverse). webp + jpg both bundle fine in Expo.
const IMAGES = [
  require('../../../assets/story/existence/01-lone-tree.jpg'),     // 0 tree + lone figure
  require('../../../assets/story/existence/02-clouds.jpg'),        // 1 dramatic clouds
  require('../../../assets/story/existence/03-winter-trees.jpg'),  // 2 bare winter trees
  require('../../../assets/story/existence/04-foggy-mountains.webp'), // 3 foggy mountains
  require('../../../assets/story/existence/05-starry-sky.webp'),   // 4 starry sky / cosmos
  require('../../../assets/story/existence/06-figure.jpg'),        // 5 silhouette figure
  require('../../../assets/story/existence/07-misty-forest.webp'), // 6 misty forest
  require('../../../assets/story/existence/08-sea-horizon.jpg'),   // 7 still water / horizon
];
const TREE = 0, CLOUDS = 1, WINTER = 2, MOUNTAINS = 3, STARS = 4, FIGURE = 5, FOREST = 6, SEA = 7;

interface QOption { id: string; text: string; isCorrect: boolean }
interface Question { prompt: string; options: QOption[]; explanation: string }
interface Seg { mode: 'dark' | 'image'; text: string; img?: number; slow?: boolean; holdAfter?: number; question?: Question }

const Q_LEIBNIZ: Question = {
  prompt: 'Who first famously asked "Why is there something rather than nothing?"',
  options: [
    { id: 'a', text: 'Gottfried Leibniz', isCorrect: true },
    { id: 'b', text: 'Socrates', isCorrect: false },
    { id: 'c', text: 'Immanuel Kant', isCorrect: false },
    { id: 'd', text: 'René Descartes', isCorrect: false },
  ],
  explanation: 'Leibniz raised it in his 1714 essay. It has anchored metaphysics ever since.',
};
const Q_SCIENCE: Question = {
  prompt: 'Why can\'t science fully answer why anything exists at all?',
  options: [
    { id: 'a', text: 'The Big Bang already settled it', isCorrect: false },
    { id: 'b', text: 'Science presumes things exist; it can\'t account for existence itself', isCorrect: true },
    { id: 'c', text: 'Scientists simply aren\'t clever enough yet', isCorrect: false },
    { id: 'd', text: 'The question is too short to be scientific', isCorrect: false },
  ],
  explanation: 'Science begins with things that already exist — particles, energy, laws. It explains how they behave, never why there is anything at all.',
};

const SCRIPT: Seg[] = [
  // ── the blackout meditation: pure black, slow, long pauses ──
  { mode: 'dark', text: 'Close your eyes for a second.', slow: true, holdAfter: 1100 },
  { mode: 'dark', text: 'Imagine… nothing.', slow: true, holdAfter: 950 },
  { mode: 'dark', text: 'No space. No time. No light, no darkness — not even emptiness.', slow: true, holdAfter: 800 },
  { mode: 'dark', text: 'Just nothing.', slow: true, holdAfter: 1300 },
  { mode: 'dark', text: 'Now open them.', slow: true, holdAfter: 400 },
  // ── the world floods back in: images behind the text ──
  { mode: 'image', img: TREE, text: 'Why isn\'t that the case?' },
  { mode: 'image', img: CLOUDS, text: 'This is one of the oldest and deepest questions in all of philosophy: why does anything exist at all?' },
  { mode: 'image', img: MOUNTAINS, text: 'Gottfried Leibniz called it the fundamental question of metaphysics.' },
  { mode: 'image', img: MOUNTAINS, text: 'And centuries later, we still don\'t have a settled answer.', question: Q_LEIBNIZ },
  { mode: 'image', img: STARS, text: 'There are a few major positions philosophers take.' },
  { mode: 'image', img: WINTER, text: 'The first is necessity — the idea that something had to exist. That nothingness is actually impossible.' },
  { mode: 'image', img: WINTER, text: 'Some argue this is true of mathematics, or of God, or of the laws of physics themselves — things that couldn\'t not be.' },
  { mode: 'image', img: FOREST, text: 'The second is contingency — the view that things exist, but they didn\'t have to.' },
  { mode: 'image', img: FOREST, text: 'Everything is an accident of sorts, with no deeper reason behind it. Existence just… is.' },
  { mode: 'image', img: STARS, text: 'The third position, taken by some physicists and philosophers, is that nothing is inherently unstable —' },
  { mode: 'image', img: MOUNTAINS, text: 'that quantum mechanics tells us a true void would immediately produce something. Existence might be the path of least resistance.' },
  { mode: 'image', img: SEA, text: 'But here\'s the philosophical punchline: every answer we give seems to beg the question.' },
  { mode: 'image', img: SEA, text: 'If God created existence — why does God exist? If the laws of physics caused the universe — where did those laws come from?', question: Q_SCIENCE },
  { mode: 'image', img: FIGURE, text: 'Maybe the honest answer is: we don\'t know.' },
  { mode: 'image', img: TREE, text: 'And that\'s not a failure. That\'s what makes metaphysics the frontier of human thought.' },
];

const EMPHASIS = /\b(nothing|exist|existence|metaphysics|leibniz|necessity|contingency|quantum|void|frontier|something)\b/i;

export default function ExistenceStory({ lesson }: { lesson: Lesson }) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0); // words shown so far in this line

  const voiceRef = useRef<string | null>(null);
  const cancelRef = useRef(false);
  const audioRef = useRef<DroneAudio | null>(null);
  const correctRef = useRef(0);
  const totalRef = useRef(0);

  const seg = SCRIPT[Math.min(idx, SCRIPT.length - 1)];
  const progress = idx / Math.max(1, SCRIPT.length - 1);
  const dark = seg.mode === 'dark';

  useEffect(() => {
    getBritishVoice().then((v) => { voiceRef.current = v; });
    const a = createDroneAudio();
    audioRef.current = a;
    a.resume();
    a.setLevel(0.16);
    return () => { Speech.stop(); a.dispose(); audioRef.current = null; };
  }, []);

  useEffect(() => { audioRef.current?.setMuted(!soundOn); }, [soundOn]);

  useEffect(() => {
    setShowQuestion(false);
    setAnswered(false);
    setPicked(null);
    if (SCRIPT[idx]?.mode === 'image') { audioRef.current?.setLevel(0.32); audioRef.current?.swell(); }
    else audioRef.current?.setLevel(0.14);
  }, [idx]);

  // Reveal the line one word at a time (state-driven, so it is deterministic).
  useEffect(() => {
    const s = SCRIPT[idx];
    if (!s) return;
    const total = s.text.split(/\s+/).filter(Boolean).length;
    setRevealed(total > 0 ? 1 : 0); // first word appears at once
    if (total <= 1) return;
    const per = s.mode === 'dark' ? 300 : 200; // slower for the blackout meditation
    let n = 1;
    const id = setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= total) clearInterval(id);
    }, per);
    return () => clearInterval(id);
  }, [idx]);

  const advance = useCallback(() => {
    if (idx + 1 >= SCRIPT.length) setDone(true);
    else setIdx(idx + 1);
  }, [idx]);

  const skip = useCallback(() => {
    audioRef.current?.resume();
    if (seg.question && !answered) { Speech.stop(); cancelRef.current = true; setShowQuestion(true); return; }
    Speech.stop(); cancelRef.current = true; advance();
  }, [seg, answered, advance]);

  // narrate the line, clause-by-clause, with real pauses & a solemn deep voice
  useEffect(() => {
    if (done || idx >= SCRIPT.length) return;
    cancelRef.current = false;
    const s = SCRIPT[idx];
    let chunkTimer: ReturnType<typeof setTimeout> | undefined;
    let errTimer: ReturnType<typeof setTimeout> | undefined;
    let safety: ReturnType<typeof setTimeout> | undefined;

    const go = () => {
      if (cancelRef.current) return;
      cancelRef.current = true;
      if (s.question && !answered) { setShowQuestion(true); return; }
      advance();
    };

    const hold = s.holdAfter ?? 360;
    if (!soundOn) {
      const ms = clamp(s.text.length * (s.slow ? 78 : 58), 1500, 8000) + hold;
      chunkTimer = setTimeout(go, ms);
      return () => { cancelRef.current = true; if (chunkTimer) clearTimeout(chunkTimer); };
    }

    const basePitch = s.slow ? 0.80 : 0.84;
    const baseRate = s.slow ? 0.74 : 0.84;
    const lead = s.slow ? 360 : 240;

    const raw = s.text.match(/[^,;:.!?—]+[,;:.!?—]*/g) ?? [s.text];
    const parts = raw.map((c) => c.trim()).filter(Boolean);
    const chunks: string[] = [];
    for (const c of parts) {
      const words = c.split(/\s+/).length;
      if (chunks.length && words < 3) chunks[chunks.length - 1] += ' ' + c;
      else chunks.push(c);
    }
    const voiceId = voiceRef.current ?? undefined;
    const endQ = /\?\s*$/.test(s.text);
    const n = chunks.length;

    let ci = 0;
    const speakNext = () => {
      if (cancelRef.current) return;
      if (ci >= n) { chunkTimer = setTimeout(go, 600 + hold); return; }
      const c = chunks[ci];
      const i = ci; ci++;
      const isLast = i === n - 1;
      let pitch = basePitch + 0.03 - 0.08 * (n > 1 ? i / (n - 1) : 0);
      let rate = baseRate;
      pitch += (rand(idx * 31 + i) - 0.5) * 0.05;
      rate += (rand(idx * 37 + i) - 0.5) * 0.05;
      if (isLast && endQ) { pitch += 0.10; rate -= 0.06; }
      if (EMPHASIS.test(c)) { rate -= 0.06; pitch += 0.02; }
      pitch = clamp(pitch, 0.66, 1.1);
      rate = clamp(rate, 0.6, 0.96);

      let pause = lead;
      if (i > 0) {
        const prev = chunks[i - 1];
        if (/[,;:]\s*$/.test(prev)) pause = s.slow ? 420 : 280;
        else if (/—\s*$/.test(prev)) pause = s.slow ? 620 : 440;
        else if (/[.!?]\s*$/.test(prev)) pause = s.slow ? 760 : 540;
        else pause = s.slow ? 280 : 190;
      }
      pause += (rand(idx * 41 + i) - 0.5) * 120;
      pause = Math.max(90, pause);

      chunkTimer = setTimeout(() => {
        if (cancelRef.current) return;
        try {
          Speech.speak(c, {
            voice: voiceId, language: 'en-GB', pitch, rate,
            onDone: speakNext,
            onError: () => { errTimer = setTimeout(speakNext, Math.max(700, c.length * 55)); },
          });
        } catch { errTimer = setTimeout(speakNext, 900); }
      }, pause);
    };

    Speech.stop();
    speakNext();

    const totalEst = chunks.reduce((a, c) => a + 380 + c.length * (s.slow ? 92 : 74) + 300, 0) + hold + 1600;
    safety = setTimeout(go, totalEst);

    return () => {
      cancelRef.current = true;
      if (chunkTimer) clearTimeout(chunkTimer);
      if (errTimer) clearTimeout(errTimer);
      if (safety) clearTimeout(safety);
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, soundOn, done]);

  const answer = useCallback((opt: QOption) => {
    if (answered) return;
    setPicked(opt.id);
    setAnswered(true);
    totalRef.current += 1;
    if (opt.isCorrect) correctRef.current += 1;
    try { Haptics.notificationAsync(opt.isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error); } catch {}
  }, [answered]);

  if (done) {
    return (
      <LessonReward
        xp={lesson.xpReward ?? 25}
        correct={correctRef.current}
        total={totalRef.current}
        branchSlug="metaphysics"
        onDone={() => router.back()}
      />
    );
  }

  return (
    <Pressable style={styles.root} onPress={skip}>
      <ExistenceBackground imgIndex={dark ? null : seg.img ?? null} />

      {/* the narrated line — each word appears on its own, in turn */}
      <View style={[styles.captionWrap, dark ? styles.captionCenter : styles.captionLower]} pointerEvents="none">
        <AnimatePresence>
          <MotiView
            key={`c${idx}`}
            style={styles.wordsRow}
            from={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: 'timing', duration: 360, easing: Easing.out(Easing.cubic) }}>
            {seg.text.split(/\s+/).filter(Boolean).map((w, i) => {
              const shown = i < revealed;
              return (
                <MotiView
                  key={`${idx}-${i}`}
                  from={{ opacity: 0, translateY: dark ? 12 : 14, scale: 0.9 }}
                  animate={shown
                    ? { opacity: 1, translateY: 0, scale: 1 }
                    : { opacity: 0, translateY: dark ? 12 : 14, scale: 0.9 }}
                  transition={{ type: 'timing', duration: dark ? 420 : 320, easing: Easing.out(Easing.cubic) }}>
                  <Text style={[styles.caption, dark && styles.captionBig]}>{w + ' '}</Text>
                </MotiView>
              );
            })}
          </MotiView>
        </AnimatePresence>
      </View>

      {/* top controls */}
      <SafeAreaView edges={['top']} style={styles.topSafe} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={10} style={styles.iconBtn}>
            <SketchIcon name="close" size={16} color="#EDEDED" />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>WHY DOES ANYTHING EXIST?</Text>
          <Pressable onPress={() => { audioRef.current?.resume(); setSoundOn((v) => !v); }} hitSlop={10} style={styles.iconBtn}>
            <SketchIcon name={soundOn ? 'volume-on' : 'volume-off'} size={16} color="#EDEDED" />
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </SafeAreaView>

      {/* question over the imagery */}
      {showQuestion && seg.question ? (
        <View style={absFill} pointerEvents="box-none">
          <QuestionOverlay
            question={seg.question}
            picked={picked}
            answered={answered}
            onAnswer={answer}
            onContinue={() => { cancelRef.current = true; advance(); }}
            bottom={insets.bottom + 18}
          />
        </View>
      ) : null}

      {!showQuestion ? (
        <Text style={[styles.tapHint, { bottom: insets.bottom + 8 }]} pointerEvents="none">
          {idx >= SCRIPT.length - 1 ? 'TAP TO FINISH' : 'TAP TO CONTINUE'}
        </Text>
      ) : null}
    </Pressable>
  );
}

/* ----------------------------- background --------------------------------- */
function ExistenceBackground({ imgIndex }: { imgIndex: number | null }) {
  return (
    <View style={absFill} pointerEvents="none">
      <View style={[absFill, { backgroundColor: '#000' }]} />
      <AnimatePresence>
        {imgIndex != null ? (
          <MotiView
            key={`img${imgIndex}`}
            style={absFill}
            from={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.24 }}
            transition={{
              opacity: { type: 'timing', duration: 1500, easing: Easing.out(Easing.cubic) },
              scale: { type: 'timing', duration: 19000, easing: Easing.linear },
            }}>
            <Image source={IMAGES[imgIndex]} resizeMode="cover" style={[absFill, BW as object]} />
          </MotiView>
        ) : null}
      </AnimatePresence>
      {/* darken + bottom weight for legible text */}
      <View style={[absFill, { backgroundColor: 'rgba(0,0,0,0.40)' }]} />
      <View style={styles.bottomScrim} />
      <View style={styles.topScrim} />
    </View>
  );
}

/* ------------------------------- question --------------------------------- */
function QuestionOverlay({ question, picked, answered, onAnswer, onContinue, bottom }: {
  question: Question; picked: string | null; answered: boolean; onAnswer: (o: QOption) => void; onContinue: () => void; bottom: number;
}) {
  return (
    <View style={[styles.qWrap, { paddingBottom: bottom }]} pointerEvents="box-none">
      <MotiView from={{ opacity: 0, translateY: 24 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, easing: Easing.out(Easing.cubic) }} style={styles.qCard}>
        <Text style={styles.qKicker}>A QUESTION</Text>
        <Text style={styles.qPrompt}>{question.prompt}</Text>
        {question.options.map((o) => {
          const isPicked = picked === o.id;
          const reveal = answered && (o.isCorrect || isPicked);
          const bg = !answered ? 'rgba(255,255,255,0.06)' : o.isCorrect ? 'rgba(120,170,140,0.35)' : isPicked ? 'rgba(190,90,90,0.30)' : 'rgba(255,255,255,0.06)';
          return (
            <Pressable key={o.id} disabled={answered} onPress={() => onAnswer(o)} style={[styles.qOption, { backgroundColor: bg }, reveal && { borderColor: '#EDEDED' }]}>
              <Text style={styles.qOptionText}>{o.text}</Text>
              {answered && o.isCorrect ? <Text style={styles.qMark}>✓</Text> : null}
              {answered && isPicked && !o.isCorrect ? <Text style={styles.qMark}>✕</Text> : null}
            </Pressable>
          );
        })}
        {answered ? (
          <>
            <Text style={styles.qExplain}>{question.explanation}</Text>
            <Pressable onPress={onContinue} style={({ pressed }) => [styles.qContinue, pressed && { opacity: 0.85 }]}>
              <Text style={styles.qContinueText}>CONTINUE →</Text>
            </Pressable>
          </>
        ) : null}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },

  captionWrap: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 30 },
  captionCenter: { top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  captionLower: { left: 0, right: 0, bottom: H * 0.16, alignItems: 'center' },
  wordsRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' },
  caption: {
    fontFamily: 'IMFellEnglish_400Regular', fontSize: 24, lineHeight: 34, color: '#F3F1EC', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10,
  },
  captionBig: { fontSize: 30, lineHeight: 42, fontFamily: 'IMFellEnglish_400Regular_Italic' },

  topSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: 'rgba(237,237,237,0.85)', marginHorizontal: 8 },
  progressTrack: { height: 3, marginHorizontal: 14, marginTop: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' },

  bottomScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.4, backgroundColor: 'rgba(0,0,0,0.45)' },
  topScrim: { position: 'absolute', left: 0, right: 0, top: 0, height: H * 0.16, backgroundColor: 'rgba(0,0,0,0.4)' },

  tapHint: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 2, color: 'rgba(237,237,237,0.4)' },

  qWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18 },
  qCard: { backgroundColor: 'rgba(16,16,18,0.92)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', padding: 18 },
  qKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: 'rgba(237,237,237,0.55)' },
  qPrompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 26, color: '#F3F1EC', marginTop: 6, marginBottom: 12 },
  qOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 9 },
  qOptionText: { flex: 1, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, color: '#EDEDED' },
  qMark: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#EDEDED', marginLeft: 8 },
  qExplain: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, lineHeight: 21, color: 'rgba(237,237,237,0.75)', marginTop: 4, marginBottom: 14 },
  qContinue: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  qContinueText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1, color: '#101012' },
});
