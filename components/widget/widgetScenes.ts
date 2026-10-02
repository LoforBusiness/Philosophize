// THE WIDGET'S PICTURE: his day, drawn to the widget's own size.
//
// Imports only the generated poses, which import nothing, so this runs in plain
// Node for the contact sheet (`npm run sheet:widget`) and the check.
//
// The sky follows the clock — a low sun in the morning, a high one in the
// afternoon, a setting one in the evening, a moon at night — and he stands in it
// acting out how the day is going (lib/widget/mood.ts). A lapsed streak greys the
// sky and rains on him. Flat fills, two tones, layered hills and no outlines: the
// Quick Start pictures' style (§19), so the widget looks like the app it opens.
//
// ── DRAWN TO SIZE, NEVER SLICED ─────────────────────────────────────────────
// SvgWidget hands androidsvg's Picture to an ImageView with no scaleType, so it is
// FIT-CENTERED (the old backgrounds.ts header has the whole story). So every
// scene's viewBox is exactly the box it is drawn into, in dp, and the corners are
// rounded in the SVG itself: the panel beside it is a RemoteViews view with its
// own radius, and the two must meet without a square corner showing.

import { WIDGET_POSES, type WidgetPose } from './widgetPoses';

export interface ScenePalette {
  sky: string; far: string; near: string; ground: string;
  light: string; // the sun or the moon
  figure: string;
  /** Streak pill and any type laid on the picture. */
  pillBg: string; pillFg: string;
  /** Type laid straight on the sky (the small widget's line). */
  text: string;
}

export const SCENES: Record<'morning' | 'afternoon' | 'evening' | 'night' | 'rain', ScenePalette> = {
  morning:   { sky: '#F6D2B0', far: '#E9B38E', near: '#B9C49A', ground: '#8E9C6C', light: '#FFF3DD', figure: '#1A1A1A', pillBg: '#FFF4E6', pillFg: '#3A2A20', text: '#2A2018' },
  afternoon: { sky: '#A9D6E2', far: '#86BCC9', near: '#9DB98A', ground: '#6F8E5C', light: '#FFF7E3', figure: '#1A1A1A', pillBg: '#F2FAFC', pillFg: '#14303A', text: '#10242B' },
  evening:   { sky: '#E6896B', far: '#C97559', near: '#B5736A', ground: '#A3605F', light: '#FFD9A8', figure: '#1A1A1A', pillBg: '#FFF1E8', pillFg: '#4A2016', text: '#1A0B07' },
  night:     { sky: '#1E2742', far: '#2A3658', near: '#253049', ground: '#171E33', light: '#F4EBD6', figure: '#F4EBD6', pillBg: '#33405F', pillFg: '#F7F1E4', text: '#F7F1E4' },
  rain:      { sky: '#AEB6BF', far: '#97A1AC', near: '#7D8794', ground: '#626C79', light: '#C9CFD6', figure: '#1A1A1A', pillBg: '#EEF1F4', pillFg: '#232A33', text: '#1D232B' },
};

export function paletteFor(tod: string, rain: boolean): ScenePalette {
  if (rain) return SCENES.rain;
  if (tod === 'late') return SCENES.night;
  return SCENES[tod as keyof typeof SCENES] ?? SCENES.morning;
}

// Contrast arithmetic, for the one colour this file is handed rather than owns: a
// subject's hue, used as the fact's kicker on the paper panel. Personal Growth's
// olive measures 4.42:1 there, so a hue under 4.5 is taken toward ink until it
// clears — the same hue, a little deeper, never a different colour.
const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h: string) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');
export function inkFor(hue: string, ground: string, floor = 4.6): string {
  const [r, g, b] = rgb(hue);
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const c = `#${hex2(r + (26 - r) * t)}${hex2(g + (26 - g) * t)}${hex2(b + (26 - b) * t)}`;
    if (contrast(c, ground) >= floor) return c.toUpperCase();
  }
  return '#1A1A1A';
}

/** The streak seal's colours: the ember disc the app's streak wears. */
export const SEAL_EMBER = '#D35E36';
export const SEAL_CORE = '#F7C9A4';

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** Rounded rectangle with each corner's radius given (r = [tl, tr, br, bl]). */
function roundRect(w: number, h: number, [tl, tr, br, bl]: number[]): string {
  return `M${tl},0 H${n1(w - tr)} Q${n1(w)},0 ${n1(w)},${tr} V${n1(h - br)} Q${n1(w)},${n1(h)} ${n1(w - br)},${n1(h)} H${bl} Q0,${n1(h)} 0,${n1(h - bl)} V${tl} Q0,0 ${tl},0 Z`;
}

export interface SceneSpec {
  tod: string; rain: boolean; pose: string; mug: boolean; crate: boolean;
}

/**
 * His day as an SVG string, w × h dp.
 *
 * `corners` are the four radii in dp — the split widget rounds only the left two,
 * the small widget all four. `figX` is where he stands, as a share of the width.
 */
export function sceneSvg(spec: SceneSpec, w: number, h: number, corners: number[], figX = 0.56): string {
  const P = paletteFor(spec.tod, spec.rain);
  const gy = h * 0.8;
  let s = `<rect width="${n1(w)}" height="${n1(h)}" fill="${P.sky}"/>`;

  // The light: where the sun is IS the time of day.
  const r = Math.max(7, h * 0.09);
  const sun: Record<string, [number, number]> = { morning: [0.2, 0.6], afternoon: [0.3, 0.2], evening: [0.78, 0.7] };
  if (spec.rain) {
    for (let i = 0; i < 22; i++) {
      const x = (i * 37 + 11) % w, y = (i * 53 + 7) % Math.max(8, gy - 8);
      s += `<rect x="${n1(x)}" y="${n1(y)}" width="1.3" height="6.5" fill="#E8EDF2" opacity="0.6" transform="rotate(14 ${n1(x)} ${n1(y)})"/>`;
    }
  } else if (spec.tod === 'night' || spec.tod === 'late') {
    const mx = w * 0.8, my = h * 0.22;
    s += `<circle cx="${n1(mx)}" cy="${n1(my)}" r="${n1(r)}" fill="${P.light}"/><circle cx="${n1(mx + r * 0.45)}" cy="${n1(my - r * 0.25)}" r="${n1(r * 0.85)}" fill="${P.sky}"/>`;
    for (const [a, b] of [[0.12, 0.42], [0.3, 0.12], [0.5, 0.3], [0.6, 0.1], [0.93, 0.48], [0.4, 0.5]]) {
      s += `<rect x="${n1(w * a)}" y="${n1(h * b)}" width="2" height="2" fill="${P.light}" opacity="0.8"/>`;
    }
  } else {
    const [sx, sy] = sun[spec.tod] ?? sun.morning;
    s += `<circle cx="${n1(w * sx)}" cy="${n1(h * sy)}" r="${n1(r * 1.15)}" fill="${P.light}"/>`;
  }

  // Two layers of hills and the ground he stands on.
  s += `<path d="M0 ${n1(gy - h * 0.14)} Q ${n1(w * 0.25)} ${n1(gy - h * 0.26)} ${n1(w * 0.5)} ${n1(gy - h * 0.12)} T ${n1(w)} ${n1(gy - h * 0.16)} V ${n1(h)} H 0 Z" fill="${P.far}"/>`;
  s += `<path d="M0 ${n1(gy - h * 0.04)} Q ${n1(w * 0.35)} ${n1(gy - h * 0.13)} ${n1(w * 0.7)} ${n1(gy - h * 0.02)} T ${n1(w)} ${n1(gy - h * 0.05)} V ${n1(h)} H 0 Z" fill="${P.near}"/>`;
  s += `<rect y="${n1(gy)}" width="${n1(w)}" height="${n1(h - gy)}" fill="${P.ground}"/>`;

  // HIM. Scaled so a standing figure is a little over half the height; a seated
  // or lying one keeps the same scale, so he does not grow when he sits down.
  const pose: WidgetPose = (WIDGET_POSES as Record<string, WidgetPose>)[spec.pose] ?? WIDGET_POSES.hipsWait;
  const k = (h * 0.56) / 103; // a standing pose is ~103 units tall
  const cx = w * figX - ((pose.x0 + pose.x1) / 2) * k;
  // A shadow pill under him, the app's own construction (§17 group AG).
  const footW = Math.max(18, (pose.x1 - pose.x0) * k * 0.9);
  s += `<rect x="${n1(cx + ((pose.x0 + pose.x1) / 2) * k - footW / 2)}" y="${n1(gy - 1)}" width="${n1(footW)}" height="3" rx="1.5" fill="#000000" opacity="0.14"/>`;
  if (spec.crate) {
    // The sip pose sits him at 21 units; a crate of that height goes under him.
    const cw = 30 * k, ch = 21 * k;
    s += `<rect x="${n1(cx - cw / 2)}" y="${n1(gy - ch)}" width="${n1(cw)}" height="${n1(ch)}" rx="${n1(2 * k)}" fill="#8A5A3A"/><rect x="${n1(cx - cw / 2)}" y="${n1(gy - ch)}" width="${n1(cw)}" height="${n1(ch * 0.28)}" rx="${n1(2 * k)}" fill="#A8744E"/>`;
  }
  s += `<path transform="translate(${n1(cx)} ${n1(gy)}) scale(${k.toFixed(4)})" d="${pose.d}" fill="${P.figure}"/>`;

  if (spec.mug) {
    // In his hand when he is drinking; otherwise set down on the grass beside him.
    const held = spec.pose === 'sip';
    const mx = held ? cx + pose.hand.x * k + 7 * k : cx + pose.x1 * k + 10 * k;
    const my = held ? gy + pose.hand.y * k - 2 * k : gy;
    const m = Math.max(0.55, k * 0.95);
    s += `<g transform="translate(${n1(mx)} ${n1(my)}) scale(${m.toFixed(3)})">`
      + `<rect x="-6" y="-13" width="12" height="13" rx="2.5" fill="#E2E0D8"/><rect x="-6" y="-13" width="12" height="4" rx="2" fill="#F7F5EE"/>`
      + `<path d="M6 -10 q6 0 6 4 q0 4 -6 4" stroke="#E2E0D8" stroke-width="2.4" fill="none"/>`
      + `<path d="M-2 -16 q-2 -3 0 -6 M2.5 -16 q-2 -3 0 -6" stroke="${P.light}" stroke-width="1.4" fill="none" opacity="0.8"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n1(w)}" height="${n1(h)}" viewBox="0 0 ${n1(w)} ${n1(h)}">`
    + `<defs><clipPath id="c"><path d="${roundRect(w, h, corners)}"/></clipPath></defs>`
    + `<g clip-path="url(#c)">${s}</g></svg>`;
}
