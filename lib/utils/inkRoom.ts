// ROOM FOR A LETTER'S INK, IN THE TEXT ITSELF (LESSON_RULES AQ2).
//
// Android's TextView clips what it draws to its CONTENT box (inside any padding), and that
// box is laid out from the letters' ADVANCES. A handwriting or italic face draws past them:
// Caveat up to 0.23 of its size past its last letter, Playfair Bold Italic 0.19 before its
// first, so on a phone the edge letters lose a sliver while a browser, which does not clip,
// shows them whole. Padding cannot help, because the clip sits inside it.
//
// For a label on a plate, the fix is a content box wider than the letters (stretch it).
// For text that WRAPS, or a name dropped into many places, the room has to travel with the
// words, and a no-break space does it: Caveat's is 0.24 em, wider than any of its letters
// reach, and the line breaker counts it as part of the line's width (only ordinary spaces
// may hang past the edge). Zero imports.

const NBSP = ' ';
const ZWSP = '​';

/**
 * Wrapped text: every word carries a no-break space, and the break opportunity moves to a
 * zero-width space after it. The gaps between words are exactly as wide as before and the
 * text breaks where it did, but every line now ends on a space wide enough to hold the last
 * letter's ink.
 */
export function inkWrap(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim().split(/ +/).join(NBSP + ZWSP) + NBSP)
    .join('\n');
}

/** A single centred line (a name): a no-break space each side, so both edges have room. */
export function inkPad(text: string): string {
  return NBSP + text + NBSP;
}
