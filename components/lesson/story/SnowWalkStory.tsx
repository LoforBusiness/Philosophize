import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import SketchIcon from '@/components/shared/SketchIcon';
import LessonReward from '../LessonReward';
import { getTwoBritishVoices } from '@/lib/voice';
import { createStoryAudio, type StoryAudio } from '@/lib/storyAudio';
import type { Lesson } from '@/data/types';
import PaintScene from './PaintScene';
import {
  SW, FOOT_Y, M1_X, M2_X,
  PAPER, PAPER_HI, TAUPE, INK,
  absoluteFill, rand, clamp,
} from './sceneKit';

/* -------------------------------------------------------------------------- *
 *  "Arguments Are Not Fights" — a painted ink-&-watercolour winter walk in the
 *  spirit of "The Boy, the Mole, the Fox and the Horse". The whole moving
 *  painting lives in <PaintScene/> (parallax planes, scene beats, snow ramp,
 *  dusk grade). This file owns the story: two British voices clause-paced with
 *  real pauses, narrator beats, and questions that appear over the still-living
 *  scene without changing it.
 * -------------------------------------------------------------------------- */

type Speaker = 'narrator' | 'man1' | 'man2';
interface QOption { id: string; text: string; isCorrect: boolean }
interface Question { prompt: string; options: QOption[]; explanation: string }
interface Seg { speaker: Speaker; text: string; gust?: boolean; question?: Question }

const SCRIPT: Seg[] = [
  { speaker: 'narrator', text: 'Snow drifted slowly from the pale morning sky.' },
  { speaker: 'narrator', text: 'The road ahead was quiet, marked only by two sets of footprints.' },
  { speaker: 'narrator', text: 'Two men walked side by side.' },
  { speaker: 'narrator', text: 'For a while, the only sound was the crunch of snow beneath their boots.' },
  { speaker: 'man1', text: 'I think it is going to snow even harder soon.' },
  { speaker: 'narrator', text: 'His companion smiled.' },
  { speaker: 'man2', text: 'Perhaps.' },
  { speaker: 'man1', text: 'Do you disagree?' },
  { speaker: 'man2', text: 'No. I was simply wondering why you think that.' },
  { speaker: 'man1', text: 'The clouds are thicker than they were an hour ago. The wind has picked up. And the air feels colder.', gust: true },
  { speaker: 'man2', text: 'So your conclusion is that more snow is coming.' },
  { speaker: 'man1', text: 'Exactly.' },
  { speaker: 'man2', text: 'And your reasons are the clouds, the wind, and the cold.' },
  { speaker: 'man1', text: 'Yes.' },
  { speaker: 'narrator', text: 'For a moment, they walked on in silence.' },
  { speaker: 'man2', text: 'You know, most people would never call that an argument.' },
  { speaker: 'man1', text: 'Why not?' },
  { speaker: 'man2', text: 'Because when people hear the word argument, they imagine shouting. Raised voices. Anger.' },
  { speaker: 'man1', text: 'My wife certainly does.' },
  { speaker: 'narrator', text: 'Both men laughed.' },
  { speaker: 'man2', text: 'But philosophers mean something quite different. An argument is simply a reason for believing something.' },
  { speaker: 'man1', text: 'A reason?' },
  {
    speaker: 'man2',
    text: 'More precisely, a collection of reasons that support a conclusion.',
    question: {
      prompt: 'In philosophy, an argument is…',
      options: [
        { id: 'a', text: 'A collection of reasons that support a conclusion', isCorrect: true },
        { id: 'b', text: 'A heated disagreement between people', isCorrect: false },
        { id: 'c', text: 'A fact that has been proven true', isCorrect: false },
      ],
      explanation: 'An argument is reasons offered in support of a conclusion — no shouting required.',
    },
  },
  { speaker: 'man1', text: 'So when I said more snow is coming, because of the clouds and the wind...' },
  { speaker: 'man2', text: 'You were making an argument.' },
  { speaker: 'man1', text: 'Even though we were not disagreeing?' },
  { speaker: 'man2', text: 'Especially then.' },
  {
    speaker: 'man2',
    text: 'Arguments are not fights. They are attempts to show why something should be believed.',
    gust: true,
    question: {
      prompt: 'True or false: an argument requires that people disagree.',
      options: [
        { id: 'a', text: 'True', isCorrect: false },
        { id: 'b', text: 'False', isCorrect: true },
      ],
      explanation: 'False. You can give reasons for a conclusion even when everyone already agrees.',
    },
  },
  { speaker: 'man1', text: 'Interesting.' },
  { speaker: 'narrator', text: 'The wind swept softly across the fields.', gust: true },
  { speaker: 'man1', text: 'So if arguments are not fights, then what is logic?' },
  {
    speaker: 'man2',
    text: 'Logic is the study of whether the reasons actually support the conclusion.',
    question: {
      prompt: 'Logic studies…',
      options: [
        { id: 'a', text: 'Whether the reasons actually support the conclusion', isCorrect: true },
        { id: 'b', text: 'How loudly you can argue', isCorrect: false },
        { id: 'c', text: 'Which beliefs are most popular', isCorrect: false },
      ],
      explanation: 'Logic asks whether the reasons really do support the conclusion they are offered for.',
    },
  },
  { speaker: 'man1', text: 'I see.' },
  { speaker: 'narrator', text: 'They walked on, leaving fresh footprints behind them.' },
  { speaker: 'narrator', text: 'And for the first time, the word argument seemed less like a battle...' },
  { speaker: 'narrator', text: '...and more like a path.' },
];

const VOICE: Record<Speaker, { which: 0 | 1; pitch: number; rate: number; lead: number }> = {
  narrator: { which: 0, pitch: 0.8, rate: 0.84, lead: 280 },
  man1: { which: 0, pitch: 1.0, rate: 0.92, lead: 220 }, // eager claimant
  man2: { which: 1, pitch: 0.8, rate: 0.86, lead: 320 }, // calm Socratic
};
const LABEL: Record<Speaker, string | null> = {
  narrator: null,
  man1: 'THE FIRST TRAVELLER',
  man2: 'THE SECOND TRAVELLER',
};

export default function SnowWalkStory({ lesson }: { lesson: Lesson }) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [boil, setBoil] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const pairRef = useRef<[string | null, string | null]>([null, null]);
  const cancelRef = useRef(false);
  const audioRef = useRef<StoryAudio | null>(null);
  const correctRef = useRef(0);
  const totalRef = useRef(0);

  const seg = SCRIPT[Math.min(idx, SCRIPT.length - 1)];
  const progress = idx / Math.max(1, SCRIPT.length - 1);
  const snow = 0.3 + progress * 0.7; // monotonic ramp, always increasing

  // voices + audio engine
  useEffect(() => {
    getTwoBritishVoices().then((p) => { pairRef.current = p; });
    const a = createStoryAudio();
    audioRef.current = a;
    a.resume();
    a.setIntensity(0.3);
    a.startFootsteps(1000, 1060, 330);
    return () => {
      Speech.stop();
      a.dispose();
      audioRef.current = null;
    };
  }, []);

  // one shared boil clock (~7fps discrete redraw) for the whole scene
  useEffect(() => {
    const id = setInterval(() => setBoil((b) => (b + 1) % 3), 150);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { audioRef.current?.setIntensity(snow); }, [snow]);
  useEffect(() => { audioRef.current?.setMuted(!soundOn); }, [soundOn]);
  // reset per-line question state; fire gusts
  useEffect(() => {
    setShowQuestion(false);
    setAnswered(false);
    setPicked(null);
    if (SCRIPT[idx]?.gust) audioRef.current?.gust();
  }, [idx]);

  const advance = useCallback(() => {
    if (idx + 1 >= SCRIPT.length) setDone(true);
    else setIdx(idx + 1);
  }, [idx]);

  const skip = useCallback(() => {
    audioRef.current?.resume();
    // While a question is pending, a tap reveals/keeps the question — never skips it.
    if (seg.question && !answered) {
      Speech.stop();
      cancelRef.current = true;
      setShowQuestion(true);
      return;
    }
    Speech.stop();
    cancelRef.current = true;
    advance();
  }, [seg, answered, advance]);

  // Speak the line (dialogue only), clause-by-clause with real pauses & prosody.
  useEffect(() => {
    if (done || idx >= SCRIPT.length) return;
    cancelRef.current = false;
    const s = SCRIPT[idx];
    const base = VOICE[s.speaker];
    let chunkTimer: ReturnType<typeof setTimeout> | undefined;
    let errTimer: ReturnType<typeof setTimeout> | undefined;
    let safety: ReturnType<typeof setTimeout> | undefined;

    const go = () => {
      if (cancelRef.current) return;
      cancelRef.current = true;
      if (s.question && !answered) { setShowQuestion(true); return; }
      advance();
    };

    const shouldSpeak = soundOn && s.speaker !== 'narrator';
    if (!shouldSpeak) {
      const floor = s.speaker === 'narrator' ? 2000 : 1700;
      const ms = Math.min(7200, Math.max(floor, s.text.length * 55));
      chunkTimer = setTimeout(go, ms);
      return () => { cancelRef.current = true; if (chunkTimer) clearTimeout(chunkTimer); };
    }

    // expo-speech has no SSML / <break> / prosody contour — we synthesise rhythm
    // at the JS layer by chunking on punctuation and chaining utterances.
    const raw = s.text.match(/[^,;:.!?—]+[,;:.!?—]*/g) ?? [s.text];
    const parts = raw.map((c) => c.trim()).filter(Boolean);
    const chunks: string[] = [];
    for (const c of parts) {
      const words = c.split(/\s+/).length;
      if (chunks.length && words < 3) chunks[chunks.length - 1] += ' ' + c;
      else chunks.push(c);
    }
    const voiceId = (pairRef.current[base.which] ?? pairRef.current[0]) ?? undefined;
    const endQ = /\?\s*$/.test(s.text);
    const endX = /!\s*$/.test(s.text);
    const n = chunks.length;

    let ci = 0;
    const speakNext = () => {
      if (cancelRef.current) return;
      if (ci >= n) { chunkTimer = setTimeout(go, 650); return; }
      const c = chunks[ci];
      const i = ci;
      ci++;
      const isLast = i === n - 1;
      let pitch = base.pitch + 0.04 - 0.09 * (n > 1 ? i / (n - 1) : 0);
      let rate = base.rate;
      pitch += (rand(idx * 31 + i) - 0.5) * 0.06;
      rate += (rand(idx * 37 + i) - 0.5) * 0.06;
      if (/[,;:]\s*$/.test(c)) pitch += 0.02;
      if (isLast && endQ) { pitch += 0.12; rate -= 0.08; }
      if (isLast && endX) { pitch += 0.06; rate += 0.05; }
      if (/\b(argument|reason|reasons|logic|especially|exactly|conclusion)\b/i.test(c)) { rate -= 0.06; pitch += 0.03; }
      pitch = clamp(pitch, 0.7, 1.25);
      rate = clamp(rate, 0.78, 1.02);

      let pause = base.lead;
      if (i > 0) {
        const prev = chunks[i - 1];
        if (/[,;:]\s*$/.test(prev)) pause = 260;
        else if (/—\s*$/.test(prev)) pause = 420;
        else if (/[.!?]\s*$/.test(prev)) pause = 520;
        else pause = 180;
      }
      if (isLast && endQ) pause = Math.max(pause, 600);
      pause += (rand(idx * 41 + i) - 0.5) * 120;
      pause = Math.max(80, pause);

      chunkTimer = setTimeout(() => {
        if (cancelRef.current) return;
        try {
          Speech.speak(c, {
            voice: voiceId,
            language: 'en-GB',
            pitch,
            rate,
            onDone: speakNext,
            onError: () => { errTimer = setTimeout(speakNext, Math.max(700, c.length * 55)); },
          });
        } catch {
          errTimer = setTimeout(speakNext, 900);
        }
      }, pause);
    };

    Speech.stop(); // ONCE at line start; never between chunks (drops the next utterance on web)
    speakNext();

    const totalEst = chunks.reduce((a, c) => a + 360 + c.length * 72 + 250, 0) + 1500;
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
    try {
      Haptics.notificationAsync(opt.isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    } catch {}
  }, [answered]);

  if (done) {
    return (
      <LessonReward
        xp={lesson.xpReward ?? 25}
        correct={correctRef.current}
        total={totalRef.current}
        branchSlug="logic"
        lessonId={lesson.id}
        onDone={() => router.back()}
      />
    );
  }

  const speaking = seg.speaker === 'man1' || seg.speaker === 'man2' ? seg.speaker : null;

  return (
    <Pressable style={styles.root} onPress={skip}>
      {/* ---- the living painting (parallax, beats, snow, grade) ---- */}
      <PaintScene progress={progress} snow={snow} boil={boil} speaking={speaking} />

      {/* ---- top controls ---- */}
      <SafeAreaView edges={['top']} style={styles.topSafe} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={10} style={styles.iconBtn}>
            <SketchIcon name="close" size={16} color={INK} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>ARGUMENTS ARE NOT FIGHTS</Text>
          <Pressable onPress={() => { audioRef.current?.resume(); setSoundOn((v) => !v); }} hitSlop={10} style={styles.iconBtn}>
            <SketchIcon name={soundOn ? 'volume-on' : 'volume-off'} size={16} color={INK} />
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </SafeAreaView>

      {/* ---- dialogue caption above the speaker ---- */}
      {speaking && !showQuestion ? <SpeakerCaption key={`b${idx}`} text={seg.text} who={speaking} /> : null}

      {/* ---- narrator subtitle (silent) ---- */}
      {seg.speaker === 'narrator' ? (
        <View style={[styles.narratorWrap, { paddingBottom: insets.bottom + 26 }]} pointerEvents="none">
          <AnimatePresence>
            <MotiView key={`n${idx}`} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -8 }} transition={{ type: 'timing', duration: 360, easing: Easing.out(Easing.cubic) }}>
              <Text style={styles.narration}>{seg.text}</Text>
            </MotiView>
          </AnimatePresence>
        </View>
      ) : null}

      {/* ---- question overlay (scene keeps living behind it) ---- */}
      {showQuestion && seg.question ? (
        <View style={absoluteFill} pointerEvents="box-none">
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

/* ------------------------------- captions --------------------------------- */

function SpeakerCaption({ text, who }: { text: string; who: Speaker }) {
  const bw = Math.min(SW * 0.66, 290);
  const anchorX = who === 'man1' ? M1_X : M2_X;
  const left = Math.max(12, Math.min(SW - bw - 12, anchorX - bw / 2));
  const top = FOOT_Y - 150 - 78;
  return (
    <View style={{ position: 'absolute', left, top, width: bw }} pointerEvents="none">
      <AnimatePresence>
        <MotiView key={text} from={{ opacity: 0, scale: 0.82, translateY: 10 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} exit={{ opacity: 0, scale: 0.9, translateY: -6 }} transition={{ type: 'spring', damping: 15, stiffness: 200, mass: 0.7 }}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleLabel}>{LABEL[who]}</Text>
            <Text style={styles.bubbleText}>{text}</Text>
          </View>
        </MotiView>
      </AnimatePresence>
    </View>
  );
}

function QuestionOverlay({ question, picked, answered, onAnswer, onContinue, bottom }: {
  question: Question; picked: string | null; answered: boolean; onAnswer: (o: QOption) => void; onContinue: () => void; bottom: number;
}) {
  return (
    <View style={[styles.qWrap, { paddingBottom: bottom }]} pointerEvents="box-none">
      <MotiView from={{ opacity: 0, translateY: 24 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 320, easing: Easing.out(Easing.cubic) }} style={styles.qCard}>
        <Text style={styles.qKicker}>A QUESTION</Text>
        <Text style={styles.qPrompt}>{question.prompt}</Text>
        {question.options.map((o) => {
          const isPicked = picked === o.id;
          const reveal = answered && (o.isCorrect || isPicked);
          const bg = !answered ? PAPER_HI : o.isCorrect ? 'rgba(183,194,176,0.5)' : isPicked ? 'rgba(201,139,94,0.4)' : PAPER_HI;
          return (
            <Pressable key={o.id} disabled={answered} onPress={() => onAnswer(o)} style={[styles.qOption, { backgroundColor: bg }, reveal && { borderColor: INK }]}>
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
  root: { flex: 1, backgroundColor: PAPER, overflow: 'hidden' },

  topSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 6, backgroundColor: 'rgba(246,240,226,0.7)', borderWidth: 1, borderColor: 'rgba(58,51,43,0.18)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: INK, marginHorizontal: 8 },
  progressTrack: { height: 3, marginHorizontal: 14, marginTop: 10, borderRadius: 2, backgroundColor: 'rgba(58,51,43,0.15)', overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: INK },

  bubble: { backgroundColor: 'rgba(251,247,238,0.95)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1.5, borderColor: 'rgba(58,51,43,0.35)' },
  bubbleLabel: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 2, color: TAUPE, marginBottom: 5 },
  bubbleText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, lineHeight: 23, color: INK },

  narratorWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 30, alignItems: 'center' },
  narration: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: INK, textAlign: 'center' },

  tapHint: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 2, color: 'rgba(58,51,43,0.4)' },

  qWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18 },
  qCard: { backgroundColor: PAPER_HI, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(58,51,43,0.4)', padding: 18 },
  qKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: TAUPE },
  qPrompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 26, color: INK, marginTop: 6, marginBottom: 12 },
  qOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: 'rgba(58,51,43,0.25)', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 9 },
  qOptionText: { flex: 1, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, color: INK },
  qMark: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK, marginLeft: 8 },
  qExplain: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, lineHeight: 21, color: TAUPE, marginTop: 4, marginBottom: 14 },
  qContinue: { backgroundColor: INK, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  qContinueText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1, color: PAPER },
});
