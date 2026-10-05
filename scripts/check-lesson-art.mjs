// THE LESSON PICTURES ARE CURRENT (LESSON_RULES AM13).
//
//   node scripts/check-lesson-art.mjs           (npm run check:lesson-art)
//
// A detailed object drawn in scripts/lib/lessonart/ ships as a PNG baked by
// make-lesson-art.mjs. Edit the drawing and forget to bake it, and the phone shows the old
// picture while the source says otherwise. So every picture's stamp in
// components/lesson/cinematic/lessonArt.ts is re-derived here from its SVG, every PNG must
// exist, and every name a scene asks <LessonPicture> for must be in the table.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ART } from './lib/lessonart/index.mjs';

const REPO = process.cwd();
const stampOf = (svg) => crypto.createHash('sha1').update(svg).digest('hex').slice(0, 12);
const table = fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/lessonArt.ts'), 'utf8');
const bad = [];
for (const a of ART) {
  const body = a.svg();
  const v = a.view, b = a.box;
  const svg = body.startsWith('<svg') ? body
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" width="${b.w}" height="${b.h}" preserveAspectRatio="none">${body}</svg>`;
  const m = table.match(new RegExp(`'${a.name}': \\{[^\\n]*stamp: '([0-9a-f]+)'`));
  if (!m) bad.push(`${a.name}: not in lessonArt.ts — run npm run make:lesson-art`);
  else if (m[1] !== stampOf(svg)) bad.push(`${a.name}: the drawing changed and was not baked — run npm run make:lesson-art`);
  if (!fs.existsSync(path.join(REPO, 'assets/lesson-art', `${a.name}.png`))) bad.push(`${a.name}: assets/lesson-art/${a.name}.png is missing`);
}
const D = path.join(REPO, 'components/lesson/cinematic');
for (const f of fs.readdirSync(D).filter((x) => x.endsWith('Scene.tsx'))) {
  const src = fs.readFileSync(path.join(D, f), 'utf8');
  for (const m of src.matchAll(/<LessonPicture name="([^"]+)"/g)) {
    if (!ART.some((a) => a.name === m[1])) bad.push(`${f}: asks for a picture "${m[1]}" that no drawing makes`);
  }
}
if (bad.length) {
  console.log('check:lesson-art — FAIL\n' + bad.map((x) => `  ${x}`).join('\n'));
  process.exit(1);
}
console.log(`check:lesson-art — ${ART.length} pictures, every one baked from its current drawing`);
