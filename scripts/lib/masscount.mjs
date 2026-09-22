// ─────────────────────────────────────────────────────────────────────────────
// HOW MANY TONAL MASSES A SCENE ACTUALLY DRAWS.
//
// `check:shade` has counted this since the tonal pass — it is the ratchet that
// took 111 flat scenes to zero — and `skin-stage` now has to count the same thing
// for the opposite reason: a white tile face SPENDS a mass, so the skin may only
// be applied down to the three-mass floor and no further.
//
// ONE RULE, TWO READERS, which is the discipline this repo applies to every
// generated table. The first draft of the skin's cap re-implemented the count and
// disagreed with `check:shade` about the very first scene it was tested on (0
// against 1), so the cap let 102 scenes fall below the floor while reporting that
// it had held them.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The fills that count as a MASS, in order of weight.
 *
 * PAPER is not one: a white card is the absence of a tone, which is exactly why
 * political7's charter reads against its stone tablet. INK is not one either —
 * every scene already has ink, and a scene of ink and white is the flat case this
 * exists to find.
 */
export const MASSES = ['RULE', 'STONE', 'SHADE', 'SOFT'];

/** Strip comments, for the reason L8 gives: a comment that quotes a fill is not a fill. */
export const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/**
 * Every style entry in the file's StyleSheet, with its own braces balanced.
 *
 * A regex cannot do this: a style value may itself be an object
 * (`shadowOffset: { width, height }`), so `\{[^{}]*\}` stops at the wrong brace.
 */
export function sheetEntries(sheet) {
  const out = [];
  const re = /^\s{2}([A-Za-z_][A-Za-z0-9_]*):\s*\{/gm;
  let m;
  while ((m = re.exec(sheet))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < sheet.length && depth > 0) {
      const c = sheet[i];
      if (c === '{') depth += 1;
      else if (c === '}') depth -= 1;
      i += 1;
    }
    out.push({ name: m[1], text: sheet.slice(m.index, i) });
  }
  return out;
}

/**
 * `{ fills, used, dead }` for one scene's source.
 *
 * A DECLARED FILL IS NOT A DRAWN FILL, AND FOR 87 SCENES IT WAS NEITHER. This used
 * to count `backgroundColor: STONE` anywhere in the file, which includes the
 * StyleSheet — so a style nothing renders counted exactly like one on the stage.
 * The count is what the RENDER BODY reaches: the body is everything before
 * `StyleSheet.create`, a style counts only if `styles.<name>` appears in it, and a
 * fill written inline in the body counts on sight.
 */
export function massFills(src) {
  const s = strip(src);
  const at = s.indexOf('StyleSheet.create(');
  const body = at < 0 ? s : s.slice(0, at);
  const sheet = at < 0 ? '' : s.slice(at);
  const used = new Map();
  const dead = [];
  for (const e of sheetEntries(sheet)) {
    const drawn = new RegExp(`styles\\.${e.name}\\b`).test(body);
    for (const m of e.text.matchAll(/backgroundColor:\s*([A-Z_][A-Z_0-9]*)/g)) {
      if (!MASSES.includes(m[1])) continue;
      if (drawn) used.set(m[1], (used.get(m[1]) ?? 0) + 1);
      else dead.push(`${e.name} is ${m[1]} and nothing renders it`);
    }
  }
  for (const m of body.matchAll(/backgroundColor:\s*([A-Z_][A-Z_0-9]*)/g)) {
    if (MASSES.includes(m[1])) used.set(m[1], (used.get(m[1]) ?? 0) + 1);
  }
  // ── THE SHARED FLOOR IS A MASS, AND MOVING IT NEARLY COST 102 SCENES ───────
  //
  // `skin-stage` replaces each scene's own floor entry with `floorStyle(TONE,
  // GROUND)`, so the fill is now inside `stageSkin` and the text
  // `backgroundColor: RULE` is no longer in the scene. Counting source text, this
  // read as a scene LOSING its ground — the floor is drawn exactly as before, and
  // more of it: the band is `tone.RULE` with `tone.SHADE` along its foot.
  //
  // That is the "a checker's input comes from another instrument" class this repo
  // keeps paying for, and it surfaced as 102 scenes reported flat by a rule the
  // skin's own cap was spending against. Two masses, because the band and its
  // shaded foot are two tones, both drawn, both the width of the stage.
  // SCANNED FOR SEPARATELY, because `sheetEntries` only yields an entry whose value
  // is a BRACE BLOCK — and this one's value is a function call. That is why the
  // first version of this block changed nothing: it looked for `floorStyle(` inside
  // entries the parser never produced.
  for (const m of sheet.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*):\s*floorStyle\(/gm)) {
    if (!new RegExp(`styles\\.${m[1]}\\b`).test(body)) continue;
    used.set('RULE', (used.get('RULE') ?? 0) + 1);
    used.set('SHADE', (used.get('SHADE') ?? 0) + 1);
  }
  // ── AND A DRAWN OBJECT IS A MASS, FOR THE SAME REASON ─────────────────────
  //
  // `<ObjectArt>` paints its parts from `objects.paint()` at run time, so a scene
  // that draws a ship no longer contains the text `backgroundColor: STONE` — and by
  // a source-text count it has just gone flatter while putting MORE tone on the
  // stage than the rectangle it replaced. That is the floor's own lesson arriving
  // in a second place, and it is why this is counted here rather than rediscovered
  // by a scene falling under the floor with nothing wrong with it.
  //
  // Two, and no more than two, whatever the object is made of: every drawing has a
  // lit body and, by `check:objects`' own rules, at most a handful of shaded planes
  // on it. Counting its real part list would make a ship worth eight masses and let
  // one object carry a whole scene, which is not what the ratchet is for.
  for (const m of body.matchAll(/<ObjectArt\b/g)) {
    void m;
    used.set('STONE', (used.get('STONE') ?? 0) + 1);
    used.set('SHADE', (used.get('SHADE') ?? 0) + 1);
    break;                                   // one object's worth, however many it draws
  }
  return { fills: [...used.values()].reduce((a, b) => a + b, 0), used, dead };
}

/** The floor `check:shade` holds and the skin may not spend below. */
export const MIN_MASSES = 3;
