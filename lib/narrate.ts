import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { getBritishVoice } from './voice';

// ─────────────────────────────────────────────────────────────────────────────
// READING THE LESSON ALOUD — the narration line only.
//
// WHAT GETS READ, AND WHAT MUST NOT. A cinematic beat carries several strings and
// only one of them is narration: `beat.text`, the paragraph in the deck under the
// stickman. `cite` is an attribution, `quote.text` is a saveable quotation, and
// `q.prompt` / `q.choices[].text` are the graded question and its options.
//
// Reading a question aloud is not a small mistake. Two of the choices are wrong on
// purpose and one is a trap that is meant to be tempting (§13) — a narrator that
// reads all four in an even voice either gives the answer away by intonation or
// buries the distinction the beat exists to teach. So this hook takes ONE string
// and the caller passes `beat.text`; nothing here can reach the rest.
//
// ── WHAT DEVICE TTS CAN AND CANNOT DO ───────────────────────────────────────
//
// This is `expo-speech`, which is the OS engine: free, offline, no server, no key,
// and already in the app. On a modern phone with Google's or Apple's neural voices
// it reads clearly and with fair prosody. What it does NOT do is act — there is no
// emotion parameter, and every sentence gets the same delivery.
//
// The three levers that actually exist are the voice (lib/voice.ts already scores
// for an en-GB male and strongly prefers a neural/enhanced/premium engine), the
// rate, and the PUNCTUATION — an engine pauses at a comma, a full stop and a
// dash, so shaping the text is the only real control over pacing. `forSpeech`
// below is that lever.
// ─────────────────────────────────────────────────────────────────────────────

/** Slightly under natural pace: this is exposition, and the reader is also watching. */
export const NARRATION_RATE = 0.92;
/** A touch below default — reads as considered rather than bright. */
export const NARRATION_PITCH = 0.96;

/**
 * The line the Settings picker auditions a voice with.
 *
 * It is a real narration line, from the one lesson that currently speaks. Judging
 * a voice on "Hello, this is a test" tells you about the voice and nothing about
 * the product — the words here are the length, register and punctuation the
 * lessons actually use, so what is auditioned is what will be heard.
 */
export const NARRATION_SAMPLE =
  'Why is there something rather than nothing? Every answer seems to need another answer standing behind it.';

/**
 * Speak the sample exactly as a lesson would.
 *
 * Rate, pitch, language and `forSpeech` are all shared with `useBeatNarration`
 * below, deliberately. An audition rendered at different settings would flatter or
 * libel a voice that then sounds different in the lesson, which would make the
 * picker worse than useless.
 */
export function speakSample(voiceId: string | null) {
  Speech.stop();
  Speech.speak(forSpeech(NARRATION_SAMPLE), {
    voice: voiceId ?? undefined,
    rate: NARRATION_RATE,
    pitch: NARRATION_PITCH,
    language: 'en-GB',
  });
}

/** Silence any audition — leaving the picker must not leave a voice talking. */
export function stopSpeaking() {
  Speech.stop();
}

/**
 * Rewrite a display string into something an engine reads well.
 *
 * All of these are real strings from the lessons, and each one is mangled by a
 * literal reading:
 *
 *   "§7"            → "section 7"    (engines say "s" or nothing at all)
 *   "early 5th c."  → "5th century"  ("c." is read as the letter, or as "circa")
 *   "BCE" / "CE"    → spaced out, so it is not read as a word
 *   "—"             → a comma, which is the pause the dash was doing visually
 *   curly quotes    → straight, since some engines announce them
 */
export function forSpeech(raw: string): string {
  return raw
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/§\s*/g, 'section ')
    .replace(/\bc\.\s*(?=\d)/gi, 'circa ')
    .replace(/(\d)(st|nd|rd|th)\s+c\b\.?/gi, '$1$2 century')
    .replace(/\bBCE\b/g, 'B C E')
    .replace(/\bCE\b/g, 'C E')
    // An em dash is a beat in the writing; a comma is the only way to ask for one.
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speak `text` whenever it changes, and shut up the moment anything else happens.
 *
 * Stopping matters more than starting here. The reader advances by TAPPING, often
 * long before the sentence has finished, so the previous line has to be cut off
 * rather than left to talk over the next one — and leaving the lesson mid-sentence
 * must not leave a voice running over the rest of the app.
 */
export function useBeatNarration(text: string | undefined, enabled: boolean) {
  // The last thing actually handed to the engine, so a re-render with identical
  // text does not restart the sentence from the top.
  const spoken = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !text) {
      Speech.stop();
      spoken.current = null;
      return;
    }
    const line = forSpeech(text);
    if (!line || line === spoken.current) return;
    spoken.current = line;

    let cancelled = false;
    Speech.stop();
    getBritishVoice()
      .then((voice) => {
        if (cancelled) return;
        Speech.speak(line, {
          // `voice: undefined` lets the engine pick its own default, which is what
          // getBritishVoice returns null to mean.
          voice: voice ?? undefined,
          rate: NARRATION_RATE,
          pitch: NARRATION_PITCH,
          language: 'en-GB',
        });
      })
      .catch(() => { /* a device with no TTS engine simply stays silent */ });

    return () => { cancelled = true; };
  }, [text, enabled]);

  // Leaving the lesson — by finishing, backing out, or the app being closed — has
  // to silence it. Separate from the effect above so it cannot be skipped by an
  // early return in a later edit.
  useEffect(() => () => { Speech.stop(); }, []);
}
