# Painted art for the "Arguments Are Not Fights" story scene

Drop your painted PNGs **into this folder** with the exact filenames below. Then
tell Claude "the snowwalk art is in" and it flips each layer on (one line each in
`components/lesson/story/sceneAssets.ts`). Any layer you haven't added yet keeps
its hand-drawn placeholder, so you can add art one piece at a time.

The scene is built from **separate flat layers** that the engine slides at
different speeds to fake depth (parallax), plus a few drifting "extras" and the
two walkers. So every image below is its **own transparent PNG** — do **not**
paint a single combined picture.

---

## The look (paste this into every prompt)

> Hand-painted children's-book illustration in the exact style of *The Boy, the
> Mole, the Fox and the Horse* — loose **ink linework with soft watercolour
> washes**, warm **cream/off-white paper** background, gentle muted winter
> palette (pale blue-grey snow, soft sage, warm ochre accents, sepia-brown ink).
> Visible brush texture, bleeding edges, lots of empty paper, calm and tender
> mood. NOT digital/vector, NOT 3D, NO hard outlines, NO photo-realism.

Add to every prompt: **transparent background, PNG, no border, no frame, no text.**

---

## 1. Background layers (seamless — left edge must tile to right edge)

These scroll sideways forever, so the **left and right edges must match** ("horizontally
tileable / seamless"). Paint them **wide** (≈2048 px wide). Transparent except `sky`.

| File | Size (px) | What to paint | Prompt add-on |
|---|---|---|---|
| `sky.png` | 1080 × 1920 (full screen, **opaque**) | Pale cream winter morning sky, faint cloud washes, soft light from upper-left. Bottom 40% slightly cooler (distant snow haze). | "empty pale winter sky, seamless, no horizon objects" |
| `mountains.png` | 2048 × 600 | A low row of distant **hazy blue-grey hills**, very pale, fading into the paper at the top. | "distant faint hills, seamless tile, transparent above ridge" |
| `treeline-far.png` | 2048 × 520 | A thin far-off **row of small bare winter trees**, pale sepia, low contrast. | "row of tiny bare trees on a snow line, seamless tile, transparent" |
| `trees-mid.png` | 2048 × 700 | Scattered **bare winter trees & shrubs**, mid distance, a little more detail and a touch of sage/ochre. | "scattered bare trees and bushes in snow, seamless tile, transparent" |
| `ground.png` | 2048 × 760 | The **snowy field / path** the men walk on — soft blue-grey snow drifts, faint footprint dimples, transparent along the **top edge** so it sits over the field. | "snow-covered ground with soft drifts, seamless tile, transparent top edge" |
| `foreground.png` | 2048 × 380 | Nearest **snow tufts, dry grass blades, a drift edge** along the very bottom. Higher contrast, darker. | "close-up snowy grass tufts and drift edge along bottom, seamless tile, transparent" |

> **Seamless tip for the AI:** generate at the wide size, then in any editor offset
> the image by 50% horizontally and paint over the seam so the two ends blend.
> (Or ask the model for "tileable / seamless horizontal pattern".)

---

## 2. Drifting extras (single objects, transparent, NOT tileable)

These cross the scene now and then to keep it alive.

| File | Size (px) | What to paint |
|---|---|---|
| `crows.png` | 360 × 120 | 2–3 small **dark birds** in flight, simple ink "M" shapes, slightly different heights. |
| `fox.png` | 280 × 160 | A small **fox in side profile, facing RIGHT**, warm ochre, mid-trot. Loose ink + wash. |
| `lamp.png` | 200 × 480 | An old **iron lamppost** with a soft warm-ochre glow in the lantern. Facing forward. |
| `tree-fg.png` | 600 × 1000 | One **large bare foreground tree**, dark sepia ink, sweeps close to the camera. Tall, only the trunk + low branches need to fit. |

---

## 3. The two walkers (transparent, facing RIGHT)

Full-body, **side profile facing right**, mid-stride, standing on nothing (transparent).
Keep them **small in frame with empty space around** — the engine scales them.

| File | Size (px) | What to paint |
|---|---|---|
| `man1.png` | 520 × 840 | **The first traveller** — eager, a long dark winter coat, no hat, warmer brown tones. Mid-step, faint forward lean. |
| `man2.png` | 520 × 840 | **The second traveller** — calm, a coat **with a terracotta/ochre scarf**, slightly shorter, hands behind back or clasped. Mid-step. |
| `man1-b.png` *(optional)* | 520 × 840 | Same man, **opposite stride** (other leg forward). Gives a real 2-frame walk. |
| `man2-b.png` *(optional)* | 520 × 840 | Same man, opposite stride. |

> The `-b` frames are optional. With them, the engine alternates the two poses
> for a proper walk cycle; without them it animates a single pose with a bob.

Example walker prompt:

> Full-body side profile of a calm middle-aged man walking to the right in deep
> winter, long coat and a terracotta scarf, mid-stride, hand-painted ink &
> watercolour in the style of *The Boy, the Mole, the Fox and the Horse*, warm
> cream paper, muted palette, loose linework, **transparent background, PNG, no
> ground shadow, no frame, no text.**

---

## After you add files

Filenames must match **exactly** (lowercase, hyphens as shown). Put them in this
folder, then ping Claude — it enables each `require(...)` in `sceneAssets.ts` and
the painted layers replace the placeholders with no other changes from you.
