# A gamified UI system — chunky buttons, one palette, four decluttered screens

**Date:** 2026-08-12
**Status:** implemented 2026-08-13.
**Scope:** a new shared UI system, adopted on four screens. No feature is added, removed or changed.

---

## 1. What was asked for

> "I want the app's overall look and buttons and everything about the app to be more like a
> Duolingo look. This does not mean change the app, but simply how the buttons look and react.
> To a more gamified, a more appealing look. I also want cluttered information to be more
> simple to look at and read… I don't want you to change a bunch of the actual features or
> anything, but just how it feels, how it looks."

So: **presentation only.** Every screen keeps every control, every stat and every piece of
content it has today.

## 2. Two findings that shaped the design

**The app has no button.** 54 files hand-roll `<Pressable>`; exactly 4 use `PressableScale`;
there is no shared `Button` and no `components/ui` directory. Buttons are inconsistent because
there is nothing for them to be consistent *with*. This is the highest-leverage fix available
and it is precisely what was asked for.

**The clutter is near-duplicate values, not volume.** Measured across the app:

```
Settings' off-whites:   #F4F2EC   #F1EEE7   #EFEEE9          three, in one file
Settings' greys:        #C9C6BD   #E2E0D8   #5A574E   #6B6B6B
Thinkers' greys:        #EDEBE3 #EAE7DF #E2E0D8 #DAD8D0 #C4C2BB #9C9A93 #6B6B6B
Thinkers' near-blacks:  #1A1A1A   #262626   #3A3A38
```

Nine greys where three would do. Every boundary lands at a slightly different value, so nothing
groups and the eye cannot tell which differences carry meaning. That reads as clutter even when
the content is fine. Settings compounds it with 67 `<Text>` elements against only 3 uses of a
shared row pattern, and 136 style rules.

Density, measured:

| screen | lines | `<Text>` | style rules | hex colours |
|---|---|---|---|---|
| **Settings** | **1,480** | **67** | **136** | **11** |
| Profile | 812 | 28 | 71 | 7 |
| Thinkers | 736 | 21 | 60 | 11 |
| branch detail | 651 | 14 | 39 | 9 |
| Insights | 555 | 16 | 30 | 4 |
| Learn | 213 | 11 | 25 | 8 |
| Home | 337 | 5 | 16 | 7 |

## 3. Decisions taken

| # | Decision | Chosen |
|---|---|---|
| 1 | Home | **Not touched.** Another session is actively rebuilding it — four commits today, including a new `HabitCard` with a streak flame. Home inherits the system later, through its own components. |
| 2 | Colour | **One accent, everything else ink.** |
| 3 | Where the accent goes | **Structural only** — outlines, button lips, rings, progress tracks. Never a flooded surface. |
| 4 | The accent | **Deep petrol `#1B3B3C`.** |
| 5 | Rollout | **System + the four densest screens**: Settings, Profile, Thinkers, branch detail. |

**On decision 4.** Green `#4F7A4A` and red `#A8513F` already mean *correct* and *incorrect* in
`components/lesson/theme.ts`; using either as the brand primary would make every primary button
read as an answer state. `constants/Colors.ts` looks like an alternative source but is
effectively dead — `Colors.green` and `Colors.blue` have zero references and `Colors.gold` is
literally `#1A1A1A`. Petrol collides with nothing, sits beside warm ink without reading as a
smudge, and matches the teal forest scene the launch screen already opens on.

**On decision 3.** The primary button is **ink-filled**, not petrol-filled. Petrol appears only
as its edge. The loudest thing on any screen stays black on paper.

## 4. The system

Three new files. Everything else consumes them.

### 4.1 `constants/design.ts`

The only place a colour, size or spacing value is allowed to originate.

```
HUE       #1B3B3C   petrol — outlines, lips, rings, tracks
HUE_SOFT  #F0F7F6   progress tracks, faint fills

ink       #1A1A1A   inkSoft  #686868   paper #FAFAF7   hairline #E7E3DA
correct   #4F7A4A   wrong    #A8513F                   (unchanged, still spoken for)

TYPE   display  Playfair 700  28/34
       title    Playfair 700  22/28
       body     Inter 400     16/24
       label    Inter 500     13/18
       micro    Inter 500     11/14  +1.5 tracking

SPACE  4 · 8 · 12 · 16 · 24 · 32
RADIUS 12 card · 14 button · 999 pill
```

**No separate shadow colour.** An earlier pass added `HUE_DEEP` for "the pressed shadow beneath a
lip" and it was removed during Task 1: nothing consumed it, and the button's lip is already a
solid slab of `HUE` — the face lands on it, so the lip IS the shadow, with no second hex needed.
The only value that kept `HUE_DEEP` distinct from both `HUE` and `ink` was lighter than `HUE`,
which is backwards for a shadow; a colour and its own shade are meant to read as one material
(see `components/shared/tone.ts` for the rank pins doing this correctly).

Five type sizes and three weights. **Inter is loaded at 400/500/700 only — there is no 600** —
so the scale must not reach for one.

### 4.2 `components/ui/Button.tsx`

```
PRIMARY                        SECONDARY
┌──────────────────────┐       ┌══════════════════════┐  2px petrol outline
│   START LESSON       │ ink   ║   MAYBE LATER        ║  paper fill, ink text
└──────────────────────┘ fill  └══════════════════════┘
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  4px    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  4px petrol lip
                petrol lip

              pressed ↓  translateY +4, lip collapses to 0, 90ms
┌──────────────────────┐
│   START LESSON       │       the button lands on its own shadow
└──────────────────────┘
```

Variants:

| variant | fill | text | outline | lip | used for |
|---|---|---|---|---|---|
| `primary` | ink | cream | — | petrol 4px | the one main action per screen |
| `secondary` | paper | ink | petrol 2px | petrol 4px | the alternative |
| `ghost` | none | ink | — | none | tertiary, cancel, "go back" |
| `destructive` | paper | `wrong` `#A8513F` | `wrong` 2px | `wrong` 4px | Danger Zone only |

`destructive` exists because Settings has a Danger Zone (reset progress, delete account) and
those must not look like an ordinary secondary. It reuses the existing `wrong` red rather than
introducing a colour, so the palette stays at one accent.

Sizes: `lg` (the one primary action) and `md`.

Press routes through the existing `touch()` haptic from `lib/feedback.ts`. **No sound.**
`PressableScale`'s own comment records that navigation sounds were removed after they
machine-gunned during scrolling; that decision stands.

### 4.3 `components/ui/Card.tsx`

Paper fill, 1px hairline, radius 12. Optional `onPress`.

**The affordance rule: a lip means you can press it.** Buttons 4px, interactive cards 2px,
static cards none. Nothing in the app currently distinguishes a tappable card from a decorative
one, which is a real part of why it does not feel gamified. Making the lip mean exactly one
thing gives the whole app a consistent affordance language at no cost.

## 5. What "simpler" means on the four screens

Four mechanical moves. **Nothing is removed.**

| | |
|---|---|
| **Collapse the palette** | 9 greys → `ink` / `inkSoft` / `hairline`. Every value from `design.ts`. |
| **Collapse the type** | Every size to one of the five. Settings alone sheds most of its 136 style rules. |
| **One row, one card** | A `SettingsRow` on `Card`, used ~40 times instead of 40 hand-rolled blocks. Same for the Thinkers list item. |
| **One rhythm** | All padding and gaps from 4/8/12/16/24/32. |

Order: Settings → Profile → Thinkers → branch detail.

§22 requires a settings key to have a reader outside Settings. That test has already run and
everything remaining passes it, so **no control is dropped**.

## 6. Explicitly out of scope

- **Home** — `app/(app)/index.tsx` and all of `components/home/*`. Another session owns it.
- **The lesson runner and cinematic scenes** — they have a deliberate separate design language
  in `components/lesson/theme.ts`. Dragging them in is a different project.
- **Learn and Insights** — already light. They inherit whatever they get from using the shared
  primitives, and are not rewritten.
- **Any behaviour.** No navigation, state, gating, copy or feature changes.

## 7. Verification

`scripts/check-ui.mjs`, following the repo's habit of validators-as-tests.

**"Converted files" means exactly these six**, and the checker holds a literal list so that
adding a screen to the system is a deliberate act rather than an accident:

```
app/(app)/settings.tsx
app/(app)/profile/index.tsx
app/(app)/philosophers/index.tsx
app/(app)/branches/[branchSlug]/index.tsx
components/ui/Button.tsx
components/ui/Card.tsx
```

The checks:

1. **No raw hex** in converted files — colours resolve to `design.ts` or the check fails
2. **No font size or spacing value** outside the scale, in converted files
3. **Contrast measured, not asserted** — cream-on-ink, ink-on-paper, petrol-on-paper and
   inkSoft-on-paper all ≥ 4.5:1
4. **The lip rule holds** — nothing carries a lip without an `onPress`

Then a browser pass over all four screens. A contact sheet cannot catch a module-load or React
fault, and this touches roughly 3,700 lines of live screen code.

## 8. Risks on the record

- **`main` is currently red.** `validate-cinematic` fails on pristine `b501ee0` — inherited from
  the other workstream, unrelated to this. `npm run check` will not pass until they land their
  fix, so this work must verify with individual validators and say so.
- **Collision.** The other session commits to this tree continuously. Work happens in an isolated
  worktree on a branch off `main`, and every commit uses explicit paths.
- **Volume.** Settings is 1,480 lines and 136 style rules. A presentation-only rewrite at that
  size is where regressions hide; the browser pass is not optional.
