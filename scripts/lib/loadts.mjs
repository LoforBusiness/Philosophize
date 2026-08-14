// Load one of the zero-import TypeScript modules (camera.ts, rig.ts, tone.ts) into
// a plain Node script, by stripping the types rather than reimplementing the rule.
//
// This is the shim validate-cinematic.mjs has carried inline since the first camera
// check. It is factored out here because a second and third caller now want it —
// make-tours.mjs generates against the same maths the player runs, and check-tour.mjs
// verifies it — and three copies of a transpile step is exactly how a checker ends up
// validating a slightly different camera from the one that ships (which has already
// happened once here; see the H60 note in the rule book).
//
// The zero-import property of those modules is what makes this work at all: with no
// requires to resolve, stripping the types leaves something a bare `new Function` can
// evaluate.
import fs from 'node:fs';

export async function loadTs(file) {
  const tsc = (await import('typescript')).default;
  const exports = {};
  const out = tsc.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: tsc.ModuleKind.CommonJS, target: tsc.ScriptTarget.ES2020 },
  }).outputText;
  new Function('exports', out)(exports);
  return exports;
}
