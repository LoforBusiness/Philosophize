// WHICH LESSONS ARE DIALOGUE LESSONS (LESSON_RULES group AP), and where their parts live.
//
// A dialogue lesson is one whose script gives any beat a `speaker`. That is read out
// of the SOURCE rather than declared in a list, so a lesson cannot be a dialogue lesson
// in one table and a narrated one in another: the generators that must leave these
// lessons alone (thoughts, marks, wardrobe, chair, wander, visitor) and check:dialogue
// all ask this one file.
//
// The lesson → scene → script chain is read from the lesson route the same way
// check-echo reads it: the CINEMATIC map names a component, the component's import
// names a scene file, and a scene's script is `<stem>Script.ts` beside it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = process.env.DIALOGUE_ROOT
  || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(ROOT, 'components', 'lesson', 'cinematic');
const ROUTE = path.join(ROOT, 'app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx');

/** A beat field `speaker: '…'` at the beat's own indent, anywhere in a script. */
const SPEAKER_FIELD = /^\s{4}speaker:\s*'(\w+)'/m;

let cache = null;

/** Every wired lesson, with its scene and script paths (either may be null). */
export function wiredLessons() {
  if (cache) return cache;
  const route = fs.readFileSync(ROUTE, 'utf8');
  const imports = new Map(
    [...route.matchAll(/import \{?\s*(\w+)\s*\}? from '@\/components\/lesson\/cinematic\/(\w+)'/g)]
      .map((m) => [m[1], m[2]]),
  );
  const out = [];
  for (const m of route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)) {
    const [, id, comp] = m;
    const scene = imports.get(comp) ?? null;
    const sceneFile = scene ? path.join(DIR, `${scene}.tsx`) : null;
    const scriptFile = scene ? path.join(DIR, `${scene.replace(/Scene$/, '')}Script.ts`) : null;
    out.push({
      id,
      comp,
      sceneFile: sceneFile && fs.existsSync(sceneFile) ? sceneFile : null,
      scriptFile: scriptFile && fs.existsSync(scriptFile) ? scriptFile : null,
    });
  }
  cache = out;
  return out;
}

/** The dialogue lessons, in route order, with their scene and script paths. */
export function dialogueLessons() {
  return wiredLessons().filter((l) => l.scriptFile && SPEAKER_FIELD.test(fs.readFileSync(l.scriptFile, 'utf8')));
}

const dialogueIds = () => new Set(dialogueLessons().map((l) => l.id));
let idCache = null;

/** Whether a lesson id is a dialogue lesson. */
export function isDialogue(lessonId) {
  if (!idCache) idCache = dialogueIds();
  return idCache.has(lessonId);
}
