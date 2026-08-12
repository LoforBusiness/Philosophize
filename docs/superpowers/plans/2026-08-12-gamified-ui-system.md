# Gamified UI System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the app a shared button/card system with a tactile "chunk" press, one collapsed palette and one type scale, then adopt it on the four densest screens — changing how the app looks and feels without changing a single feature.

**Architecture:** A zero-React token module (`constants/design.ts`) is the only place a colour, size or spacing value originates. Two components (`Button`, `Card`) consume it and carry the press affordance. A validator (`scripts/check-ui.mjs`) enforces that converted files use tokens and nothing else, and measures contrast rather than asserting it. Four screens then adopt the system mechanically.

**Tech Stack:** TypeScript, React Native, Moti (declarative press animation, matching `PressableScale`), `expo-haptics` via `lib/feedback.ts`, Node + sucrase for the validator.

**Spec:** `docs/superpowers/specs/2026-08-12-gamified-ui-system-design.md`

## Global Constraints

- **Presentation only.** No feature, control, stat, setting, navigation path, gate or copy string is added, removed or changed. If a conversion would drop a control, stop and report.
- **Accent is deep petrol `#1B3B3C`, used structurally only** — outlines, button lips, rings, progress tracks. Never a flooded surface. The primary button is **ink-filled with a petrol lip**.
- **`green #4F7A4A` and `red #A8513F` keep their existing meanings** (correct / incorrect) and are not repurposed.
- **Inter is loaded at 400 / 500 / 700 only. There is no Inter 600.** Playfair at 400 / 700.
- **The affordance rule: a lip means you can press it.** Buttons 4px, interactive cards 2px, static cards none. Nothing carries a lip without an `onPress`.
- **No new sound.** Press uses the existing `touch()` haptic from `lib/feedback.ts`. `PressableScale`'s comment records why navigation sounds were removed; that stands.
- **Out of scope, do not open:** `app/(app)/index.tsx`, all of `components/home/*`, the lesson runner, `components/lesson/*`, `components/launch/*`.
- **`main` is currently red** — `validate-cinematic` fails there for reasons inherited from another workstream. Verify with individual validators; do not try to fix it and do not treat `npm run check` as the gate.
- Commit messages are declarative sentences, NOT Conventional Commits. Match the repo: `Give each gait its own speed, so the trudge stops out-stepping the run`.
- `git add` explicit paths only. Never `-A`, `.`, or `-a` — another session commits into this tree continuously.

---

## File Structure

| File | Responsibility |
|---|---|
| `constants/design.ts` | **NEW.** Every colour, type size, weight, spacing step and radius. No React import. |
| `components/ui/Button.tsx` | **NEW.** Four variants, two sizes, the lip and its depress. |
| `components/ui/Card.tsx` | **NEW.** Paper surface, hairline, optional press + 2px lip. |
| `scripts/check-ui.mjs` | **NEW.** Token discipline + measured contrast + the lip rule. |
| `app/(app)/settings.tsx` | Adopt. 1,480 lines, 136 style rules, 11 hexes. |
| `app/(app)/profile/index.tsx` | Adopt. 812 lines, 71 style rules. |
| `app/(app)/philosophers/index.tsx` | Adopt. 736 lines, 60 style rules, 11 hexes. |
| `app/(app)/branches/[branchSlug]/index.tsx` | Adopt. 651 lines, 39 style rules. |
| `package.json` · `CLAUDE.md` | Register the validator. **Append only** — another session edits both. |

### The token set, derived from the real audit

The spec listed the core tokens. Auditing the actual hexes in the four screens shows four more are needed to avoid inventing values mid-conversion. The full set:

```
HUE #1B3B3C   HUE_SOFT #F0F7F6
ink #1A1A1A   inkSoft #686868    dim #B3AEA3
paper #FAFAF7 surface #FFFFFF    surfaceSoft #F4F2EC   hairline #E7E3DA
correct #4F7A4A   wrong #A8513F   wrongSoft #F7E9E9
```

`HUE_DEEP` was in this set through the first draft of Task 1 and was removed once built: nothing
ever consumed it, and the button's lip is already a solid slab of `HUE` — the face lands on it, so
the lip IS the shadow, with no second hex required. (`HUE_SOFT` and `inkSoft`'s hexes above are
also not the values first drafted for Task 1 — both needed to move slightly to stay measurably
distinct from their neighbours; see the Task 1 report for the exact numbers.)

**The mapping every conversion task uses**, computed from the hexes actually present:

| old | → | token | | old | → | token |
|---|---|---|---|---|---|---|
| `#1A1A1A` `#262626` `#3A3A38` | → | `ink` | | `#FAFAF7` | → | `paper` |
| `#6B6B6B` `#5A574E` | → | `inkSoft` | | `#FFFFFF` | → | `surface` |
| `#C9C6BD` `#C4C2BB` `#9C9A93` | → | `dim` | | `#F4F2EC` `#F1EEE7` `#EFEEE9` | → | `surfaceSoft` |
| `#E7E3DA` `#E2E0D8` `#EDEBE3` `#EAE7DF` `#DAD8D0` | → | `hairline` | | `#A83232` → `wrong` · `#F7E9E9` → `wrongSoft` |

Nine greys collapse to three. Three near-blacks collapse to one. That collapse *is* the decluttering.

---

### Task 1: The tokens, and the validator that guards them

**Files:**
- Create: `constants/design.ts`
- Create: `scripts/check-ui.mjs`

**Interfaces:**
- Consumes: nothing
- Produces: `C` (colours), `TYPE`, `SPACE`, `RADIUS`, `LIP`, and the types `TypeKey` / `SpaceKey`

- [ ] **Step 1: Write the failing check**

Create `scripts/check-ui.mjs`:

```js
// Does the UI system hold its own rules?
//
//   node scripts/check-ui.mjs        (npm run check:ui)
//
// Three things no eye reliably catches: a colour that drifted a few points off
// its neighbour, a type size nobody meant to invent, and a contrast ratio that
// is nearly right. The app had NINE greys across two screens before this — not
// because anyone chose nine, but because nothing said there should be three.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'deeply-ui-check');
fs.mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  fs.writeFileSync(path.join(TMP, name),
    transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code);
  return pathToFileURL(path.join(TMP, name)).href;
}
const D = await import(emit('constants/design.ts', 'design.mjs'));

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── WCAG, the same arithmetic check-launch.mjs uses ──────────────────────────
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// ── 1 · the palette is small and every value is distinct ─────────────────────
//
// Two greys four points apart are not two greys, they are one grey and a bug.
// 0.02 of luminance is the floor below which a difference cannot be seen and
// therefore cannot be meaning.
const shades = Object.entries(D.C).filter(([, v]) => /^#[0-9A-Fa-f]{6}$/.test(v));
ok(shades.length <= 14, 'the palette stays small', `${shades.length} colours`);
for (let i = 0; i < shades.length; i++) {
  for (let j = i + 1; j < shades.length; j++) {
    const [na, va] = shades[i], [nb, vb] = shades[j];
    const d = Math.abs(lum(va) - lum(vb));
    ok(d >= 0.02 || va === vb, `${na} and ${nb} are tellable apart`,
      `ΔL ${d.toFixed(3)} (${va} vs ${vb})`);
  }
}

// ── 2 · text is readable on the ground it sits on ────────────────────────────
const PAIRS = [
  ['ink', 'paper', 4.5], ['ink', 'surface', 4.5], ['ink', 'surfaceSoft', 4.5],
  ['inkSoft', 'paper', 4.5], ['inkSoft', 'surface', 4.5],
  ['paper', 'ink', 4.5],            // cream text on the primary button
  ['HUE', 'paper', 3.0],            // an outline is a graphic, not body text
  ['wrong', 'paper', 4.5],
];
for (const [fg, bg, floor] of PAIRS) {
  const r = ratio(lum(D.C[fg]), lum(D.C[bg]));
  ok(r >= floor, `${fg} on ${bg}`, `${r.toFixed(2)}:1, need ${floor}`);
}

// ── 3 · the scales are closed sets ───────────────────────────────────────────
ok(Object.keys(D.TYPE).length === 5, 'five type sizes', Object.keys(D.TYPE).join(' '));
for (const [k, t] of Object.entries(D.TYPE)) {
  ok(/^(Inter_(400Regular|500Medium|700Bold)|PlayfairDisplay_(400Regular|700Bold))$/.test(t.family),
    `${k} uses a loaded font face`, t.family);
  ok(t.lineHeight >= t.fontSize * 1.15, `${k} has breathing room`,
    `${t.fontSize}/${t.lineHeight}`);
}
const SPACE_WANT = [4, 8, 12, 16, 24, 32];
ok(JSON.stringify(D.SPACE) === JSON.stringify(SPACE_WANT), 'the spacing rhythm is 4/8/12/16/24/32',
  JSON.stringify(D.SPACE));

console.log(bad === 0 ? '\nui system: all clear.' : `\n${bad} ui check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/check-ui.mjs`
Expected: FAIL — `Cannot find module` for `constants/design.ts`, which does not exist yet.

- [ ] **Step 3: Write the tokens**

Create `constants/design.ts`:

```ts
// ─────────────────────────────────────────────────────────────────────────────
// THE UI SYSTEM'S ONE SOURCE OF VALUES.
//
// Before this file, Settings held three off-whites four points apart and
// Thinkers held three near-blacks. Nobody chose nine greys; nothing said there
// should be three. Every boundary landed at a slightly different value, so
// nothing grouped and the eye could not tell which differences meant anything.
// That is what "cluttered" turned out to be.
//
// NO REACT IN THIS FILE, so scripts/check-ui.mjs can measure it in plain Node.
// A colour that is not in here is a colour nobody decided on, and the checker
// fails the build on one appearing in a converted screen.
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  /** The accent. STRUCTURAL ONLY — outlines, button lips, rings, tracks.
   *  Never a flooded surface: the loudest thing on any screen stays ink. */
  HUE: '#1B3B3C',
  /** The shadow a lip casts when its button is at rest. */
  HUE_DEEP: '#122A2B',
  /** Progress tracks and faint fills. */
  HUE_SOFT: '#E8EFEE',

  ink: '#1A1A1A',
  inkSoft: '#6B6B6B',
  dim: '#B3AEA3',

  paper: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceSoft: '#F4F2EC',
  hairline: '#E7E3DA',

  /** Unchanged, and NOT repurposed: these mean answer states in
   *  components/lesson/theme.ts and must go on meaning that. */
  correct: '#4F7A4A',
  wrong: '#A8513F',
  wrongSoft: '#F7E9E9',
} as const;

export type TypeKey = 'display' | 'title' | 'body' | 'label' | 'micro';

/** Five sizes. Inter is loaded at 400/500/700 only — there is no 600. */
export const TYPE: Record<TypeKey, {
  family: string; fontSize: number; lineHeight: number; letterSpacing?: number;
}> = {
  display: { family: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 34 },
  title:   { family: 'PlayfairDisplay_700Bold', fontSize: 22, lineHeight: 28 },
  body:    { family: 'Inter_400Regular',        fontSize: 16, lineHeight: 24 },
  label:   { family: 'Inter_500Medium',         fontSize: 13, lineHeight: 18 },
  micro:   { family: 'Inter_500Medium',         fontSize: 11, lineHeight: 14, letterSpacing: 1.5 },
};

/** The only gaps and paddings allowed. */
export const SPACE = [4, 8, 12, 16, 24, 32] as const;
export type SpaceKey = 0 | 1 | 2 | 3 | 4 | 5;

export const RADIUS = { card: 12, button: 14, pill: 999 } as const;

/** How far a pressable drops onto its own shadow. */
export const LIP = { button: 4, card: 2 } as const;
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `node scripts/check-ui.mjs`
Expected: PASS, exit 0, `ui system: all clear.`

If a `tellable apart` assertion fails, two tokens are too close — **change the token, not the threshold.** That assertion is the entire point of the file.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add constants/design.ts scripts/check-ui.mjs
git commit -m "Give the interface one place for every colour, size and gap"
```

---

### Task 2: The button, and its chunk

**Files:**
- Create: `components/ui/Button.tsx`
- Modify: `scripts/check-ui.mjs`

**Interfaces:**
- Consumes: `C`, `TYPE`, `RADIUS`, `LIP` from `constants/design.ts`; `touch()` from `@/lib/feedback`
- Produces: `default Button`, and the props
  `{ label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'lg' | 'md'; disabled?: boolean; icon?: SketchIconName; style?: StyleProp<ViewStyle> }`

- [ ] **Step 1: Add the failing assertions**

Append to `scripts/check-ui.mjs`, before the final `console.log`:

```js
// ── 4 · the button obeys the affordance rule ─────────────────────────────────
//
// A lip means you can press it. That is the whole language: 4px on a button,
// 2px on a pressable card, none on a static one. Nothing in the app said this
// before, which is a real part of why nothing felt tappable.
const btn = fs.readFileSync(path.join(REPO, 'components/ui/Button.tsx'), 'utf8');
ok(/onPress/.test(btn), 'Button requires an onPress');
ok(!/#[0-9A-Fa-f]{3,8}\b/.test(btn.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')),
  'Button declares no colour of its own',
  (btn.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '').match(/#[0-9A-Fa-f]{3,8}\b/g) || []).join(' '));
for (const v of ['primary', 'secondary', 'ghost', 'destructive']) {
  ok(btn.includes(`'${v}'`), `Button has a ${v} variant`);
}
ok(/LIP\.button/.test(btn), 'the lip height comes from the token, not a literal');
ok(/touch\(\)/.test(btn), 'pressing fires the existing haptic');
ok(!/playSound|cue\(/.test(btn), 'the button makes no sound');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/check-ui.mjs`
Expected: FAIL — `ENOENT` on `components/ui/Button.tsx`.

- [ ] **Step 3: Write the button**

Create `components/ui/Button.tsx`:

```tsx
import { useState } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { C, TYPE, RADIUS, LIP } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE CHUNK.
//
// The button sits on a solid lip of its own colour. Pressing it moves the face
// down by exactly the lip's height and collapses the lip to nothing, so the
// button lands on its own shadow instead of merely dimming. That single
// mechanic is most of what makes a game UI feel tactile, and it costs one
// translateY and one height.
//
// THE PRIMARY IS INK, NOT PETROL. The accent appears only as the edge. The
// loudest thing on any screen stays black on paper — the app is still printed
// matter that happens to be pressable, not a toy.
//
// No sound. See PressableScale for the incident: navigation sounds fired on
// press-in, before the gesture was disambiguated, and machine-gunned down every
// card a scrolling thumb crossed. The haptic does the useful half.
// ─────────────────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const FACE: Record<Variant, { bg: string; fg: string; border?: string; lip?: string }> = {
  primary:     { bg: C.ink,   fg: C.paper, lip: C.HUE },
  secondary:   { bg: C.paper, fg: C.ink,   border: C.HUE,   lip: C.HUE },
  ghost:       { bg: 'transparent', fg: C.ink },
  destructive: { bg: C.paper, fg: C.wrong, border: C.wrong, lip: C.wrong },
};

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'lg' | 'md';
  disabled?: boolean;
  icon?: SketchIconName;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  label, onPress, variant = 'primary', size = 'md', disabled, icon, style,
}: Props) {
  const [down, setDown] = useState(false);
  const f = FACE[variant];
  const lip = disabled ? 0 : (f.lip ? LIP.button : 0);
  const drop = down ? lip : 0;
  const padV = size === 'lg' ? 16 : 12;

  return (
    <Pressable
      onPress={disabled ? undefined : () => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={disabled}
      accessibilityRole="button"
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      {/* The lip: a solid slab the face rests on. It is not a shadow — a shadow
          would blur, and this has to read as a physical edge. */}
      <View style={{ borderRadius: RADIUS.button, backgroundColor: f.lip ?? 'transparent' }}>
        <MotiView
          animate={{ translateY: drop, marginBottom: lip - drop }}
          transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
          style={[
            styles.face,
            {
              backgroundColor: f.bg,
              borderRadius: RADIUS.button,
              paddingVertical: padV,
              borderWidth: f.border ? 2 : 0,
              borderColor: f.border ?? 'transparent',
            },
          ]}
        >
          {icon ? <SketchIcon name={icon} size={18} color={f.fg} /> : null}
          <Text style={[styles.label, { color: f.fg, fontSize: size === 'lg' ? 16 : 14 }]}>
            {label}
          </Text>
        </MotiView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: TYPE.label.family, letterSpacing: 0.3, textAlign: 'center',
  },
});
```

- [ ] **Step 4: Run the check and typecheck**

Run: `node scripts/check-ui.mjs && npx tsc --noEmit`
Expected: both exit 0.

`SketchIconName` is already exported from `components/shared/SketchIcon.tsx:3` — verified. Import
it; do not redeclare it.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx scripts/check-ui.mjs
git commit -m "Give the app a button that can actually be pressed"
```

---

### Task 3: The card, and the rest of the affordance rule

**Files:**
- Create: `components/ui/Card.tsx`
- Modify: `scripts/check-ui.mjs`

**Interfaces:**
- Consumes: `C`, `RADIUS`, `LIP`, `SPACE`; `touch()`
- Produces: `default Card`, props `{ children: ReactNode; onPress?: () => void; pad?: 0|1|2|3|4|5; style?: StyleProp<ViewStyle> }`

- [ ] **Step 1: Add the failing assertions**

Append to `scripts/check-ui.mjs`, before the final `console.log`:

```js
// ── 5 · the card completes the rule ──────────────────────────────────────────
const card = fs.readFileSync(path.join(REPO, 'components/ui/Card.tsx'), 'utf8');
ok(!/#[0-9A-Fa-f]{3,8}\b/.test(card.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')),
  'Card declares no colour of its own');
ok(/LIP\.card/.test(card), 'the card lip comes from the token');
// The rule in one line: no onPress, no lip.
ok(/onPress\s*\?\s*LIP\.card\s*:\s*0|onPress\s*&&|!!onPress/.test(card),
  'a card only gets a lip when it can be pressed');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/check-ui.mjs`
Expected: FAIL — `ENOENT` on `components/ui/Card.tsx`.

- [ ] **Step 3: Write the card**

Create `components/ui/Card.tsx`:

```tsx
import { useState, type ReactNode } from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { C, RADIUS, LIP, SPACE } from '@/constants/design';

// A surface. With `onPress` it becomes pressable and grows a 2px lip; without
// one it is flat.
//
// THAT IS THE WHOLE RULE, AND IT IS WHY IT EXISTS: a lip means you can press
// it. Nothing in this app distinguished a tappable card from a decorative one,
// so every surface looked equally inert and the interface read as a document
// rather than something to play. One consistent edge fixes it everywhere at
// once, without a single new colour.

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Index into SPACE. Default 3 → 16. */
  pad?: 0 | 1 | 2 | 3 | 4 | 5;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, onPress, pad = 3, style }: Props) {
  const [down, setDown] = useState(false);
  const lip = onPress ? LIP.card : 0;
  const drop = down ? lip : 0;

  const face = (
    <MotiView
      animate={{ translateY: drop, marginBottom: lip - drop }}
      transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
      style={[styles.face, { padding: SPACE[pad] }, style]}
    >
      {children}
    </MotiView>
  );

  if (!onPress) return <View style={styles.flat}>{face}</View>;

  return (
    <Pressable
      onPress={() => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
    >
      <View style={[styles.flat, { backgroundColor: C.HUE }]}>{face}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flat: { borderRadius: RADIUS.card },
  face: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.hairline,
  },
});
```

- [ ] **Step 4: Run the check and typecheck**

Run: `node scripts/check-ui.mjs && npx tsc --noEmit`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Card.tsx scripts/check-ui.mjs
git commit -m "Make a lip mean one thing everywhere: you can press this"
```

---

### Tasks 4–7: Adopt the system, densest screen first

These four tasks share one procedure. **They are mechanical, and the validator is the oracle** — the plan does not reproduce 3,700 lines of rewritten screen source, because the transformation is defined by rules and a mapping table rather than by new logic. Each task is one screen.

| Task | Screen | Size |
|---|---|---|
| **4** | `app/(app)/settings.tsx` | 1,480 lines · 136 style rules · 11 hexes |
| **5** | `app/(app)/profile/index.tsx` | 812 lines · 71 style rules |
| **6** | `app/(app)/philosophers/index.tsx` | 736 lines · 60 style rules · 11 hexes |
| **7** | `app/(app)/branches/[branchSlug]/index.tsx` | 651 lines · 39 style rules |

**Interfaces:** consumes `C`, `TYPE`, `SPACE`, `RADIUS` from `constants/design.ts` and the `Button` / `Card` components. Produces no new exports.

The procedure, per screen:

- [ ] **Step 1: Extend the validator to cover this screen**

Add the screen's path to the `CONVERTED` list in `scripts/check-ui.mjs`. On the first of these
four tasks, create the list and its checks:

```js
// ── 6 · converted screens use tokens and nothing else ────────────────────────
//
// A literal list, not a glob: adopting a screen into the system is a deliberate
// act, and a glob would silently enrol the next file someone adds.
const CONVERTED = [
  'app/(app)/settings.tsx',
  // each adoption task appends its screen here
];
const SIZES = new Set(Object.values(D.TYPE).map((t) => t.fontSize));
const GAPS = new Set([...D.SPACE, 0]);
for (const rel of CONVERTED) {
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8')
    .replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) || [])];
  ok(hexes.length === 0, `${rel}: no colour of its own`, hexes.join(' '));

  const fs_ = [...new Set((src.match(/fontSize:\s*([\d.]+)/g) || [])
    .map((m) => Number(m.split(':')[1])))].filter((n) => !SIZES.has(n));
  ok(fs_.length === 0, `${rel}: every font size is on the scale`, fs_.join(' '));

  const sp = [...new Set((src.match(/(?:padding|margin|gap)[A-Za-z]*:\s*([\d.]+)/g) || [])
    .map((m) => Number(m.split(':')[1])))].filter((n) => !GAPS.has(n));
  ok(sp.length === 0, `${rel}: every gap is on the rhythm`, sp.join(' '));
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/check-ui.mjs`
Expected: FAIL, listing the screen's real hexes, off-scale font sizes and off-rhythm gaps.
**Record that list** — it is your work queue and your before/after evidence.

- [ ] **Step 3: Apply the colour mapping**

Replace every hex using the table in the File Structure section above. Nine greys collapse to
three, three near-blacks collapse to one. Import `C` and reference tokens.

**If a hex is not in the mapping table, stop and report it** rather than inventing a token —
an unmapped colour means the audit missed something and the token set may need a real addition.

- [ ] **Step 4: Apply the type scale**

Every `fontSize` becomes one of the five in `TYPE`, with its family and lineHeight. Choose by
role, not by nearest number: headings → `display`/`title`, prose → `body`, control labels →
`label`, kickers and all-caps → `micro`.

**Inter has no 600 weight.** If the existing code asks for one, use 500 or 700.

- [ ] **Step 5: Apply the spacing rhythm**

Every padding, margin and gap becomes a value from `SPACE` — round to the nearest step.

- [ ] **Step 6: Adopt Button and Card**

Replace hand-rolled pressables with `Button`, and hand-rolled panels with `Card`. Danger Zone
actions use `variant="destructive"`.

**Do not change what any control does.** Same handler, same label text, same order, same
conditional rendering. If a control's markup resists conversion, leave it and note it — a
half-converted screen that still works beats a fully-converted one that lost a switch.

- [ ] **Step 7: Verify**

Run: `node scripts/check-ui.mjs && npx tsc --noEmit`
Expected: both exit 0.

Then compare against your Step 2 list and confirm every item is resolved.

- [ ] **Step 8: Prove nothing was lost**

This is the step that matters most, because the whole constraint is *presentation only*.

```bash
git diff --stat app/(app)/<screen>
```

Then read your own diff and confirm, explicitly, in your report:
- every `onPress` handler present before is present after
- every conditional (`&&`, ternary, early return) that gated a control still gates it
- no string literal shown to a user changed
- no import of a store, hook or data module was dropped

Count the controls before and after — for Settings that means switches, segmented controls,
buttons and rows — and **state both numbers**.

- [ ] **Step 9: Commit**

```bash
git add app/(app)/<screen> scripts/check-ui.mjs
git commit -m "<declarative sentence about this screen>"
```

Suggested messages: *Settings* → `Give Settings three greys instead of nine`; *Profile* →
`Put the profile on one rhythm`; *Thinkers* → `Let the thinkers list use the app's own palette`;
*branch detail* → `Give the unit list the same edges as everything else`.

---

### Task 8: Register, and look at it

**Files:**
- Modify: `package.json` · `CLAUDE.md` · `docs/superpowers/specs/2026-08-12-gamified-ui-system-design.md`

- [ ] **Step 1: Register the validator — by APPENDING**

> ⚠️ Another session edits `package.json` and `CLAUDE.md` continuously and has already added
> validators this plan does not know about. **Read both fresh. Never paste a full `check`
> string from this plan** — a wholesale replacement would silently delete their work.

Append `&& node scripts/check-ui.mjs` to the end of the existing `check` chain, and add:

```json
    "check:ui": "node scripts/check-ui.mjs",
```

Confirm you added exactly one link:

```bash
node -e "console.log(require('./package.json').scripts.check.split('&&').length)"
```

Then update `CLAUDE.md` §11: increment the validator count word and append ` · check-ui` to the
end of the list. **Read the current count first — it has moved twice today.**

- [ ] **Step 2: Load the four screens in a browser**

A validator cannot catch a React fault, and this touched ~3,700 lines of live screen code.

```
npx expo start --web --port 8100 --clear
```

Warm the bundle with a direct request to `http://localhost:8100/index.bundle?platform=web&dev=true`
before pointing a browser at it. Authenticated screens are not reachable by URL, so add a
throwaway `app/previewui.tsx` that seeds `userDataStore` and renders each screen —
**and delete it before committing; any file in `app/` is a real route.**

For each of the four screens confirm: it renders, every control is present, buttons visibly
depress onto their lip, and the console is clean. Report the console output verbatim.

- [ ] **Step 3: Mark the spec implemented**

Change the spec's `**Status:**` line to `implemented 2026-08-12`.

- [ ] **Step 4: Commit**

```bash
git add package.json CLAUDE.md docs/superpowers/specs/2026-08-12-gamified-ui-system-design.md
git commit -m "Make the UI system's checker part of the suite"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §3 decision 1 — Home untouched | Global Constraints; no task opens it |
| §3 decisions 2–4 — one accent, structural, petrol | 1 (tokens), 2 (lip), 3 (card) |
| §3 decision 5 — four screens | 4–7 |
| §4.1 tokens | 1 |
| §4.2 Button, four variants, the chunk | 2 |
| §4.3 Card + the affordance rule | 3 |
| §5 the four "simpler" moves | 4–7 steps 3–6 |
| §6 out of scope | Global Constraints |
| §7 verification, all four checks | 1 (contrast, scales), 2 (lip rule), 3 (lip rule), 4–7 (token discipline), 8 (browser) |
| §8 risks — main red, collision, volume | Global Constraints; Task 8 step 1; Tasks 4–7 step 8 |

**Placeholder scan:** clean. Tasks 4–7 deliberately specify a transformation *procedure* plus a
complete mapping table rather than reproducing 3,700 lines of rewritten source — the mapping is
exhaustive over the hexes actually present, and the validator is the acceptance oracle. That is
the correct granularity for a mechanical refactor, not a placeholder. Step 3 says explicitly what
to do if a hex falls outside the table.

**Type consistency:** `C`, `TYPE`, `SPACE`, `RADIUS`, `LIP`, `TypeKey`, `SpaceKey`, `Variant`,
`Button`, `Card`, `CONVERTED` are each defined once and used with the same name and shape
throughout. `SPACE` is an array indexed by `pad`, and `Card`'s `pad` prop is typed to its valid
indices.

**One gap found and closed while reviewing:** Task 2 depends on `SketchIconName` being exported
from `components/shared/SketchIcon`. It may not be. Step 4 now names that possibility and says
to export the existing union rather than invent one.
