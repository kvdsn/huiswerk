// Voice command matching for the dictation screen.

const NEXT = ['ja', 'klaar', 'volgende', 'oke', 'ok', 'okay', 'okee', 'oke dan', 'ja klaar', 'jaja'];
const REPEAT = ['wablieft', 'wablief', 'wat', 'zeg nog eens', 'zeg het nog eens', 'nog eens', 'nog een keer', 'herhaal'];

// Lowercase, strip accents (oké -> oke), turn punctuation into spaces, collapse whitespace.
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// True if `phrase` occurs as whole word(s) in the normalized text.
function hasPhrase(padded, phrase) {
  return padded.includes(` ${phrase} `);
}

// Returns 'next', 'repeat' or null. Repeat wins when both occur.
export function matchCommand(transcript) {
  const padded = ` ${normalize(transcript)} `;
  if (REPEAT.some((p) => hasPhrase(padded, p))) return 'repeat';
  // "ik ben nog niet klaar" / "nee, nog niet" must not skip the word.
  if (hasPhrase(padded, 'niet')) return null;
  if (NEXT.some((p) => hasPhrase(padded, p))) return 'next';
  return null;
}

// First non-null match over a list of recognition alternatives.
export function matchCommandInAlternatives(list) {
  for (const t of list ?? []) {
    const m = matchCommand(t);
    if (m) return m;
  }
  return null;
}
