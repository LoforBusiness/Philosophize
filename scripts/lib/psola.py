# Speed up speech with Praat's pitch-synchronous overlap-add (PSOLA), keeping its pitch.
#
# Used by scripts/retime-narration.mjs. PSOLA cuts or repeats whole periods of the
# voice, so a quicker line keeps the voice's own waveform; a phase vocoder (rubberband)
# re-synthesises it and smears the harmonics. Measured on six dialogue takes at 1.3x
# (scratchpad, 2026-10-01): the voice's harmonics-to-noise ratio fell 1.6 dB under PSOLA
# against 3.7 dB under rubberband and 3.5 under its speech settings, with the pitch held
# by both.
#
# Needs `praat-parselmouth` (pip install praat-parselmouth).
#   python scripts/lib/psola.py <in.wav> <out.wav> <tempo> [<in.wav> <out.wav> <tempo> ...]
import sys
import parselmouth
from parselmouth.praat import call

args = sys.argv[1:]
if not args or len(args) % 3:
    sys.exit('usage: psola.py <in.wav> <out.wav> <tempo> ...')
for k in range(0, len(args), 3):
    src, dst, tempo = args[k], args[k + 1], float(args[k + 2])
    snd = parselmouth.Sound(src)
    # 75–500 Hz covers all four voices (their medians run 120–220 Hz)
    out = call(snd, 'Lengthen (overlap-add)', 75, 500, 1.0 / tempo)
    out.save(dst, 'WAV')
