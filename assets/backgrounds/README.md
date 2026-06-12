# Lesson backgrounds

Parchment / classical backgrounds shown behind the lesson cards.

## How to add yours
1. Save your background images into this folder
   (e.g. `bg-1.png`, `bg-2.png`, … — PNG or JPG, **portrait**, ~1080×1920).
2. Open `components/lesson/lessonBackgrounds.ts` and uncomment / add a
   `require()` line for each image.

Until at least one image is registered there, lessons fall back to a built-in
**procedural parchment**, so the screen still looks good with nothing added.

## Design tips
- Keep the **center relatively light / clear** — the lesson card sits centered
  on top. Decorative elements (columns, statues, ruins, ink, florals) read best
  around the **edges**, exactly like the reference screenshots.
- Portrait orientation, fairly high-res so it stays crisp full-screen.

## Sourcing
Use images you have the rights to: your own, **royalty-free** textures from
Unsplash / Pexels (search "parchment texture", "aged paper", "old manuscript"),
or AI-generated collages. Avoid bundling images scraped from Pinterest — they're
usually copyrighted and not licensed for app distribution.
