// C20c · NOTHING MOVES ON A BEAT WHERE IT DID NOT CHANGE — and S12 · A PLATE HOLDS
// ITS WORDS. Both measured by RUNNING the scenes, in plain Node.
//
//   npm run check:replay
//   REPLAY_ONLY=logic-arguments-9 npm run check:replay     # one lesson
//   REPLAY_VERBOSE=1 npm run check:replay                 # the advisory lists too
//   REPLAY_DEBUG=1 …                                      # stack of a style that throws
//   REPLAY_SOURCE="<scene>=<other file>" …                # run a scene from other source
//
// A reader on logic-arguments-9 ("Fallacies of Distraction"): "it looks as if an
// animation above the stickman keeps on repeating itself". It did. The straw copy
// is knocked over on beat 3, and beats 4 and 5 keep it knocked over — but its tip
// was written `STRAW[n] === 2 ? ease01((bt - 1.15) / 0.7) : 0`, and `bt` goes back
// to zero on every tap. So on each of those beats the copy snapped upright and fell
// down again. The rule already existed (C20c, since lesson 1) and nothing checked
// it: `check:smooth` replays the FIGURE, and a prop's track is invisible to it
// unless it is spelled `lerp(T[p], T[n], …)`.
//
// And the same copy was drawn as two siblings — an empty stone tag, and a
// transparent layer on top carrying the words — so that the words would not dim
// with the tag. An empty View with no height is only as tall as its padding, so
// the "tag" was a 13-unit bar ruled through the middle of three lines of text,
// and when it tipped over the words stayed standing. `check:fits` pairs a caption
// with a plate by the plate's declared `top` and `height`, and a plate with no
// height has nothing to pair with.
//
// ── HOW A SCENE IS RUN WITHOUT A PHONE ──────────────────────────────────────
//
// Every scene animates through the same two Reanimated hooks — `useDerivedValue`
// for the frame and `useAnimatedStyle` for what reads it — and imports the same
// handful of modules. So the real scene file is loaded with React, React Native
// and Reanimated replaced by small stand-ins: a hook store keyed by call order
// (which is exactly React's contract), a derived value computed once per frame,
// and an animated style that is a function we can call. `rig`, `moves`, `camera`,
// `cinematicKit` and the script are the REAL modules, so `carry`, `useHeld` and
// every constant are the code the app runs. Child components the scene only
// mounts (Stickman, Target, the player) are stubs, and anything read off a stub
// reads as 0; components the scene file defines itself are rendered, so their
// styles are measured too.
//
// Then the lesson is played the way a patient reader plays it: each beat is
// rendered, its clock stepped at 60fps for REST seconds, then the next beat.
//
// ── WHAT COUNTS, AND THE TEST THAT DECIDES IT ───────────────────────────────
//
// At every beat change, every element visible on both sides is compared on the
// first frame of the new beat against the frame the OLD beat would have drawn next
// had nobody tapped. That comparison is exact for anything the clock keeps moving —
// a wheel turning at speed, a pendulum at the turn of its swing — so only what the
// tap itself changed is left. One that lands somewhere else has JUMPED, in a shape:
//
//   REPLAY  it jumps and then comes back to where it was: its end state did not
//           change, the beat clock reset and it played again.
//   JUMP    it jumps and goes somewhere new: a cut, not a transition.
//   POP     its opacity jumps: it appeared or vanished in one frame.
//
// A shape is not a verdict. A stamp authored to strike again on a beat whose script
// says so is a REPLAY shape and is exactly right. So every jump is put to the one
// question C20c asks — WOULD IT STILL MOVE IF NOTHING HAD CHANGED? The lesson is
// played again with that beat given the previous beat's channels, word for word, and:
//
//   C20c    it still jumps. It moves on a beat where nothing changed. FAILS.
//   CUT     it only jumps because the beat did change — but in one frame instead of
//           a transition (group L). Held to a budget; may only go down.
//   PULSE   an authored one-shot that returns to rest. Not counted.
//
// And two things about the words and the plate they sit on (S12):
//
//   STRIP   a painted View with no children and nothing giving it a height, so it
//           is only as tall as its padding. FAILS.
//   DETACH  words laid over a plate as a separate layer, anchored where the plate
//           is, that do not move when it does — the plate tips, slides or scales
//           and the words stay put. FAILS.
//
// A beat change out of a graded beat is advisory: offline nobody answers, so the
// question's answered state — and any control the scene reads — is not what a
// reader leaves behind. And an element that is MOUNTED or UNMOUNTED at a beat change
// is not compared at all; that pop is a different measurement.
//
// ── AND IT REPORTS WHAT IT COULD NOT RUN ────────────────────────────────────
//
// A checker that measures nothing must not look clean (§21, U2). A scene that
// throws while loading or playing is printed as UNREAD, and UNREAD has a budget.
// An animated style that throws is counted per lesson and printed.
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { loadTs } from './lib/loadts.mjs';

const REPO = process.cwd();
const CIN = path.join(REPO, 'components', 'lesson', 'cinematic');
const ROUTE_FILE = path.join(REPO, 'app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx');
const require = createRequire(import.meta.url);
const { transform } = require(path.join(REPO, 'node_modules', 'sucrase'));

const FIG_DUMP = !!process.env.REPLAY_FIGS;
const ONLY = process.env.REPLAY_ONLY ? new Set(process.env.REPLAY_ONLY.split(',')) : null;
const VERBOSE = !!process.env.REPLAY_VERBOSE;

// ── BUDGETS (high-water marks; they may only go down) ───────────────────────
const C20C_BUDGET = 0;
// N21 — two figures on a stage are talking, so they face each other and the one
// being talked to is not a statue. High-water marks, like every budget here.
const FACING_BUDGET = Number(process.env.FACING_BUDGET ?? 0);
const FROZEN_BUDGET = Number(process.env.FROZEN_BUDGET ?? 0);
const VISITOR_FACE_BUDGET = Number(process.env.VISITOR_FACE_BUDGET ?? 0);
/** Head-and-hand travel through a beat, stage units: over TALKING is a figure doing
 *  something; under STILL is breath alone (group AL left nothing else). */
const TALKING = 12;
const STILL = 4;
const STRIP_BUDGET = 0;
const DETACH_BUDGET = 0;
// A CUT is a jump where the beat really did change — a prop that appears, vanishes
// or moves in one frame instead of in a transition. 304 in 42 lessons on the day this
// was written, every one of them what group L forbids; each wants a person to choose
// the transition, so it is a high-water mark and not a fix list. 302 since
// political-15's night was carried rather than multiplied in (S13). 301 since the
// first tap events (group AH) carried their own values both ways: the house idiom
// `on ? (fade ? grow : 1) : 0` fades a thing IN and switches it OFF between two
// frames, four new events inherited it, and replacing it with `carry` took one of
// the pre-existing cuts with it. 299 once every still tap had its event: two of
// those were first written with the ramp as `carry`'s multiplier, which starts it
// from zero on the first frame, and passing it as the progress took two more cuts.
const CUT_BUDGET = 299;
const UNREAD_BUDGET = 0;
const STYLE_ERROR_BUDGET = 0;

const DT = 1 / 60;
/** How long a patient reader leaves each beat. Long enough for any delayed one-shot. */
const REST = 5;

// A jump is judged against the frame the old beat would have drawn next.
const JUMP = { opacity: 0.3, px: 8, deg: 6, scale: 0.12 };
// "Came back to where it was": the end of the new beat against the end of the old.
const BACK = { opacity: 0.08, px: 3, deg: 2, scale: 0.04 };
/** Below this visibility (effective opacity, times scale) nobody can see a jump. */
const SEEN = 0.15;

// ═════════════════════════════════════════════════════════════════════════════
// THE STAND-INS
// ═════════════════════════════════════════════════════════════════════════════

const STUB = Symbol('stub');
function stubProxy(label) {
  const fn = function () { return stubProxy(`${label}()`); };
  return new Proxy(fn, {
    get(t, k) {
      if (k === STUB) return true;
      if (k === '__esModule') return true;
      // Anything read off a stub as a number is 0: a hook from a stubbed component
      // (`useAnswerLiftValues(…).lift.value`) is the answer reaction at rest.
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'valueOf') return () => 0;
      if (k === 'value') return 0;
      if (k === 'displayName' || k === 'name') return label;
      if (typeof k === 'symbol') return undefined;
      if (k === 'default') return stubProxy(label);
      return stubProxy(`${label}.${String(k)}`);
    },
    apply() { return stubProxy(`${label}()`); },
  });
}

// The hook store. React's only promise is that hooks are called in the same order on
// every render, so a slot per call index is the whole contract.
let CUR = null;
let FRAME = 0;
const TOKENS = new Map();   // animated-style token -> slot
let nextToken = 1;
const newInst = () => ({ slots: [], idx: 0, kids: new Map() });
function hook(init) {
  if (!CUR) return init();
  if (CUR.idx >= CUR.slots.length) CUR.slots.push(init());
  return CUR.slots[CUR.idx++];
}

const ReactStub = {
  __esModule: true,
  useMemo: (fn) => hook(() => ({ v: fn() })).v,
  useRef: (v) => hook(() => ({ current: v })),
  useState: (v) => {
    const s = hook(() => ({ v: typeof v === 'function' ? v() : v }));
    return [s.v, (nv) => { s.v = typeof nv === 'function' ? nv(s.v) : nv; }];
  },
  useReducer: (r, init) => {
    const s = hook(() => ({ v: init }));
    return [s.v, (a) => { s.v = r(s.v, a); }];
  },
  useEffect: () => {}, useLayoutEffect: () => {}, useInsertionEffect: () => {},
  useCallback: (fn) => fn,
  useContext: () => undefined,
  useId: () => 'id',
  createContext: () => ({ Provider: 'Provider', Consumer: 'Consumer' }),
  memo: (c) => c, forwardRef: (c) => c,
  Fragment: 'Fragment',
  createElement: (type, props, ...children) => ({ type, props: { ...(props || {}), children } }),
  Children: { toArray: (c) => (Array.isArray(c) ? c : c == null ? [] : [c]), map: (c, f) => (Array.isArray(c) ? c : [c]).map(f), count: (c) => (Array.isArray(c) ? c.length : c == null ? 0 : 1) },
};
ReactStub.default = ReactStub;

const elementOf = (type, props, key, _static, source) => ({ type, props: props || {}, key, source });
const JsxStub = { __esModule: true, jsx: elementOf, jsxs: elementOf, jsxDEV: elementOf, Fragment: 'Fragment' };

const withFallback = (obj, label) => new Proxy(obj, {
  get(t, k) {
    if (k in t) return t[k];
    if (typeof k === 'symbol') return undefined;
    return stubProxy(`${label}.${String(k)}`);
  },
});

const ABS_FILL = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };
const RNStub = withFallback({
  __esModule: true,
  View: 'View', Text: 'Text', Pressable: 'Pressable', Image: 'Image', ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity', TextInput: 'TextInput',
  StyleSheet: { create: (o) => o, flatten: (s) => mergeStatics(styleParts(s).statics), absoluteFill: ABS_FILL, absoluteFillObject: ABS_FILL, hairlineWidth: 1 },
  Platform: { OS: 'android', select: (o) => (o.android ?? o.native ?? o.default) },
  Dimensions: { get: () => ({ width: 390, height: 844, scale: 2, fontScale: 1 }), addEventListener: () => ({ remove() {} }) },
  useWindowDimensions: () => ({ width: 390, height: 844, scale: 2, fontScale: 1 }),
  PixelRatio: { get: () => 2, roundToNearestPixel: (v) => v },
  I18nManager: { isRTL: false },
}, 'react-native');

const ease = {
  linear: (t) => t, quad: (t) => t * t, cubic: (t) => t * t * t,
  sin: (t) => 1 - Math.cos((t * Math.PI) / 2), exp: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  circle: (t) => 1 - Math.sqrt(1 - t * t), poly: (k) => (t) => Math.pow(t, k),
  back: (s = 1.70158) => (t) => t * t * ((s + 1) * t - s), elastic: () => (t) => t, bounce: (t) => t,
  bezier: () => (t) => t, bezierFn: () => (t) => t, ease: (t) => t, step0: (t) => (t > 0 ? 1 : 0), step1: (t) => (t >= 1 ? 1 : 0),
  in: (f) => f, out: (f) => (t) => 1 - f(1 - t),
  inOut: (f) => (t) => (t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2),
};

function interpolate(x, input, output, extrapolation) {
  const n = input.length;
  if (!n) return 0;
  const mode = (side) => {
    if (!extrapolation) return 'extend';
    if (typeof extrapolation === 'string') return extrapolation;
    return extrapolation[side === 'l' ? 'extrapolateLeft' : 'extrapolateRight'] ?? extrapolation.extrapolate ?? 'extend';
  };
  let k = 0;
  while (k < n - 2 && x > input[k + 1]) k++;
  const x0 = input[k], x1 = input[Math.min(k + 1, n - 1)];
  const y0 = output[k], y1 = output[Math.min(k + 1, n - 1)];
  if (x < input[0] && mode('l') === 'clamp') return output[0];
  if (x > input[n - 1] && mode('r') === 'clamp') return output[n - 1];
  if (x1 === x0) return y0;
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

const chain = () => new Proxy(function () {}, { get: () => chain(), apply: () => chain() });
const Animated = withFallback({
  View: 'Animated.View', Text: 'Animated.Text', ScrollView: 'Animated.ScrollView', Image: 'Animated.Image',
  createAnimatedComponent: (c) => c,
}, 'Animated');
const ReaStub = withFallback({
  __esModule: true,
  default: Animated,
  createAnimatedComponent: (c) => c,
  useSharedValue: (v) => hook(() => ({ value: v })),
  makeMutable: (v) => ({ value: v }),
  useDerivedValue: (fn) => {
    const slot = hook(() => ({ fn, frame: -1, cached: undefined }));
    slot.fn = fn;
    if (!slot.sv) {
      slot.sv = {
        get value() {
          if (slot.frame !== FRAME) { slot.frame = FRAME; slot.cached = slot.fn(); }
          return slot.cached;
        },
        set value(_) {},
      };
    }
    return slot.sv;
  },
  useAnimatedStyle: (fn) => {
    const slot = hook(() => {
      const token = { __animatedStyle: nextToken++ };
      const s = { fn, token, frame: -1, cached: {} };
      TOKENS.set(token, s);
      return s;
    });
    slot.fn = fn;
    return slot.token;
  },
  useAnimatedProps: () => ({}),
  useAnimatedReaction: () => {}, useFrameCallback: () => ({ setActive() {} }),
  useReducedMotion: () => false, useAnimatedRef: () => ({ current: null }),
  withTiming: (v) => v, withSpring: (v) => v, withRepeat: (v) => v, withDelay: (_d, v) => v,
  withSequence: (...a) => a[a.length - 1], cancelAnimation: () => {},
  runOnJS: (f) => f, runOnUI: (f) => f,
  Easing: ease, interpolate, interpolateColor: (_x, _i, o) => o[0],
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  FadeIn: chain(), FadeOut: chain(), FadeInDown: chain(), LinearTransition: chain(), Layout: chain(),
}, 'react-native-reanimated');

// ── MODULE LOADING ─────────────────────────────────────────────────────────
//
// REAL: rig, moves, camera, interact, cinematicKit, Silhouette, every Script, and
// any plain .ts in the cinematic folder; @/constants/design and @/constants/xp.
// STUB: every other .tsx component the scenes mount, and everything native.
const REAL_TSX = new Set(['cinematicKit.tsx', 'Silhouette.tsx']);
const REAL_ALIAS = new Set(['@/constants/design', '@/constants/xp']);

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  let req = request;
  if (req.startsWith('@/')) req = path.join(REPO, req.slice(2));
  try {
    return origResolve.call(this, req, parent, isMain, options);
  } catch (err) {
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      try { return origResolve.call(this, req + ext, parent, isMain, options); } catch { /* next */ }
    }
    throw err;
  }
};

/** While a counterfactual plays, the scene's script is served with these beats. */
let PATCH = null;

function stubFor(request, parent) {
  if (request === 'react') return ReactStub;
  if (request === 'react/jsx-dev-runtime' || request === 'react/jsx-runtime') return JsxStub;
  if (request === 'react-native') return RNStub;
  if (request === 'react-native-reanimated') return ReaStub;
  if (request.startsWith('@/')) return REAL_ALIAS.has(request) ? undefined : stubProxy(request);
  if (!request.startsWith('.') && !path.isAbsolute(request)) {
    if (Module.isBuiltin?.(request)) return undefined;
    return stubProxy(request);
  }
  const file = Module._resolveFilename(request, parent);
  if (file.endsWith('.tsx') && !REAL_TSX.has(path.basename(file)) && !/Scene\.tsx$/.test(file)) {
    return stubProxy(path.basename(file));
  }
  return undefined;
}

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  const s = stubFor(request, parent);
  if (s !== undefined) return s;
  const real = origLoad.apply(this, arguments);
  if (PATCH && request.startsWith('.')) {
    try {
      if (Module._resolveFilename(request, parent) === PATCH.file) return { ...real, BEATS: PATCH.BEATS };
    } catch { /* not the script */ }
  }
  return real;
};

// REPLAY_SOURCE="<file>=<other file>;…" runs a scene from another source, so a
// counter-test can put a defect back without touching the working tree.
const SOURCE = new Map((process.env.REPLAY_SOURCE || '').split(';').filter(Boolean)
  .map((pair) => pair.split('=').map((p) => path.resolve(p))));
const compile = (m, filename) => {
  const src = fs.readFileSync(SOURCE.get(filename) ?? filename, 'utf8');
  const { code } = transform(src, {
    transforms: ['typescript', 'jsx', 'imports'],
    jsxRuntime: 'automatic', production: false, filePath: filename,
  });
  m._compile(code, filename);
};
require.extensions['.ts'] = compile;
require.extensions['.tsx'] = compile;

// ═════════════════════════════════════════════════════════════════════════════
// STYLES AND THE TREE
// ═════════════════════════════════════════════════════════════════════════════

function styleParts(s, out = { statics: [], tokens: [] }) {
  if (!s) return out;
  if (Array.isArray(s)) { for (const x of s) styleParts(x, out); return out; }
  if (typeof s === 'object') {
    if (TOKENS.has(s)) out.tokens.push(s); else out.statics.push(s);
  }
  return out;
}
const mergeStatics = (list) => Object.assign({}, ...list);

function evalToken(token) {
  const slot = TOKENS.get(token);
  if (slot.frame !== FRAME) {
    slot.frame = FRAME;
    try { slot.cached = slot.fn() || {}; } catch (e) {
      if (process.env.REPLAY_DEBUG && !slot.error) console.error(e.stack);
      slot.cached = {}; slot.error = e;
    }
  }
  return slot.cached;
}

/** A link's whole style at the current frame: its statics, then its animated styles. */
const styleOf = (link) => ({ ...mergeStatics(link.statics), ...Object.assign({}, ...link.tokens.map(evalToken)) });

const typeName = (t) => (typeof t === 'string' ? t : t?.displayName || t?.name || 'Component');

function textOf(node, out = []) {
  if (node == null || node === false || node === true) return out;
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out; }
  if (Array.isArray(node)) { for (const c of node) textOf(c, out); return out; }
  if (typeof node === 'object' && node.props) textOf(node.props.children, out);
  return out;
}

const hasChild = (c) => {
  if (c == null || c === false || c === true || c === '') return false;
  if (Array.isArray(c)) return c.some(hasChild);
  return true;
};

/**
 * Walk what the scene returned. Returns every element as a chain of links from the
 * root, each link carrying its static styles and animated tokens, so an element's
 * effective opacity can be multiplied down its ancestors frame by frame.
 */
function walkTree(root, inst, file) {
  const elements = [];
  const visit = (node, chainSoFar, key, owner) => {
    if (node == null || node === false || node === true) return;
    if (Array.isArray(node)) {
      node.forEach((c, k) => visit(c, chainSoFar, `${key}/${c && c.key != null ? `k${c.key}` : k}`, owner));
      return;
    }
    if (typeof node !== 'object' || !('type' in node)) return;
    const { type, props } = node;
    if (typeof type === 'function' && !type[STUB]) {
      // A component defined in the scene file: render it, with its own hook store.
      let kid = owner.kids.get(key);
      if (!kid) { kid = newInst(); owner.kids.set(key, kid); }
      const prev = CUR; CUR = kid; kid.idx = 0;
      let out;
      try { out = type(props); } finally { CUR = prev; }
      visit(out, chainSoFar, `${key}>`, kid);
      return;
    }
    const { statics, tokens } = styleParts(props.style);
    const src = node.source ? `${path.basename(node.source.fileName || file)}:${node.source.lineNumber}` : '';
    const link = {
      type: typeName(type), statics, tokens, src, key,
      // A FIGURE: every `<Stickman D=…>` hands over its pose bundle, so the facing
      // and the place of each figure on a beat can be read off the real scene (N21).
      figD: props && props.D && typeof props.D === 'object' && 'value' in props.D ? props.D : null,
      figRole: props && typeof props.role === 'string' ? props.role : null,
      figK: props && typeof props.k === 'number' ? props.k : 1,
      text: textOf(props.children).join(' ').replace(/\s+/g, ' ').trim(),
      childless: !hasChild(props.children),
    };
    const next = [...chainSoFar, link];
    elements.push(next);
    visit(props.children, next, `${key}.${link.type}`, owner);
  };
  visit(root, [], 'root', inst);
  return elements;
}

const degOf = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return 0;
  if (v.endsWith('rad')) return (parseFloat(v) * 180) / Math.PI;
  return parseFloat(v) || 0;
};

/** The numbers a reader can see move, for one link at the current frame. */
function readLink(link) {
  const s = styleOf(link);
  const out = {
    opacity: s.display === 'none' ? 0 : (s.opacity ?? 1),
    left: +s.left || 0, top: +s.top || 0, width: +s.width || 0, height: +s.height || 0,
    tx: 0, ty: 0, deg: 0, sx: 1, sy: 1,
  };
  for (const t of Array.isArray(s.transform) ? s.transform : []) {
    if (!t || typeof t !== 'object') continue;
    if ('translateX' in t) out.tx += +t.translateX || 0;
    if ('translateY' in t) out.ty += +t.translateY || 0;
    if ('rotate' in t) out.deg += degOf(t.rotate);
    if ('rotateZ' in t) out.deg += degOf(t.rotateZ);
    if ('skewX' in t) out.deg += degOf(t.skewX);
    if ('scale' in t) { out.sx *= +t.scale; out.sy *= +t.scale; }
    if ('scaleX' in t) out.sx *= +t.scaleX;
    if ('scaleY' in t) out.sy *= +t.scaleY;
  }
  return out;
}

/** What is measured about one element: its geometry, and how visible it is. */
function readElement(chainLinks) {
  let eff = 1;
  let size = 1;
  let own = null;
  for (const link of chainLinks) {
    const r = readLink(link);
    eff *= Math.max(0, Math.min(1, +r.opacity || 0));
    size *= Math.min(1, Math.abs(r.sx * r.sy));
    own = r;
  }
  return {
    eff, vis: eff * size,
    x: own.tx + own.left, y: own.ty + own.top, width: own.width, height: own.height,
    rotate: own.deg, scale: own.sx * own.sy,
  };
}

const elementKey = (chainLinks) => chainLinks.map((l) => `${l.src}${l.key}`).join('|');
function labelOf(chainLinks) {
  const last = chainLinks[chainLinks.length - 1];
  return `${last.src || last.type}${last.text ? ` "${last.text.slice(0, 40)}"` : ''}`;
}

const PROPS = [
  ['opacity', 'eff', JUMP.opacity, BACK.opacity, (v) => v.toFixed(2)],
  ['x', 'x', JUMP.px, BACK.px, (v) => v.toFixed(1)],
  ['y', 'y', JUMP.px, BACK.px, (v) => v.toFixed(1)],
  ['width', 'width', JUMP.px, BACK.px, (v) => v.toFixed(1)],
  ['height', 'height', JUMP.px, BACK.px, (v) => v.toFixed(1)],
  ['rotate', 'rotate', JUMP.deg, BACK.deg, (v) => `${v.toFixed(1)}°`],
  ['scale', 'scale', JUMP.scale, BACK.scale, (v) => v.toFixed(2)],
];

/**
 * Every element that jumps at the change into beat `n`: the new beat's first frame,
 * against the frame the old beat would have drawn next.
 */
function jumpsInto(snaps, n) {
  const out = [];
  const { last: A, cont: K } = snaps[n - 1];
  const { first: B, last: C } = snaps[n];
  for (const [key, b] of B) {
    const a = A.get(key), k = K.get(key), c = C.get(key);
    if (!a || !k || !c) continue;
    for (const [what, f, lim, back, fmt] of PROPS) {
      const dev = Math.abs(b.read[f] - k.read[f]);
      if (!(dev > lim)) continue;
      // Opacity and scale ARE visibility, so a change of either is seen if either
      // side can be seen; anything else has to be visible before and after.
      if (what === 'opacity' || what === 'scale') {
        if (Math.max(a.read.eff, b.read.eff) < SEEN) continue;
      } else if (Math.min(a.read.vis, b.read.vis) < SEEN) continue;
      const returns = Math.abs(c.read[f] - a.read[f]) <= back;
      const shape = what === 'opacity' && !returns ? 'POP' : returns ? 'REPLAY' : 'JUMP';
      out.push({ key, what, shape, label: b.label, style: b.style, text: `${fmt(a.read[f])} → ${fmt(b.read[f])} → ${fmt(c.read[f])}` });
    }
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// PLAYING A LESSON
// ═════════════════════════════════════════════════════════════════════════════

function lessonsFromRoute() {
  const src = fs.readFileSync(ROUTE_FILE, 'utf8');
  const fileOf = new Map();
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'@\/components\/lesson\/cinematic\/(\w+)'/g)) {
    for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean)) fileOf.set(name, m[2]);
  }
  const out = [];
  for (const m of src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)) {
    const file = fileOf.get(m[2]);
    if (file) out.push({ id: m[1], file });
  }
  return out;
}

function scriptFileOf(sceneFile) {
  const src = fs.readFileSync(SOURCE.get(path.resolve(sceneFile)) ?? sceneFile, 'utf8');
  const m = src.match(/import\s*\{[^}]*\bBEATS\b[^}]*\}\s*from\s*'\.\/(\w+)'/);
  return m ? require.resolve(path.join(CIN, m[1])) : null;
}

/** Load a scene fresh, optionally with its script's BEATS replaced. */
function loadScene(sceneFile, scriptFile, beats) {
  delete require.cache[sceneFile];
  PATCH = beats ? { file: scriptFile, BEATS: beats } : null;
  try {
    return require(sceneFile).default;
  } finally {
    PATCH = null;
    if (beats) delete require.cache[sceneFile];
  }
}

const graded = (b) => !!(b && (b.interact || b.mc || b.tap));
const sharedValue = (v) => ({ value: v });

/** S12 — a painted, childless View with nothing giving it a height. */
function stripsIn(elements, n, into) {
  for (const ch of elements) {
    const link = ch[ch.length - 1];
    if (!link.childless || link.type.endsWith('Text')) continue;
    const st = styleOf(link);
    const painted = (st.backgroundColor && st.backgroundColor !== 'transparent')
      || +st.borderWidth > 0 || +st.borderTopWidth > 0 || +st.borderBottomWidth > 0;
    if (!painted) continue;
    const tall = st.height != null || st.minHeight != null || st.aspectRatio != null
      || (st.top != null && st.bottom != null) || +st.flex > 0 || +st.flexGrow > 0;
    const wide = st.width != null || (st.left != null && st.right != null) || st.minWidth != null;
    if (tall || !wide) continue;
    const pad = (+st.paddingTop || +st.paddingVertical || +st.padding || 0)
      + (+st.paddingBottom || +st.paddingVertical || +st.padding || 0)
      + (+st.borderTopWidth || +st.borderWidth || 0) + (+st.borderBottomWidth || +st.borderWidth || 0);
    if (pad <= 0) continue;   // zero tall: draws nothing, a different question
    if (!into.has(link.src)) into.set(link.src, { src: link.src, h: pad, beat: n });
  }
}

/**
 * S12 — words that ride in their own layer, anchored where a plate is, and do not
 * move when the plate does. The words' layer and the plate are siblings sharing a
 * left and a top; if one tips, slides or scales and the other does not, the words
 * are no longer on the thing they label.
 */
function detachedIn(elements, n, into) {
  const positioned = (link) => {
    const s = styleOf(link);
    return s.position === 'absolute' && s.left != null && s.top != null ? s : null;
  };
  for (const ch of elements) {
    const words = ch[ch.length - 1];
    if (!words.type.endsWith('Text') || !words.text) continue;
    let ci = -1;
    for (let k = ch.length - 2; k >= 0; k--) { if (positioned(ch[k])) { ci = k; break; } }
    if (ci < 0) continue;
    const layer = ch[ci];
    const ls = positioned(layer);
    const parentKey = elementKey(ch.slice(0, ci));
    for (const other of elements) {
      if (other.length !== ci + 1 || other[ci] === layer) continue;
      if (elementKey(other.slice(0, ci)) !== parentKey) continue;
      const plate = other[ci];
      const ps = positioned(plate);
      if (!ps) continue;
      // A border paints only in a colour: `tagBare` hid the old tag's rule by making it
      // transparent and kept its width, and counting width alone called that layer a
      // plate — which is how the defect this rule is named for slipped past it once.
      const paints = (s) => (s.backgroundColor && s.backgroundColor !== 'transparent')
        || (+s.borderWidth > 0 && s.borderColor !== 'transparent');
      if (!paints(ps)) continue;
      // The split-plate signature is a words layer that paints NOTHING itself: an
      // orb carrying its own letter, or a box carrying its label, is one object.
      if (paints(ls)) continue;
      if (Math.abs(+ps.left - +ls.left) > 2 || Math.abs(+ps.top - +ls.top) > 2) continue;
      const pv = readElement(other), lv = readElement(ch.slice(0, ci + 1));
      if (Math.min(pv.vis, lv.vis) < SEEN) continue;
      const pr = readLink(plate), lr = readLink(layer);
      // A fill that WIPES in under its words (a scaleX from the edge) is the design
      // of a stamped card; only a plate that tips or slides away has left them.
      const moved = Math.max(Math.abs(pr.tx - lr.tx), Math.abs(pr.ty - lr.ty)) > 4
        || Math.abs(pr.deg - lr.deg) > 3;
      if (moved && !into.has(`${layer.src}|${plate.src}`)) {
        into.set(`${layer.src}|${plate.src}`, { words: words.text, layer: layer.src, plate: plate.src, beat: n });
      }
    }
  }
}

/**
 * Play beats 0..upto the way a patient reader does. Returns, per beat, the element
 * readings on its first frame, its last frame, and the frame it would have drawn
 * next had nobody tapped — plus any plate that does not hold its words.
 */
function play(Scene, BEATS, sceneFile, upto = BEATS.length - 1) {
  const api = new Proxy({
    clock: sharedValue(0), bt: sharedValue(0), bi: sharedValue(0), si: sharedValue(0), qv: sharedValue(0),
    i: 0, beat: BEATS[0], picked: null, onPick: () => {},
    dragPos: sharedValue(0.5), dragPos2: sharedValue(0.5), pickPos: sharedValue(0.5),
    gazeX: sharedValue(200), gazeY: sharedValue(300), gazeOn: sharedValue(0),
  }, { get: (t, k) => (k in t ? t[k] : sharedValue(0)) });

  const inst = newInst();
  const snaps = [];
  const strips = new Map();
  const detached = new Map();
  const steps = Math.round(REST / DT);

  for (let n = 0; n <= upto; n++) {
    api.i = n; api.beat = BEATS[n]; api.bi.value = n; api.bt.value = 0; api.picked = null;
    CUR = inst; inst.idx = 0;
    let tree;
    try { tree = Scene(api); } finally { CUR = null; }
    const elements = walkTree(tree, inst, sceneFile);
    const tracked = elements.filter((ch) => ch[ch.length - 1].tokens.length);

    FRAME++;
    stripsIn(elements, n, strips);

    const snap = () => {
      const m = new Map();
      for (const ch of tracked) {
        m.set(elementKey(ch), {
          read: readElement(ch), label: labelOf(ch),
          style: ch[ch.length - 1].tokens.map((t) => t.__animatedStyle).join(','),
        });
      }
      return m;
    };
    const beatSnaps = {};
    const figs = elements.filter((ch) => ch[ch.length - 1].figD);
    // How far each figure's head and hands travel through the beat — a figure that
    // stands frozen while another talks to him is the other half of N21.
    const figMove = figs.map(() => ({ lo: null, hi: null }));
    const figSample = () => figs.forEach((ch, i) => {
      let B = null;
      try { B = ch[ch.length - 1].figD.value; } catch { B = null; }
      if (!B || !B.head || !B.wrR || !B.wrL) return;
      const v = [B.head[0].translateX, B.head[1].translateY, B.wrR[0].translateX, B.wrR[1].translateY,
        B.wrL[0].translateX, B.wrL[1].translateY].map(Number);
      const m = figMove[i];
      m.lo = m.lo ? m.lo.map((a, j) => Math.min(a, v[j])) : v.slice();
      m.hi = m.hi ? m.hi.map((a, j) => Math.max(a, v[j])) : v.slice();
    });
    for (let f = 0; f <= steps; f++) {
      FRAME++;
      if (f % 6 === 0) figSample();
      if (f === 0) beatSnaps.first = snap();
      else if (f === steps) {
        beatSnaps.last = snap(); detachedIn(elements, n, detached);
        beatSnaps.figs = figs.map((ch) => {
          const link = ch[ch.length - 1];
          let B = null;
          try { B = link.figD.value; } catch { B = null; }
          if (!B || !B.pel || !B.head) return null;
          return {
            src: link.src, role: link.figRole, k: link.figK,
            dir: B.dir < 0 ? -1 : 1,
            x: +B.pel[0].translateX || 0, y: +B.pel[1].translateY || 0,
            hx: +B.head[0].translateX || 0, hy: +B.head[1].translateY || 0,
            opacity: B.opacity ?? 1,
            move: (() => {
              const m = figMove[figs.indexOf(ch)];
              if (!m || !m.lo) return 0;
              const d = m.hi.map((h, j) => h - m.lo[j]);
              // In the figure's OWN units: a child drawn at half size waving is as
              // alive as a man waving, and measures half as far on the stage.
              const kk = link.figK > 0.05 ? link.figK : 1;
              return +(Math.max(Math.hypot(d[0], d[1]), Math.hypot(d[2], d[3]), Math.hypot(d[4], d[5])) / kk).toFixed(1);
            })(),
          };
        }).filter(Boolean);
      }
      else {
        // Every style is still evaluated every frame: `carry` and `keepHeld` write
        // their memory as they are read, exactly as on the UI thread.
        for (const ch of tracked) for (const l of ch) for (const tk of l.tokens) evalToken(tk);
      }
      api.bt.value += DT;
      api.clock.value += DT;
    }
    // The frame this beat would have drawn next — at the same clock the next beat's
    // first frame is drawn at.
    FRAME++;
    beatSnaps.cont = snap();
    snaps.push(beatSnaps);
  }
  return { snaps, strips: [...strips.values()], detached: [...detached.values()] };
}

function checkLesson({ id, file }) {
  const sceneFile = path.join(CIN, `${file}.tsx`);
  const tokenStart = nextToken;
  const Scene = loadScene(sceneFile, null, null);
  if (typeof Scene !== 'function' || Scene[STUB]) return { bespoke: true };
  const scriptFile = scriptFileOf(sceneFile);
  if (!scriptFile) return { bespoke: true };
  const BEATS = require(scriptFile).BEATS;
  if (!Array.isArray(BEATS) || !BEATS.length) return { bespoke: true };

  const { snaps, strips, detached } = play(Scene, BEATS, sceneFile);

  // REPLAY_FACING=<file> records, for every lesson with ONE figure on its stage,
  // which way he faces at rest on each beat (null where he is not drawn) — what
  // `make:visitor` needs to stand a visitor where the lead can see him (N21).
  if (process.env.REPLAY_FACING) {
    const f = process.env.REPLAY_FACING;
    const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    const per = snaps.map((s) => (s.figs || []).filter((fg) => fg.opacity > 0.3));
    if (per.every((v) => v.length <= 1)) cur[id] = per.map((v) => (v.length ? v[0].dir : null));
    fs.writeFileSync(f, JSON.stringify(cur));
  }

  // REPLAY_FIGS=<file> records every beat's settled figures — place, facing, head.
  if (process.env.REPLAY_FIGS) {
    const f = process.env.REPLAY_FIGS;
    const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    cur[id] = snaps.map((s) => s.figs || []);
    fs.writeFileSync(f, JSON.stringify(cur));
  }

  // REPLAY_DUMP=<file> records every beat's SETTLED frame by tree position (no line
  // numbers), so a timing-only edit can be shown to leave every resting picture alone.
  if (process.env.REPLAY_DUMP) {
    const f = process.env.REPLAY_DUMP;
    const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    cur[id] = snaps.map((s) => Object.fromEntries([...s.last].map(([k, v]) => [k.replace(/[\w.]+\.tsx:\d+/g, ''), v.read])));
    fs.writeFileSync(f, JSON.stringify(cur));
  }

  const findings = [];
  for (let n = 1; n < BEATS.length; n++) {
    const found = jumpsInto(snaps, n);
    if (!found.length) continue;
    const advisory = graded(BEATS[n - 1]);
    let held = new Set();
    if (!advisory) {
      // THE COUNTERFACTUAL: this beat, with nothing changed from the one before.
      const patched = BEATS.slice();
      patched[n] = { ...BEATS[n - 1] };
      const S2 = loadScene(sceneFile, scriptFile, patched);
      const cf = play(S2, patched, sceneFile, n);
      held = new Set(jumpsInto(cf.snaps, n).map((j) => `${j.key}|${j.what}`));
    }
    for (const j of found) {
      const verdict = advisory ? 'ADVISORY'
        : held.has(`${j.key}|${j.what}`) ? 'C20c'
          : j.shape === 'REPLAY' ? 'PULSE' : 'CUT';
      findings.push({ ...j, n, verdict });
    }
  }
  delete require.cache[sceneFile];

  const errors = [...TOKENS.values()]
    .filter((s) => s.token.__animatedStyle >= tokenStart && s.error)
    .map((s) => String(s.error.message || s.error));
  return { findings, strips, detached, errors: [...new Set(errors)].slice(0, 3), figs: snaps.map((sn) => sn.figs || []), summary: BEATS.map((b) => !!b.summary) };
}

// ═════════════════════════════════════════════════════════════════════════════

console.log('\nNOTHING MOVES ON A BEAT WHERE IT DID NOT CHANGE (C20c) · A PLATE HOLDS ITS WORDS (S12)\n');

const started = Date.now();
const lessons = lessonsFromRoute().filter((l) => !ONLY || ONLY.has(l.id));
const rows = [];
const unread = [];
let bespoke = 0;
for (const l of lessons) {
  try {
    const r = checkLesson(l);
    if (r.bespoke) { bespoke++; continue; }
    rows.push({ ...l, ...r });
  } catch (e) {
    unread.push({ id: l.id, why: String(e && e.message ? e.message : e).split('\n')[0].slice(0, 160) });
  }
}

// One finding per style per property per beat change: three posts sharing one
// animated style are one cause.
const grouped = (list) => {
  const m = new Map();
  for (const f of list) {
    const k = `${f.id}|${f.n}|${f.what}|${f.style}|${f.verdict}`;
    if (!m.has(k)) m.set(k, { ...f, count: 0 });
    m.get(k).count++;
  }
  return [...m.values()];
};
const all = grouped(rows.flatMap((r) => r.findings.map((f) => ({ id: r.id, ...f }))));
const c20c = all.filter((f) => f.verdict === 'C20c');
const cuts = all.filter((f) => f.verdict === 'CUT');
const pulses = all.filter((f) => f.verdict === 'PULSE');
const advisory = all.filter((f) => f.verdict === 'ADVISORY');
const strips = rows.flatMap((r) => r.strips.map((s) => ({ id: r.id, ...s })));
const detached = rows.flatMap((r) => r.detached.map((s) => ({ id: r.id, ...s })));
const styleErrors = rows.filter((r) => r.errors.length);

const byLesson = (list) => new Set(list.map((f) => f.id)).size;
const show = (list, title) => {
  if (!list.length) return;
  console.log(`  ${title}`);
  for (const f of list) {
    const also = f.count > 1 ? `  (+${f.count - 1} more sharing its style)` : '';
    console.log(`    ${f.id.padEnd(28)} beat ${String(f.n - 1).padStart(2)}→${String(f.n).padEnd(2)} ${f.shape.padEnd(6)} ${f.what.padEnd(7)} ${f.text.padEnd(26)} ${f.label}${also}`);
  }
  console.log('');
};

let fail = 0;
const ok = (name, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) fail++;
};

console.log(`  ${rows.length} lessons played at 60fps, ${REST}s a beat, in ${((Date.now() - started) / 1000).toFixed(0)}s` +
  `${bespoke ? ` · ${bespoke} with a bespoke player, not a scene` : ''}\n`);

show(c20c, 'C20c — moves on a beat where nothing changed:');
if (strips.length) {
  console.log('  STRIP — a painted box with no children and no height (S12):');
  for (const s of strips) console.log(`    ${s.id.padEnd(28)} ${s.src}  ${s.h.toFixed(1)} tall, from beat ${s.beat}`);
  console.log('');
}
if (detached.length) {
  console.log('  DETACH — words that do not move with the plate they sit on (S12):');
  for (const d of detached) console.log(`    ${d.id.padEnd(28)} beat ${d.beat}  words ${d.layer} "${d.words.slice(0, 40)}"  plate ${d.plate}`);
  console.log('');
}
if (VERBOSE) {
  show(cuts, 'CUT — jumps in one frame where the beat did change (group L):');
  show(pulses, 'PULSE — an authored one-shot that returns to rest (not counted):');
  show(advisory, 'ADVISORY — leaving a graded beat (offline nobody answers):');
}
if (styleErrors.length) {
  console.log('  STYLE ERRORS — an animated style threw, so its element read as unanimated:');
  for (const r of styleErrors) console.log(`    ${r.id}: ${r.errors.join(' · ')}`);
  console.log('');
}
if (unread.length) {
  console.log('  UNREAD — could not be loaded or played:');
  for (const u of unread) console.log(`    ${u.id}: ${u.why}`);
  console.log('');
}

// ── N21 · TWO FIGURES ARE TALKING ───────────────────────────────────────────
//
// "if there is more than 1 stickman on screen they must be communicating and
// operating in some way that looks natural" (owner, 2026-09-25). Read off each
// real scene's settled frame: every figure on stage faces at least one other
// figure; nobody stands frozen while another talks; and the lead faces the visitor
// the player walks in (AA8), who until now could arrive behind his back.
const facingAway = [];
const frozenListeners = [];
for (const r of rows) {
  (r.figs || []).forEach((beat, n) => {
    // The summary card replaces the stage, and a figure still off the edge is
    // walking on — neither is two people standing together.
    if (r.summary && r.summary[n]) return;
    const vis = beat.filter((fg) => fg.opacity > 0.3 && Math.abs(fg.move) < 1000 && fg.x > -10 && fg.x < 410);
    if (vis.length < 2) return;
    for (const fg of vis) {
      const faces = vis.some((o) => o !== fg && Math.abs(o.x - fg.x) > 4 && Math.sign(o.x - fg.x) === fg.dir);
      if (!faces) facingAway.push(`${r.id} beat ${n}: the figure at x ${Math.round(fg.x)} faces nobody`);
    }
    if (vis.some((fg) => fg.move > TALKING)) {
      for (const fg of vis) {
        if (fg.move <= STILL) frozenListeners.push(`${r.id} beat ${n}: the figure at x ${Math.round(fg.x)} stands frozen while another talks`);
      }
    }
  });
}
const visitorAway = [];
{
  const { VISITOR } = await loadTs('data/lessonVisitor.ts');
  for (const r of rows) {
    const cue = VISITOR[r.id];
    if (!cue || !r.figs) continue;
    for (let n = cue.enter + 1; n < r.figs.length; n++) {
      if (r.summary && r.summary[n]) continue;
      const vis = (r.figs[n] || []).filter((fg) => fg.opacity > 0.3 && fg.x > -10 && fg.x < 410);
      if (!vis.length) continue;
      const lead = vis.reduce((a, fg) => (Math.abs(fg.x - cue.x) < Math.abs(a.x - cue.x) ? fg : a));
      const toward = Math.sign(cue.x - lead.x);
      // `turn` is the player turning the lead round to face him once he has arrived.
      if (lead.dir !== toward && !cue.turn) {
        visitorAway.push(`${r.id} beat ${n}: the visitor at x ${cue.x} is behind the lead at x ${Math.round(lead.x)}`);
      }
      if (cue.dir !== -toward) visitorAway.push(`${r.id} beat ${n}: the visitor faces away from the lead`);
    }
  }
}
const showN21 = (list, title) => {
  if (!list.length) return;
  console.log(`  ${title}`);
  for (const l of list.slice(0, VERBOSE ? 400 : 40)) console.log(`    ${l}`);
  if (!VERBOSE && list.length > 40) console.log(`    …and ${list.length - 40} more (REPLAY_VERBOSE=1)`);
  console.log('');
};
showN21(facingAway, 'FACING — a figure on a shared stage faces nobody (N21):');
showN21(frozenListeners, 'FROZEN — a figure stands still while another talks (N21):');
showN21(visitorAway, 'VISITOR — the visitor and the lead are not facing (N21):');

ok('nothing moves on a beat where nothing changed (C20c)', c20c.length <= C20C_BUDGET,
  `${c20c.length} in ${byLesson(c20c)} lessons, budget ${C20C_BUDGET}`);
ok('no painted box is only as tall as its padding (S12)', strips.length <= STRIP_BUDGET,
  `${strips.length}, budget ${STRIP_BUDGET}`);
ok('no words are left behind when their plate moves (S12)', detached.length <= DETACH_BUDGET,
  `${detached.length}, budget ${DETACH_BUDGET}`);
ok('cuts at a beat change stay within budget (group L)', cuts.length <= CUT_BUDGET,
  `${cuts.length} in ${byLesson(cuts)} lessons${Number.isFinite(CUT_BUDGET) ? `, budget ${CUT_BUDGET}` : ''}`);
ok('every animated style could be evaluated', styleErrors.length <= STYLE_ERROR_BUDGET,
  `${styleErrors.length} lessons, budget ${STYLE_ERROR_BUDGET}`);
ok('every figure on a shared stage faces another (N21)', facingAway.length <= FACING_BUDGET,
  `${facingAway.length}, budget ${FACING_BUDGET}`);
ok('nobody stands frozen while another talks to him (N21)', frozenListeners.length <= FROZEN_BUDGET,
  `${frozenListeners.length}, budget ${FROZEN_BUDGET}`);
ok('the lead and the visitor face each other (N21)', visitorAway.length <= VISITOR_FACE_BUDGET,
  `${visitorAway.length}, budget ${VISITOR_FACE_BUDGET}`);
ok('every scene could be run', unread.length <= UNREAD_BUDGET, `${unread.length} unread, budget ${UNREAD_BUDGET}`);
console.log(`\n  not counted: ${pulses.length} authored pulses, ${advisory.length} changes out of a graded beat${VERBOSE ? '' : ' (REPLAY_VERBOSE=1 lists them)'}.`);

console.log(fail ? `\n${fail} rule(s) broken.\n` : '\nnothing moves that did not change, and every plate holds its words.\n');
process.exit(fail ? 1 : 0);
