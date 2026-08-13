# Sound: real recordings, auditioned and checked

**Date:** 2026-08-13
**Status:** approved (direction), implementing

## The problem

Every clip in `assets/sound/` is synthesised by `scripts/make-sounds.mjs` from noise
and sine partials. That was chosen for two good reasons, both still true: there is
no licence, provenance or attribution to carry, and nothing in a product whose
artwork is entirely hand-drawn was bought in.

It has one weakness, and the generator's own header names it. Synthesis is strong at
**pitched, modal** sound — a bell's partials sit under 3.5 kHz and model well. It is
weak at **complex noise transients** — a leather heel, a clasp, a fingertip on paper
— which live between 4 and 10 kHz. The first set shipped at 22.05 kHz, putting the
Nyquist ceiling at 11 kHz and removing most of that band, and the header records
that this was "a large part of why the first set sounded cheap — not the shapes, the
ceiling."

Three asks, in the user's words: a better way to **listen**, a better way to **add**,
and **good quality, unique** sounds.

## Decisions taken

1. **Samples for the physical cues, synthesis for the pitched ones.** `step`,
   `impact`, `whoosh`, `rethink` and `keep` are re-cut from real recordings.
   `right`, `tick`, `reward`, `badge` and `rankup` stay synthesised — all in D, and
   synthesis is genuinely *better* than a recording for a struck note.

2. **CC0 only, forever free.** The user's constraint is that nothing may ever cost
   money. CC0 also happens to be the only licence that permits committing the source
   files, because it is a public-domain dedication with no redistribution clause.
   Sonniss, Pixabay and the Freesound CC-BY/NC files all forbid redistributing a
   sound "on a standalone basis" — which is exactly what a public repo does. The BBC
   library is personal/educational/research only and is ruled out entirely for a
   monetised app.

3. **One pipeline, either input.** The path from a source recording to a finished cue
   is identical whether the source was downloaded or recorded on a phone. The
   sourcing question therefore stops being load-bearing: start with CC0 material,
   swap in your own recordings later, nothing downstream changes.

4. **The existing checks stay.** `validate-sound.mjs` measures the *files*, not the
   recipe — clicks, clipping, silence, whether a pitched clip contains its note, mix
   balance, whether footfalls land on the foot. All of it keeps working unchanged
   when a clip becomes a sample.

## Architecture

```
assets/sound-src/*.wav        trimmed CC0 excerpts, committed (~100 KB each)
assets/sound-src/SOURCES.md   provenance: file -> origin, licence, date
        |
scripts/sound-cuts.mjs        the cut list: one declarative entry per cue
        |
scripts/cut-sounds.mjs        renders cuts -> assets/sound/*.wav
        |
assets/sound/*.wav            what ships, committed, unchanged in shape
```

### Sources are committed, and trimmed first

Not the raw 30-second field recording — the useful second, already excerpted. At
mono 16-bit 44.1 kHz that is roughly 100 KB per file, so ten sources cost about a
megabyte and the set stays rebuildable from a clean clone. That is the property
`make-sounds.mjs` has today and the one thing a paid library would have taken away.

Raw sources never ship: nothing in `assets/sound-src/` is `require()`d, so it is not
bundled into the app or an OTA update.

### Provenance is checked, not remembered

`SOURCES.md` carries one line per source file: origin URL, licence, date fetched.
`validate-sound.mjs` gains a check that every file in `sound-src/` has an entry and
that every entry reads CC0. "Everything is always free" becomes a build failure
rather than something anyone has to keep in their head.

### The cut list

`scripts/sound-cuts.mjs` exports one entry per sampled cue:

```js
keep: {
  src: 'clasp-01.wav',
  in: 0.042, out: 0.31,      // seconds within the source
  hp: 180, lp: 9000,         // the app's dry, close character
  env: { attack: 0.002, decay: 0.18 },
  gain: 0.8, rate: 44100,
}
```

Numbers in a file, a script that renders them, a validator that measures the output —
the same shape as everything else in this repo. Change a number and the sound
changes; the change is diffable in review.

`scripts/cut-sounds.mjs` reuses `scripts/lib/dsp.mjs` for filtering, enveloping,
levelling and WAV writing, so there is one toolkit and no second bandpass to drift
from the first. The only new primitive is a WAV **reader**; dsp.mjs can currently
write but not read.

### Quality is measured, because nobody involved can hear it

This is the part that addresses "good quality" without relying on my judgement,
which is unreliable by construction. `validate-sound.mjs` gains measurements chosen
for the defects that actually made the first set sound cheap:

- **High-frequency presence.** Every percussive cue must carry real energy in
  4–11 kHz. This is the exact defect the 22.05 kHz ceiling caused, and it is a
  number. Carried as a budget of 2, which may only go down.
- **Attack sharpness.** Time from 10% to 90% of the envelope peak; 12 ms ceiling.
  A crisp transient is a few milliseconds, synthesised mush is slower.
- **The cutter itself**, self-tested against a synthesised source that is awkward in
  the ways a downloaded file is awkward — stereo, 48 kHz, a LIST chunk before the
  audio. No fixture binary in the repo.

Spectral flatness and per-cue format conformance were considered and left out: the
existing validator already checks rate, bit depth and tonality-versus-noise well
enough, and two new numbers that nobody acts on is worse than none.

### Auditioning

`scripts/make-sound-lab.mjs` already renders every candidate side by side with
waveform, spectrum and a hiss score, at the app's real walk cadence and real volume
trims. It gains:

- **The shipping clip first in every role, marked "IN THE APP NOW".** Built — and it
  is the installed bytes read off disk, not a re-render of the recipe, so if
  make-sounds.mjs has drifted from what was installed the lab shows what a reader
  actually hears. This was the missing question: comparing candidates against each
  other answers "which of these five is best" and never answers "is any of them
  better than what we already have?" Five options all worse than the current clip
  look exactly like five options all better.

Deferred, because they need sources to exist before they mean anything: showing the
raw excerpt beside the cut result, and generating candidates by varying the cut-list
numbers.

### Adding a cue

Adding an eleventh cue currently touches five files. One of them stays: `HAPTIC` in
`lib/feedback.ts` is a `Record<Cue, Buzz>`, so TypeScript forces a decision about
whether the new cue buzzes. That is the rule that keeps sound and haptics in step and
it should not be softened. The friction worth removing is making the clip and
registering the file, which the cut list and cutter absorb.

## Non-goals

- Not replacing the five pitched cues.
- Not adding new cues in this change — the path is opened, not walked.
- Not touching `HAPTIC`'s exhaustiveness.
- Not changing anything in the app: `lib/sound/real.ts` keeps requiring the same
  filenames, so nothing about playback, throttling or the Settings toggle moves.

## What the quality check found immediately

Two of the five percussive cues fail the high-frequency floor outright:

| clip | energy below 500 Hz | energy 4–11 kHz |
|---|---|---|
| `impact` | 99.5% | **0.0%** |
| `rethink` | 99.7% | **0.0%** |
| `keep` | 21.4% | 32.9% |
| `step-a` / `step-b` | 4–6% | 19–31% |

Both are 44.1 kHz files, so this is not the sample-rate ceiling — it is the
synthesis. They are pure low thumps with no strike in them. A phone speaker rolls
off hard below about 500 Hz, so `impact` (something in the scene is struck) and
`rethink` (the wrong-answer knock) are probably close to inaudible on the device
while sounding perfectly fine in headphones. That is exactly the class of defect
that testing on good monitors never surfaces.

They are carried as a budget of 2 in `validate-sound.mjs`, may only go down, and are
the first two cues that should be re-cut from real recordings.

## Risks

- **I cannot hear any of this.** Every quality judgement is either a measurement or
  the user's ear in the lab. Nothing in this design asks me to decide whether a
  sound is good, and where I have no measurement I say so.
- **CC0 material must be verified per file.** Freesound hosts CC0, CC-BY and
  CC-BY-NC side by side and only the first is usable here. The provenance check
  enforces the outcome; fetching still requires reading the licence on the page.
- **Seeding depends on finding good CC0 recordings.** If none can be verified, the
  pipeline still lands complete and the cut list waits for sources — the user
  records their own and nothing downstream changes.
