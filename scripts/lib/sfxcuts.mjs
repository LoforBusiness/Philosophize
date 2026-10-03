// ─────────────────────────────────────────────────────────────────────────────
// THE SOUND EFFECTS' SOURCES AND CUTS (LESSON_RULES AT6), read by scripts/make-sfx.mjs,
// which makes the clips, and scripts/check-sfx.mjs, which holds them. Zero imports.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Where each recording comes from. `id` is Freesound's, and `licence` was read off the
 * sound's own page when it was fetched (not trusted from a search filter).
 */
export const SOURCES = {
  crowd: { id: 546676, by: 'trezz77', title: 'Crowd talking / murmur', url: 'https://freesound.org/people/trezz77/sounds/546676/', licence: 'CC0 1.0' },
  laugh: { id: 346682, by: 'deleted_user_2104797', title: 'Crowd awkward laughter.wav', url: 'https://freesound.org/s/346682/', licence: 'CC0 1.0' },
  murmur: { id: 466767, by: 'stewadosan', title: 'Murmur.wav', url: 'https://freesound.org/people/stewadosan/sounds/466767/', licence: 'CC0 1.0' },
  gasp: { id: 324898, by: 'deleted_user_2104797', title: 'Crowd shock.wav', url: 'https://freesound.org/s/324898/', licence: 'CC0 1.0' },
  cheer: { id: 365132, by: 'SoundsExciting', title: 'Crowd Cheering', url: 'https://freesound.org/people/SoundsExciting/sounds/365132/', licence: 'CC0 1.0' },
  door: { id: 125957, by: 'Ryding', title: 'Opening a creaking door', url: 'https://freesound.org/people/Ryding/sounds/125957/', licence: 'CC0 1.0' },
  steps: { id: 331451, by: 'ralph.whitehead', title: 'Walking On A Wooden Floor', url: 'https://freesound.org/people/ralph.whitehead/sounds/331451/', licence: 'CC0 1.0' },
  pour: { id: 163733, by: 'mrbriandesign', title: 'pouring water 02.wav', url: 'https://freesound.org/people/mrbriandesign/sounds/163733/', licence: 'CC0 1.0' },
  drip: { id: 683102, by: 'florianreichelt', title: 'water drop', url: 'https://freesound.org/people/florianreichelt/sounds/683102/', licence: 'CC0 1.0' },
  discs: { id: 613312, by: 'eZZin', title: 'Coins.wav', url: 'https://freesound.org/people/eZZin/sounds/613312/', licence: 'CC0 1.0' },
};

/**
 * What the app plays, cut from the sources. `loud` is the integrated loudness each is
 * set to (EBU R128, LUFS): a reaction sits a little under the voices' level, a bed far
 * under it, so the player's own gains start from one common scale.
 */
export const CUTS = [
  { id: 'court', src: 'crowd', from: 4, len: 40, loop: 2.5, loud: -24, bed: true },
  { id: 'muffled', src: 'crowd', from: 4, len: 40, loop: 2.5, loud: -30, bed: true, filter: 'lowpass=f=420,lowpass=f=420' },
  { id: 'laugh', src: 'laugh', from: 0, len: 5.3, fadeOut: 0.8, loud: -20 },
  { id: 'murmur', src: 'murmur', from: 0, len: 5.6, fadeOut: 1.0, loud: -22 },
  { id: 'gasp', src: 'gasp', from: 0, len: 3.8, fadeOut: 0.8, loud: -20 },
  { id: 'cheer', src: 'cheer', from: 0, len: 7.5, fadeOut: 2.0, loud: -20 },
  { id: 'door', src: 'door', from: 0, len: 3.7, fadeOut: 0.4, loud: -22 },
  { id: 'steps', src: 'steps', from: 1.0, len: 2.6, fadeIn: 0.05, fadeOut: 0.5, loud: -26 },
  { id: 'pour', src: 'pour', from: 0, len: 8.3, fadeOut: 1.5, loud: -26 },
  { id: 'drip', src: 'drip', from: 0, len: 1.7, fadeOut: 0.3, loud: -26 },
  { id: 'discs', src: 'discs', from: 0, len: 4.0, fadeOut: 0.6, loud: -22 },
];

