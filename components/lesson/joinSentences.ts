// Joins title/body fragments into one passage without doubling punctuation —
// "Long ago." + "Greece." → "Long ago. Greece." (not "Long ago.. Greece.").
export function joinSentences(...parts: Array<string | undefined>): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => !!p)
    .map((p) => (/[.!?…:]$/.test(p) ? p : `${p}.`))
    .join(' ');
}
