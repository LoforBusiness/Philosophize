# Sound sources

Every file in this folder, where it came from, and under what licence.

`scripts/validate-sound.mjs` fails the build if a `.wav` here has no row below, or
if a row's licence is not **CC0**. That is not paperwork for its own sake — it is
how "all of this is free forever, and none of it can ever start costing money"
stays true without anyone having to remember it.

## Why CC0 only

CC0 is a public-domain dedication: no attribution, no commercial restriction, and —
uniquely among the free options — **no bar on redistributing the file itself**.
Since this repository is public, that last point is the deciding one.

Everything else that looks free carries a clause that a public repo trips over:

| source | why not |
|---|---|
| BBC Sound Effects (33,000 clips) | RemArc licence — personal, educational and research only. A monetised app is outside it. |
| Sonniss GDC bundle | Free and royalty-free for commercial use, but individual sounds may not be redistributed as standalone files. Usable *in* the app; not committable *to* the repo. |
| Pixabay | Free commercially, but the same "not on a standalone basis" clause. |
| Freesound CC-BY / CC-BY-NC | Attribution obligations, or no commercial use at all. Freesound hosts CC0 too — filter for it. |
| Zapsplat free tier | Requires credit unless you pay. |

If you want to use Sonniss or Pixabay material anyway, it is allowed *in the app* —
keep the source out of the repo (add it to `.gitignore`), commit only the cut clip,
and note it below as `not committed`.

## Where to find CC0 audio

- **Freesound**, with the licence filter set to Creative Commons 0. The largest
  practical source; check the licence on each file, because the site mixes CC0,
  CC-BY and CC-BY-NC side by side and only the first is usable here.
- **Your own phone.** Anything you record is yours, needs no licence row beyond
  saying so, and is unique by construction — which is the thing a downloaded clip
  can never be. A quiet room and the actual object beats a library recording of a
  different object almost every time.

## Recording your own

The cues that want real recordings are all small, dry and close, so a phone held
20–30 cm away in a room with soft furnishings is enough. What matters more than the
microphone:

- **Record the real object.** The clasp on an actual bag, a real page turning, a
  pen tip on real paper. `keep` is a quote going into a library — it should sound
  like something closing.
- **Silence around it.** Leave a second before and after; the cut list trims to the
  millisecond and cannot invent quiet that was not there.
- **Several takes in one file.** Ten claspings in thirty seconds gives ten
  candidates to choose between in the lab, at no extra effort.
- **Do not process it.** No noise reduction, no normalising, no EQ. The cut list
  does all of that, and it can only take away what a phone app has already baked in.

Then trim to the useful second, drop it here, add a row, and add an entry to
`scripts/sound-cuts.mjs`.

## The files

| file | cue | origin | licence | added |
|---|---|---|---|---|
| _(none yet)_ | | | | |

Every cue currently ships the synthesised clip from `scripts/make-sounds.mjs`.
