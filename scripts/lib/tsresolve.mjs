// Let a plain `node` script import the app's own TypeScript data modules.
//
// Node can strip types by itself now, but it still resolves like ESM: it wants a
// file extension, and it knows nothing about the `@/` alias every module here uses.
// Both are one hook away, and having it means a generator can read ALL_PHILOSOPHERS
// as the app composes it rather than scraping the source for `id:` and hoping.
//
// That mattered immediately. Scraping found 434 philosophers, then 515, against a
// real 322 — the surplus being ids belonging to quotes and facts nested inside the
// records — and the duplicate surnames that produced collapsed a
// "unique surname" filter from ~300 usable names to 3. Every downstream number
// would have been quietly wrong.
//
// Used as:  node --import ./scripts/lib/register.mjs script.mjs
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = pathToFileURL(`${process.cwd()}/`).href;

export async function resolve(specifier, context, nextResolve) {
  // The app's alias. tsconfig maps `@/x` to `<root>/x`.
  if (specifier.startsWith('@/')) {
    const base = new URL(specifier.slice(2), ROOT).href;
    for (const ext of ['.ts', '.tsx', '/index.ts', '']) {
      try { return await nextResolve(base + ext, context); } catch { /* next */ }
    }
  }
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Extension-less relative imports: './extra-philosophers/ancient'
    if (specifier.startsWith('.')) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        try { return await nextResolve(specifier + ext, context); } catch { /* next */ }
      }
    }
    throw err;
  }
}
